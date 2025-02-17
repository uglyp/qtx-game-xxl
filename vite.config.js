import path from 'path';
import { viteVConsole } from 'vite-plugin-vconsole';
import legacy from '@vitejs/plugin-legacy';
import { loadEnv } from 'vite';

export default ({ command, mode }) => {
    const root = process.cwd();
    const env = loadEnv(mode, root);
    return {
        base: '/',
        define: {
            APP_VERSION: JSON.stringify(process.env.npm_package_version),
        },
        plugins: [
            viteVConsole({
                entry: [path.resolve('src/main.ts')],
                localEnabled: true,
                enabled: command !== 'serve' && mode !== 'production',
                config: {
                    maxLogNumber: 1000,
                    theme: 'light',
                },
            }),
            legacy({
                targets: ['chrome 52'],
                additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            }),
        ],
        server: {
            host: true,
            port: 8000,
            // proxy: {
            //     '/api': {
            //         target: 'http://carbontest.dcps.info',
            //         ws: false,
            //         changeOrigin: true,
            //     },
            // },
        },
    };
};
