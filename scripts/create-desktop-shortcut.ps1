# PowerShell script to create a desktop shortcut for Salad Subscription System

Write-Host "Creating desktop shortcut for Salad Subscription System..." -ForegroundColor Cyan

# Get the script directory and project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$batchFile = Join-Path $scriptDir "start-salad-subs.bat"

# Check if batch file exists
if (-not (Test-Path $batchFile)) {
    Write-Host "ERROR: start-salad-subs.bat not found in current directory!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    pause
    exit 1
}

# Get desktop path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Salad Subscription System.lnk"

# Create WScript Shell object
$WScriptShell = New-Object -ComObject WScript.Shell

# Create shortcut
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batchFile
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Launch Salad Subscription Management System (Local Development Server)"
$shortcut.IconLocation = "shell32.dll,26"  # Food/restaurant icon from Windows
$shortcut.Save()

Write-Host "`n✓ Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "Location: $shortcutPath" -ForegroundColor Gray
Write-Host "`nYou can now double-click 'Salad Subscription System' on your desktop to start the server." -ForegroundColor Cyan
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
