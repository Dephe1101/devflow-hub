pub mod auth;
pub mod websocket;
pub mod tray;
pub mod commands;

use std::fs;
use std::path::PathBuf;

const DEFAULT_WS_URL: &str = "ws://127.0.0.1:4000/agent";

fn get_config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|mut path| {
        path.push("DevFlowHub");
        if !path.exists() {
            let _ = fs::create_dir_all(&path);
        }
        path.push("agent_config.json");
        path
    })
}

fn load_ws_url() -> String {
    if let Some(path) = get_config_path() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(config) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(url) = config["wsUrl"].as_str() {
                    return url.to_string();
                }
            }
        }
    }
    DEFAULT_WS_URL.to_string()
}

fn save_ws_url(url: &str) -> Result<(), String> {
    let path = get_config_path().ok_or("Could not find config directory")?;
    let config = serde_json::json!({ "wsUrl": url });
    fs::write(&path, serde_json::to_string_pretty(&config).unwrap_or_default())
        .map_err(|e| format!("Failed to save config: {}", e))
}

#[tauri::command]
async fn pair_agent(code: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let ws_url = load_ws_url();
    use futures_util::{SinkExt, StreamExt};
    let (mut ws_stream, _) = tokio_tungstenite::connect_async(&ws_url)
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    let device_id = auth::get_device_id()?;

    let payload = serde_json::json!({
        "event": "auth:pairing",
        "data": {
            "deviceId": device_id,
            "pairingCode": code
        }
    });

    ws_stream.send(tokio_tungstenite::tungstenite::protocol::Message::Text(payload.to_string().into()))
        .await
        .map_err(|e| format!("Send failed: {}", e))?;

    // Bug 11 Fix: Thêm timeout cho quá trình Pair Agent
    if let Ok(Some(msg)) = tokio::time::timeout(std::time::Duration::from_secs(15), ws_stream.next()).await {
        if let Ok(tokio_tungstenite::tungstenite::protocol::Message::Text(text)) = msg {
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                if parsed["event"] == "auth:success" {
                    if let Some(token) = parsed["data"]["agentToken"].as_str() {
                        auth::save_token(token)?;
                        // Save WS URL for future reconnections
                        let _ = save_ws_url(&ws_url);
                        
                        // Fix ISSUE-0: Emit trigger-reconnect to wake up main connection immediately
                        use tauri::Emitter;
                        let _ = app_handle.emit("trigger-reconnect", ());
                        
                        return Ok("Success".to_string());
                    }
                } else if parsed["event"] == "error" {
                    return Err(parsed["data"].as_str().unwrap_or("Failed").to_string());
                }
            }
        }
    }

    Err("Pairing failed or timed out".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![pair_agent])
        .setup(|app| {
            #[cfg(desktop)]
            tray::setup_tray(app.handle())?;

            let ws_url = load_ws_url();
            let app_handle_clone = app.handle().clone();
            
            // Bug 8 & Issue 0 Fix: Dùng duy nhất Notify để điều hướng Reconnect (giải quyết stale permit)
            use tauri::Listener;
            
            let reconnect_notify = std::sync::Arc::new(tokio::sync::Notify::new());
            let reconnect_notify_clone = reconnect_notify.clone();

            app.listen("trigger-reconnect", move |_| {
                reconnect_notify_clone.notify_one();
            });

            tauri::async_runtime::spawn(async move {
                let mut retry_count = 0;
                let max_retries = 10;
                let mut base_delay = std::time::Duration::from_secs(2);

                loop {
                    if let Some(tray) = app_handle_clone.tray_by_id("main") {
                        let _ = tray.set_tooltip(Some("Connecting..."));
                    }

                    let connect_start = std::time::Instant::now();
                    match websocket::connect_to_server(&ws_url, &app_handle_clone, reconnect_notify.clone()).await {
                        Ok(_) => {
                            // Bug 9 Fix: Chỉ reset retry_count nếu kết nối giữ được ổn định (>10s)
                            if connect_start.elapsed().as_secs() > 10 {
                                retry_count = 0;
                                base_delay = std::time::Duration::from_secs(2);
                            } else {
                                retry_count += 1;
                            }
                        }
                        Err(e) => {
                            println!("WebSocket connection error: {}", e);
                            retry_count += 1;
                        }
                    }
                    if retry_count > max_retries {
                        println!("Circuit Breaker triggered. Max retries reached.");
                        if let Some(tray) = app_handle_clone.tray_by_id("main") {
                            let _ = tray.set_tooltip(Some("Offline - Right click tray to Reconnect"));
                        }
                        
                        // Bug 8 Fix: Thay vì break vĩnh viễn, đợi tín hiệu reconnect thủ công
                        reconnect_notify.notified().await;
                        println!("Reconnect triggered manually");
                        retry_count = 0;
                        base_delay = std::time::Duration::from_secs(2);
                        continue;
                    }

                    println!("Reconnecting in {} seconds...", base_delay.as_secs());
                    tokio::select! {
                        _ = tokio::time::sleep(base_delay) => {}
                        _ = reconnect_notify.notified() => {
                            retry_count = 0;
                            base_delay = std::time::Duration::from_secs(2);
                        }
                    }
                    base_delay = std::cmp::min(base_delay * 2, std::time::Duration::from_secs(60));
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
