# RantTrack Development Aliases (PowerShell)
#
# To use, add to your PowerShell profile:
#   notepad $PROFILE
# Then add this line:
#   . C:\Users\Admin\Documents\rant-app\.ranttrack-aliases.ps1
#
# If you get execution policy errors, run as admin:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

$RANTTRACK_ROOT = "C:\Users\Admin\Documents\rant-app"

# Build & Run
function build-android {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npx expo run:android
}

function build-apk {
    Set-Location "$RANTTRACK_ROOT\mobile"
    eas build --profile beta --platform android
}

function build-ios {
    Set-Location "$RANTTRACK_ROOT\mobile"
    eas build --profile beta --platform ios
}

function start-rant {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npx expo start
}

# Testing & Quality
function type-check {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npm run tsc
}

function test-nlp {
    Set-Location $RANTTRACK_ROOT
    python test_extraction.py
}

function bundle-size {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npx expo export --dump-sourcemap | Select-String -Pattern "(Bundle size|Total size)"
}

# Debugging
function debug-android {
    adb logcat | Select-String -Pattern "(RantTrack|ReactNative|Expo|FATAL)"
}

function debug-android-errors {
    adb logcat "*:E" | Select-String -Pattern "(RantTrack|ReactNative)"
}

function apk-info {
    aapt dump badging "$RANTTRACK_ROOT\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
}

function clean-android {
    Set-Location "$RANTTRACK_ROOT\mobile\android"
    .\gradlew clean
}

# EAS (Expo Application Services)
function eas-builds {
    eas build:list --limit 10
}

function eas-submit-android {
    eas submit --platform android --latest --track internal
}

function eas-submit-ios {
    eas submit --platform ios --latest
}

function eas-status {
    eas build:list --limit 3
    Write-Host ""
    eas submit:list --limit 3
}

# Git & Version Control
function git-rant-status {
    Set-Location $RANTTRACK_ROOT
    git status
    Write-Host "`n--- Recent Commits ---"
    git log --oneline -5
}

function git-rant-diff {
    Set-Location $RANTTRACK_ROOT
    git diff
    Write-Host "`n--- Staged Changes ---"
    git diff --cached
}

# Database
function db-reset {
    Set-Location "$RANTTRACK_ROOT\mobile"
    Remove-Item -Recurse -Force .expo\sqlite\*.db -ErrorAction SilentlyContinue
    Write-Host "Database reset. Restart app to recreate."
}

# Dependencies
function install-rant {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npm install
}

function outdated-rant {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npm outdated
}

# Utilities
function lint-fix {
    Set-Location "$RANTTRACK_ROOT\mobile"
    npx prettier --write "src/**/*.{ts,tsx}"
}

function device-list {
    adb devices
}

# Helper function to show all available aliases
function rant-help {
    Write-Host "RantTrack Development Aliases" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Build & Run:" -ForegroundColor Yellow
    Write-Host "  build-android       - Run on Android device/emulator"
    Write-Host "  build-apk          - Build APK via EAS"
    Write-Host "  build-ios          - Build iOS via EAS"
    Write-Host "  start-rant         - Start Expo dev server"
    Write-Host ""
    Write-Host "Testing & Quality:" -ForegroundColor Yellow
    Write-Host "  type-check         - Run TypeScript compiler"
    Write-Host "  test-nlp           - Test NLP extraction"
    Write-Host "  bundle-size        - Check bundle size"
    Write-Host ""
    Write-Host "Debugging:" -ForegroundColor Yellow
    Write-Host "  debug-android      - Show Android logs (filtered)"
    Write-Host "  debug-android-errors - Show Android errors only"
    Write-Host "  apk-info          - Display APK metadata"
    Write-Host "  clean-android     - Clean Gradle build"
    Write-Host ""
    Write-Host "EAS:" -ForegroundColor Yellow
    Write-Host "  eas-builds        - List recent builds"
    Write-Host "  eas-submit-android - Submit to Google Play"
    Write-Host "  eas-submit-ios    - Submit to App Store"
    Write-Host "  eas-status        - Show builds and submissions"
    Write-Host ""
    Write-Host "Git:" -ForegroundColor Yellow
    Write-Host "  git-rant-status   - Status + recent commits"
    Write-Host "  git-rant-diff     - Show all diffs"
    Write-Host ""
    Write-Host "Database:" -ForegroundColor Yellow
    Write-Host "  db-reset          - Reset local database"
    Write-Host ""
    Write-Host "Dependencies:" -ForegroundColor Yellow
    Write-Host "  install-rant      - Install npm packages"
    Write-Host "  outdated-rant     - Check for outdated packages"
    Write-Host ""
    Write-Host "Utilities:" -ForegroundColor Yellow
    Write-Host "  lint-fix          - Format code with Prettier"
    Write-Host "  device-list       - List connected devices"
    Write-Host ""
    Write-Host "Type 'rant-help' to see this message again" -ForegroundColor Green
}

# Show success message when loaded (commented out to reduce noise)
# Write-Host "✅ RantTrack aliases loaded!" -ForegroundColor Green
# Write-Host "Type 'rant-help' to see all available commands" -ForegroundColor Cyan
