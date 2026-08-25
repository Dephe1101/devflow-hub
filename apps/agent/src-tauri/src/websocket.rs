use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use futures_util::{StreamExt, SinkExt};
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;
use serde_json::json;
use tracing::{info, error};

use crate::auth;

fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut result = 0;
    for (byte_a, byte_b) in a.bytes().zip(b.bytes()) {
        result |= byte_a ^ byte_b;
    }
    result == 0
}

pub async fn connect_to_server(ws_url: &str, app_handle: &tauri::AppHandle, reconnect_notify: Arc<tokio::sync::Notify>) -> Result<(), String> {
    let (ws_stream, _) = connect_async(ws_url)
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    info!("WebSocket connected");
    if let Some(tray) = app_handle.tray_by_id("main") {
        let _ = tray.set_tooltip(Some("Connected"));
    }

    let (write, mut read) = ws_stream.split();
    let write = Arc::new(Mutex::new(write));

    // Try to reconnect with token if exists
    if let Ok(token) = auth::get_token() {
        let device_id = auth::get_device_id().unwrap_or_default();
        let auth_payload = json!({
            "event": "auth:token",
            "data": {
                "agentToken": token,
                "deviceId": device_id
            }
        });
        if let Err(e) = write.lock().await.send(Message::Text(auth_payload.to_string().into())).await {
            error!("Failed to send auth token: {}", e);
        }
    }

    // Spawn heartbeat task: send heartbeat every 30 seconds
    let write_heartbeat = write.clone();
    let heartbeat_handle = tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(30));
        loop {
            interval.tick().await;
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs().to_string())
                .unwrap_or_default();
            let payload = json!({
                "event": "agent:heartbeat",
                "data": {
                    "timestamp": timestamp
                }
            });
            if let Err(e) = write_heartbeat.lock().await.send(Message::Text(payload.to_string().into())).await {
                error!("Failed to send heartbeat: {}", e);
                break;
            }
        }
    });

    let write_clone = write.clone();

    loop {
        tokio::select! {
            msg_res = read.next() => {
                let Some(msg) = msg_res else { break; };
                match msg {
                    Ok(Message::Text(text)) => {
                        info!("Received message: {}", text);
                        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                            if parsed["event"] == "auth:success" {
                                if let Some(token) = parsed["data"]["agentToken"].as_str() {
                                    if let Err(e) = auth::save_token(token) {
                                        error!("Error saving token: {}", e);
                                    } else {
                                        info!("Token saved securely to keychain.");
                                    }
                                }
                            } else if parsed["event"] == "agent:command" {
                                // Task 2: Validate session token per command (Defense-in-depth)
                                let command_token = parsed["data"]["commandToken"].as_str().unwrap_or("");
                                let saved_token = auth::get_token().unwrap_or_default();
                                
                                // Bug 1 & 14 fix: Require non-empty tokens and use constant time comparison
                                let tokens_valid = !saved_token.is_empty() 
                                    && !command_token.is_empty() 
                                    && constant_time_eq(command_token, &saved_token);

                                if !tokens_valid {
                                    error!("Unauthorized command: token mismatch or empty");
                                    let err_payload = json!({ "status": "error", "error": "Unauthorized command" });
                                    if let Err(e) = write_clone.lock().await.send(Message::Text(json!({
                                        "event": "agent:result",
                                        "data": err_payload
                                    }).to_string().into())).await {
                                        error!("Failed to send error result: {}", e);
                                    }
                                    continue;
                                }

                                // Parse command, execute, and send result back to server
                                let result_data = match serde_json::from_value::<crate::commands::AgentCommand>(parsed["data"].clone()) {
                                    Ok(payload) => {
                                        match crate::commands::execute_command(&payload) {
                                            Ok(msg) => {
                                                info!("Command executed: {}", msg);
                                                json!({ "status": "success", "message": msg })
                                            }
                                            Err(e) => {
                                                error!("Command execution failed: {}", e);
                                                json!({ "status": "error", "error": e })
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        error!("Failed to parse command payload: {}", e);
                                        json!({ "status": "error", "error": format!("Invalid command payload: {}", e) })
                                    }
                                };

                                // Send agent:result back to server
                                let result_payload = json!({
                                    "event": "agent:result",
                                    "data": {
                                        "results": [result_data]
                                    }
                                });
                                if let Err(e) = write_clone.lock().await.send(Message::Text(result_payload.to_string().into())).await {
                                    error!("Failed to send agent:result: {}", e);
                                }
                            }
                        }
                    }
                    Ok(Message::Ping(ping)) => {
                        if let Err(e) = write_clone.lock().await.send(Message::Pong(ping)).await {
                            error!("Failed to send pong: {}", e);
                        }
                    }
                    Err(e) => {
                        error!("Error receiving message: {}", e);
                        break;
                    }
                    _ => {}
                }
            }
            _ = reconnect_notify.notified() => {
                info!("Reconnect requested, dropping stale connection");
                break;
            }
        }
    }

    heartbeat_handle.abort();
    info!("WebSocket disconnected");
    Ok(())
}
