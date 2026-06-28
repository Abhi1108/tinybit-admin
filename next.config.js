/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// Original tinybit-test layout: admin-panel/ next to server/ — builds static files into server/public/admin
const serverDir = fs.existsSync(path.join(__dirname, '../tinybit-server'))
  ? path.join(__dirname, '../tinybit-server')
  : path.join(__dirname, '../server');

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
      }
    : {}),
};

module.exports = nextConfig;
