#!/bin/bash
# RantTrack Development Aliases
# Source this file in your shell to use these shortcuts
#
# For Git Bash/WSL: Add to ~/.bashrc or ~/.bash_profile:
#   source /c/Users/Admin/Documents/rant-app/.ranttrack-aliases.sh
#
# For usage: Just type the alias name (e.g., "type-check")

# Get the directory where this script lives
# RANTTRACK_ROOT="$(cd "$(dirname "$BASH_SOURCE")" 2>/dev/null && pwd || echo '/c/Users/Admin/Documents/rant-app')"
RANTTRACK_ROOT='/c/Users/Admin/Documents/rant-app'

# Build & Run
alias build-android="cd '$RANTTRACK_ROOT/mobile' && npx expo run:android"
alias build-apk="cd '$RANTTRACK_ROOT/mobile' && eas build --profile beta --platform android"
alias build-ios="cd '$RANTTRACK_ROOT/mobile' && eas build --profile beta --platform ios"
alias start-rant="cd '$RANTTRACK_ROOT/mobile' && npx expo start"

# Testing & Quality
alias type-check="cd '$RANTTRACK_ROOT/mobile' && npm run tsc"
alias test-nlp="cd '$RANTTRACK_ROOT' && python test_extraction.py"
alias bundle-size="cd '$RANTTRACK_ROOT/mobile' && npx expo export --dump-sourcemap | grep -E '(Bundle size|Total size)'"

# Debugging
alias debug-android="adb logcat | grep -E '(RantTrack|ReactNative|Expo|FATAL)'"
alias debug-android-errors="adb logcat '*:E' | grep -E '(RantTrack|ReactNative)'"
alias apk-info="aapt dump badging '$RANTTRACK_ROOT/mobile/android/app/build/outputs/apk/debug/app-debug.apk'"
alias clean-android="cd '$RANTTRACK_ROOT/mobile/android' && ./gradlew clean"

# EAS (Expo Application Services)
alias eas-builds="eas build:list --limit 10"
alias eas-submit-android="eas submit --platform android --latest --track internal"
alias eas-submit-ios="eas submit --platform ios --latest"
alias eas-status="eas build:list --limit 3 && echo '\n' && eas submit:list --limit 3"

# Git & Version Control
alias git-rant-status="cd '$RANTTRACK_ROOT' && git status && echo '\n--- Recent Commits ---' && git log --oneline -5"
alias git-rant-diff="cd '$RANTTRACK_ROOT' && git diff && echo '\n--- Staged Changes ---' && git diff --cached"

# Database
alias db-reset="cd '$RANTTRACK_ROOT/mobile' && rm -rf .expo/sqlite/*.db && echo 'Database reset. Restart app to recreate.'"

# Dependencies
alias install-rant="cd '$RANTTRACK_ROOT/mobile' && npm install"
alias outdated-rant="cd '$RANTTRACK_ROOT/mobile' && npm outdated"

# Utilities
alias lint-fix="cd '$RANTTRACK_ROOT/mobile' && npx prettier --write 'src/**/*.{ts,tsx}'"
alias device-list="adb devices"

# Helper function to show all available aliases
rant-help() {
    echo "RantTrack Development Aliases"
    echo "============================="
    echo ""
    echo "Build & Run:"
    echo "  build-android       - Run on Android device/emulator"
    echo "  build-apk          - Build APK via EAS"
    echo "  build-ios          - Build iOS via EAS"
    echo "  start-rant         - Start Expo dev server"
    echo ""
    echo "Testing & Quality:"
    echo "  type-check         - Run TypeScript compiler"
    echo "  test-nlp           - Test NLP extraction"
    echo "  bundle-size        - Check bundle size"
    echo ""
    echo "Debugging:"
    echo "  debug-android      - Show Android logs (filtered)"
    echo "  debug-android-errors - Show Android errors only"
    echo "  apk-info          - Display APK metadata"
    echo "  clean-android     - Clean Gradle build"
    echo ""
    echo "EAS:"
    echo "  eas-builds        - List recent builds"
    echo "  eas-submit-android - Submit to Google Play"
    echo "  eas-submit-ios    - Submit to App Store"
    echo "  eas-status        - Show builds and submissions"
    echo ""
    echo "Git:"
    echo "  git-rant-status   - Status + recent commits"
    echo "  git-rant-diff     - Show all diffs"
    echo ""
    echo "Database:"
    echo "  db-reset          - Reset local database"
    echo ""
    echo "Dependencies:"
    echo "  install-rant      - Install npm packages"
    echo "  outdated-rant     - Check for outdated packages"
    echo ""
    echo "Utilities:"
    echo "  lint-fix          - Format code with Prettier"
    echo "  device-list       - List connected devices"
    echo ""
    echo "Type 'rant-help' to see this message again"
}

# Show success message when sourced (commented out to reduce noise)
# echo "✅ RantTrack aliases loaded!"
# echo "Type 'rant-help' to see all available commands"
