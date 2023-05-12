import path from 'node:path'
import type { Plugin } from 'vite'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

declare global {
    var documentxssr: { css: string[] }
}

export default function documentxssr(): Plugin[] {
    global.documentxssr = {
        css: [],
    }

    return [
        {
            name: 'documentx-ssr-assets',
            enforce: 'post',
            apply: 'serve',
            transform(_code, id, opts) {
                if (opts?.ssr && id.endsWith('.css')) {
                    const relativeId = path.relative(__dirname, id)
                    global.documentxssr.css.push('/' + relativeId)
                }
            },
        },
        {
            name: 'documentx-ssr-build',
            enforce: 'pre',
            apply: 'build',
            config(config, env) {
                if (env.command === 'build' && config.build?.ssr) {
                    return {
                        ...config,
                        build: {
                            ...config.build,
                            rollupOptions: {
                                input: {
                                    main: path.resolve(
                                        __dirname,
                                        'src/main.tsx'
                                    ),
                                },
                            },
                            emptyOutDir: false,
                        },
                    }
                }
                return config
            },
        },
    ]
}
