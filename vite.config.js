import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import fs from 'fs';

const certsExist =
    fs.existsSync('./certs/localhost+2-key.pem') &&
    fs.existsSync('./certs/localhost+2.pem');

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.jsx', 'resources/css/globals.css'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        ...(certsExist && {
            https: {
                key: fs.readFileSync('./certs/localhost+2-key.pem'),
                cert: fs.readFileSync('./certs/localhost+2.pem'),
            },
        }),
        port: 3000,
        host: 'localhost',
    },
});
