use keyring::Entry;

const SERVICE_NAME: &str = "DevFlowHubAgent";
const TOKEN_KEY: &str = "agentToken";

pub fn save_token(token: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, TOKEN_KEY)
        .map_err(|e| format!("Failed to access keychain: {}", e))?;
    entry.set_password(token)
        .map_err(|e| format!("Failed to save token to keychain: {}", e))?;
    Ok(())
}

pub fn get_token() -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, TOKEN_KEY)
        .map_err(|e| format!("Failed to access keychain: {}", e))?;
    entry.get_password()
        .map_err(|e| format!("Failed to read token from keychain: {}", e))
}

pub fn delete_token() -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, TOKEN_KEY)
        .map_err(|e| format!("Failed to access keychain: {}", e))?;
    entry.delete_credential()
        .map_err(|e| format!("Failed to delete token from keychain: {}", e))
}

pub fn get_device_id() -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, "deviceId")
        .map_err(|e| format!("Failed to access keychain: {}", e))?;
    
    if let Ok(existing) = entry.get_password() {
        return Ok(existing);
    }
    
    // Generate new if not exists
    let new_id = uuid::Uuid::new_v4().to_string();
    entry.set_password(&new_id)
        .map_err(|e| format!("Failed to save deviceId: {}", e))?;
        
    Ok(new_id)
}
