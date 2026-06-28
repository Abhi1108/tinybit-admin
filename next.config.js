/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// Original tinybit-test layout: admin-panel/ next to server/ — builds static files into server/public/admin
const serverDir = path.join(__dirname, '../server');
const integratedWithServer =
  process.env.ADMIN_INTEGRATED === '1' ||
  fs.existsSync(path.join(serverDir, 'package.json'));

const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  ...(integratedWithServer
    ? {
        output: 'export',
        basePath: '/admin',
        distDir: path.join(serverDir, 'public/admin'),
      }
    : {}),
};

module.exports = nextConfig;
