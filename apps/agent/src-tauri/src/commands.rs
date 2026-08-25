use std::path::Path;
use std::process::Command;
use std::fs;

#[derive(serde::Deserialize, Debug)]
#[serde(tag = "action")]
pub enum AgentCommand {
    #[serde(rename = "open_folder")]
    OpenFolder { path: String },
    #[serde(rename = "launch_app")]
    LaunchApp {
        #[serde(alias = "app_name")]
        app_name: String,
    },
}

pub fn execute_command(cmd: &AgentCommand) -> Result<String, String> {
    match cmd {
        AgentCommand::OpenFolder { path } => {
            open_folder(path)?;
            Ok(format!("Opened folder: {}", path))
        },
        AgentCommand::LaunchApp { app_name } => {
            launch_app(app_name)?;
            Ok(format!("Launched app: {}", app_name))
        },
    }
}

fn open_folder(path_str: &str) -> Result<(), String> {
    // 1. Convert to Path
    let path = Path::new(path_str);

    // 2. Must exist
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path_str));
    }

    // 3. Must be a directory (Sanitization)
    if !path.is_dir() {
        return Err(format!("Path is not a directory. Refusing to open files for security: {}", path_str));
    }

    // 4. Canonicalize path to prevent path traversal
    let canonical_path = fs::canonicalize(path)
        .map_err(|e| format!("Failed to canonicalize path: {}", e))?;

    // Bug 15 Fix: Enforce allowed directories whitelist
    let mut is_allowed = false;
    let mut allowed_dirs = vec![
        std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Admin".to_string()),
        "D:\\WorkSpace".to_string(),
    ];
    
    if let Some(mut config_path) = dirs::config_dir() {
        config_path.push("DevFlowHub");
        config_path.push("agent_config.json");
        if let Ok(content) = fs::read_to_string(&config_path) {
            if let Ok(config) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(dirs) = config["allowedDirectories"].as_array() {
                    for d in dirs {
                        if let Some(s) = d.as_str() { allowed_dirs.push(s.to_string()); }
                    }
                }
            }
        }
    }

    for allowed_dir in allowed_dirs {
        if let Ok(allowed_path) = fs::canonicalize(Path::new(&allowed_dir)) {
            if canonical_path.starts_with(allowed_path) {
                is_allowed = true;
                break;
            }
        }
    }

    if !is_allowed {
        return Err(format!("Security Error: Path is not in allowed directories whitelist."));
    }

    let mut final_path = canonical_path.to_string_lossy().into_owned();
    if final_path.starts_with(r"\\?\") {
        final_path = final_path.replacen(r"\\?\", "", 1);
    }

    // 5. Execute safely using OS default file explorer without shell injection
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&final_path)
            .spawn()
            .map_err(|e| format!("Failed to launch explorer: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&final_path)
            .spawn()
            .map_err(|e| format!("Failed to launch open: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&final_path)
            .spawn()
            .map_err(|e| format!("Failed to launch xdg-open: {}", e))?;
    }

    Ok(())
}

fn launch_app(app_name: &str) -> Result<(), String> {
    // Bug 3 Fix: Use hardcoded whitelist for binaries instead of dynamic registry
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Admin".to_string());
    
    let exe_path = match app_name.to_lowercase().as_str() {
        "postman" => format!("{}\\AppData\\Local\\Postman\\Postman.exe", user_profile),
        "vscode" | "code" => format!("{}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe", user_profile),
        "chrome" => "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe".to_string(),
        "edge" => "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe".to_string(),
        _ => return Err(format!("Security Error: App '{}' is not in the hardcoded whitelist.", app_name)),
    };

    let path = Path::new(&exe_path);
    if !path.exists() {
        return Err(format!("Executable not found at path: {}", exe_path));
    }

    Command::new(exe_path)
        .spawn()
        .map_err(|e| format!("Failed to launch app: {}", e))?;

    Ok(())
}
