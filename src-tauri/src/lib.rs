// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::{Command, Stdio};
use std::io::Write;
use std::fs;
use tauri::Manager;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

/// Minimum valid size for a voice .onnx model file (1 MB).
const MIN_MODEL_SIZE: u64 = 1_000_000;
/// Minimum valid size for a voice .onnx.json config file (100 bytes).
const MIN_CONFIG_SIZE: u64 = 100;
/// Minimum valid size for piper.exe binary (1 MB).
const MIN_PIPER_SIZE: u64 = 1_000_000;

#[tauri::command]
fn is_piper_downloaded(app: tauri::AppHandle) -> bool {
    if let Ok(mut path) = app.path().app_local_data_dir() {
        path.push("bin");
        path.push("piper");
        path.push("piper.exe");
        if path.exists() {
            // Validate that piper.exe is a real binary, not a corrupted/empty file
            if let Ok(meta) = fs::metadata(&path) {
                return meta.len() >= MIN_PIPER_SIZE;
            }
        }
    }
    false
}

#[tauri::command]
fn download_piper(app: tauri::AppHandle) -> Result<String, String> {
    let aura_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    let bin_dir = aura_dir.join("bin");
    let piper_exe = bin_dir.join("piper").join("piper.exe");

    if piper_exe.exists() {
        if let Ok(meta) = fs::metadata(&piper_exe) {
            if meta.len() >= MIN_PIPER_SIZE {
                return Ok("Piper is already installed".to_string());
            }
        }
        // Remove corrupted piper.exe
        let _ = fs::remove_file(&piper_exe);
    }

    fs::create_dir_all(&bin_dir).map_err(|e| e.to_string())?;

    let zip_path = bin_dir.join("piper.zip");
    
    // Optimized PowerShell download: SilentlyContinue disables progress bar (20x faster),
    // UseBasicParsing avoids IE engine dependency
    let download_script = format!(
        "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip' -OutFile '{}' -UseBasicParsing",
        zip_path.to_string_lossy().replace('\\', "/")
    );

    let extract_script = format!(
        "Expand-Archive -Path '{}' -DestinationPath '{}' -Force",
        zip_path.to_string_lossy().replace('\\', "/"),
        bin_dir.to_string_lossy().replace('\\', "/")
    );

    let remove_script = format!(
        "Remove-Item -Path '{}' -Force",
        zip_path.to_string_lossy().replace('\\', "/")
    );

    let mut download_cmd = Command::new("powershell");
    download_cmd.args(&["-Command", &download_script]);
    #[cfg(windows)]
    download_cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    let status = download_cmd.status().map_err(|e| e.to_string())?;
    
    if !status.success() {
        return Err("Failed to download Piper zip file via PowerShell".to_string());
    }

    let mut extract_cmd = Command::new("powershell");
    extract_cmd.args(&["-Command", &extract_script]);
    #[cfg(windows)]
    extract_cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    let status = extract_cmd.status().map_err(|e| e.to_string())?;
    
    if !status.success() {
        return Err("Failed to extract Piper zip file via PowerShell".to_string());
    }

    let mut remove_cmd = Command::new("powershell");
    remove_cmd.args(&["-Command", &remove_script]);
    #[cfg(windows)]
    remove_cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    let _ = remove_cmd.status();

    if piper_exe.exists() {
        if let Ok(meta) = fs::metadata(&piper_exe) {
            if meta.len() >= MIN_PIPER_SIZE {
                return Ok("Piper installed successfully".to_string());
            }
        }
        // Clean up invalid extraction
        let _ = fs::remove_file(&piper_exe);
        Err("Piper binary appears corrupted after extraction".to_string())
    } else {
        Err("Failed to verify piper.exe after extraction".to_string())
    }
}

#[tauri::command]
fn is_voice_downloaded(app: tauri::AppHandle, model_name: String) -> bool {
    if let Ok(mut base) = app.path().app_local_data_dir() {
        base.push("models");

        let model_path = base.join(&model_name);
        let config_path = base.join(format!("{}.json", model_name));

        // Both files must exist AND exceed minimum size thresholds
        // This prevents 404 error pages (typically 15 bytes) from being recognized as valid
        if model_path.exists() && config_path.exists() {
            let model_ok = fs::metadata(&model_path)
                .map(|m| m.len() >= MIN_MODEL_SIZE)
                .unwrap_or(false);
            let config_ok = fs::metadata(&config_path)
                .map(|m| m.len() >= MIN_CONFIG_SIZE)
                .unwrap_or(false);
            return model_ok && config_ok;
        }
    }
    false
}

