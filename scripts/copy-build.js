const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../out');
const parentDir = path.join(__dirname, '../..');

// Find if tinybit-server or server exists in parentDir
const serverName = fs.existsSync(path.join(parentDir, 'tinybit-server'))
  ? 'tinybit-server'
  : fs.existsSync(path.join(parentDir, 'server'))
    ? 'server'
    : null;

if (!serverName) {
  console.log('No server directory found next to tinybit-admin, keeping out/ folder.');
  process.exit(0);
}

const destDir = path.join(parentDir, serverName, 'public/admin');

console.log(`Copying static build from ${srcDir} to ${destDir}...`);

// Remove existing destDir if it exists
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

// Copy recursively
if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log('✅ Static build successfully copied!');
} else {
  console.error(`❌ Source folder ${srcDir} does not exist. Make sure next export completed.`);
  process.exit(1);
}
