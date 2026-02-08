#!/usr/bin/env node

/**
 * Build variant manager - switches between development and production app configs
 * Usage:
 *   node scripts/build-variant.js dev  - Switch to development (com.k8thompson.rantapp.dev) [DEFAULT]
 *   node scripts/build-variant.js prod - Switch to production (com.k8thompson.rantapp) [PERSONAL USE]
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '../app.json');
const variant = process.argv[2] || 'dev';

const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

if (variant === 'dev') {
  appConfig.expo.name = 'RantTrack Dev';
  appConfig.expo.ios.bundleIdentifier = 'com.k8thompson.rantapp.dev';
  appConfig.expo.android.package = 'com.k8thompson.rantapp.dev';
  console.log('✓ Switched to DEVELOPMENT build (com.k8thompson.rantapp.dev)');
} else if (variant === 'prod') {
  appConfig.expo.name = 'RantTrack';
  appConfig.expo.ios.bundleIdentifier = 'com.k8thompson.rantapp';
  appConfig.expo.android.package = 'com.k8thompson.rantapp';
  console.log('✓ Switched to PERSONAL USE build (com.k8thompson.rantapp)');
} else {
  console.error('Invalid variant. Use "dev" or "prod"');
  process.exit(1);
}

fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2) + '\n');
