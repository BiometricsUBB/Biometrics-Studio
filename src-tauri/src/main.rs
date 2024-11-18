// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_window_state::StateFlags;

#[tauri::command]
async fn show_main_window_if_hidden(window: tauri::Window) {
    let main_window = window
        .get_webview_window("bioparallel")
        .expect("no window labeled 'bioparallel' found");

    if let Ok(is_visible) = main_window.is_visible() {
        if !is_visible {
            main_window.show().unwrap();
        }
    }
}

#[tauri::command]
async fn close_splashscreen_if_exists(window: tauri::Window) {
    let maybe_window = window.get_webview_window("splashscreen");

    match maybe_window {
        Some(splashscreen_window) => {
            splashscreen_window.close().unwrap();
        }
        None => {}
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            let _ = app
                .get_webview_window("bioparallel")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::all() & !StateFlags::VISIBLE)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            show_main_window_if_hidden,
            close_splashscreen_if_exists,
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = _app.get_webview_window("bioparallel").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
