# Scripts Folder

This folder contains utility scripts for running the Salad Subscription System locally.

## Files

### `start-salad-subs.bat`
Windows batch script that starts the development server. This is what the desktop shortcut runs.

### `create-desktop-shortcut.ps1`
PowerShell script to create a desktop shortcut for easy launching.

**Usage:**
1. Right-click → "Run with PowerShell"
2. Or run: `powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1`

### `SETUP-INSTRUCTIONS.md`
Detailed setup and troubleshooting guide for local development.

## Quick Start

1. **First time setup:**
   - Run `create-desktop-shortcut.ps1` to create a desktop shortcut
   - Make sure `.env.local` exists in project root with Supabase credentials

2. **Launch application:**
   - Double-click the desktop shortcut "Salad Subscription System"
   - Or double-click `start-salad-subs.bat` directly

3. **Access the app:**
   - Open browser to http://localhost:3000