#[tauri::command]
fn download_voice(app: tauri::AppHandle, model_name: String, model_url: String, config_url: String) -> Result<String, String> {
    let aura_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    let models_dir = aura_dir.join("models");
    
    fs::create_dir_all(&models_dir).map_err(|e| e.to_string())?;

    let model_path = models_dir.join(&model_name);
    let config_path = models_dir.join(format!("{}.json", model_name));

    // Pre-download cleanup: remove any existing files that are too small (corrupted/404)
    if model_path.exists() {
        if let Ok(meta) = fs::metadata(&model_path) {
            if meta.len() < MIN_MODEL_SIZE {
                let _ = fs::remove_file(&model_path);
            }
        }
    }
    if config_path.exists() {
        if let Ok(meta) = fs::metadata(&config_path) {
            if meta.len() < MIN_CONFIG_SIZE {
                let _ = fs::remove_file(&config_path);
            }
        }
    }

    // Download model file if not already valid
    if !model_path.exists() {
        let download_model = format!(
            "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '{}' -OutFile '{}' -UseBasicParsing",
            model_url,
            model_path.to_string_lossy().replace('\\', "/")
        );
        let mut download_cmd = Command::new("powershell");
        download_cmd.args(&["-Command", &download_model]);
        #[cfg(windows)]
        download_cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        let status = download_cmd.status().map_err(|e| e.to_string())?;
        if !status.success() {
            // Clean up partial download
            let _ = fs::remove_file(&model_path);
            return Err(format!("Failed to download model file: {}", model_name));
        }
    }

    // Download config file if not already valid
    if !config_path.exists() {
        let download_config = format!(
            "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '{}' -OutFile '{}' -UseBasicParsing",
            config_url,
            config_path.to_string_lossy().replace('\\', "/")
        );
        let mut download_config_cmd = Command::new("powershell");
        download_config_cmd.args(&["-Command", &download_config]);
        #[cfg(windows)]
        download_config_cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        let status = download_config_cmd.status().map_err(|e| e.to_string())?;
        if !status.success() {
            // Clean up partial download
            let _ = fs::remove_file(&config_path);
            return Err(format!("Failed to download config file for: {}", model_name));
        }
    }

    // Post-download integrity verification
    let model_len = fs::metadata(&model_path).map(|m| m.len()).unwrap_or(0);
    let config_len = fs::metadata(&config_path).map(|m| m.len()).unwrap_or(0);
    let model_valid = model_len >= MIN_MODEL_SIZE;
    let config_valid = config_len >= MIN_CONFIG_SIZE;

    if !model_valid || !config_valid {
        // The server returned a 404 error page or an empty file — clean up
        let _ = fs::remove_file(&model_path);
        let _ = fs::remove_file(&config_path);
        return Err(format!(
            "Downloaded files for '{}' failed integrity check (model: {} bytes, config: {} bytes). \
             The voice URL may be invalid. Both files have been removed.",
            model_name,
            model_len,
            config_len
        ));
    }

    Ok("Voice downloaded successfully".to_string())
}

#[tauri::command]
fn synthesize_speech(app: tauri::AppHandle, text: String, model_name: String) -> Result<String, String> {
    let aura_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    
    let piper_exe = aura_dir.join("bin").join("piper").join("piper.exe");
    let model_path = aura_dir.join("models").join(&model_name);
    let output_wav = aura_dir.join("temp_speech.wav");

    if !piper_exe.exists() {
        return Err("Piper is not installed".to_string());
    }
    if !model_path.exists() {
        return Err(format!("Voice model {} is not downloaded", model_name));
    }

    // Spawn piper.exe
    let mut cmd = Command::new(&piper_exe);
    cmd.arg("--model")
        .arg(&model_path)
        .arg("--output_file")
        .arg(&output_wav)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    
    let mut child = cmd.spawn().map_err(|e| e.to_string())?;

    {
        let stdin = child.stdin.as_mut().ok_or("Failed to open stdin for piper")?;
        stdin.write_all(text.as_bytes()).map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Piper execution failed: {}", stderr));
    }

    if output_wav.exists() {
        Ok(output_wav.to_string_lossy().to_string())
    } else {
        Err("Failed to verify synthesized WAV file".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            is_piper_downloaded,
            download_piper,
            is_voice_downloaded,
            download_voice,
            synthesize_speech
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
