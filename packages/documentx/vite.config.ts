import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: [
                './src/index.ts',
                './src/jsx-runtime.ts',
                './src/jsx-dev-runtime.ts',
            ],
            name: 'documentx',
        },
    },
    plugins: [dts()],
})
