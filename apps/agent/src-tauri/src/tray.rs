use tauri::{AppHandle, menu::{Menu, MenuItem}, tray::TrayIconBuilder, Emitter};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let reconnect_i = MenuItem::with_id(app, "reconnect", "Reconnect", true, None::<&str>)?;
    let status_i = MenuItem::with_id(app, "status", "Status: Connecting...", false, None::<&str>)?;
    
    let menu = Menu::with_items(app, &[&status_i, &reconnect_i, &quit_i])?;

    TrayIconBuilder::with_id("main")
        .menu(&menu)
        .on_menu_event(|app, event| {
            if event.id.as_ref() == "quit" {
                app.exit(0);
            } else if event.id.as_ref() == "reconnect" {
                let _ = app.emit("trigger-reconnect", ());
            }
        })
        .build(app)?;

    Ok(())
}
