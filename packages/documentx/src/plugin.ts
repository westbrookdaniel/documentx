import path from 'node:path'
import type { Plugin } from 'vite'

const cwd = process.cwd()

export function documentxssr(): Plugin[] {
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
                    const relativeId = path.relative(cwd, id)
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
                            target: 'esnext',
                            ...config.build,
                            rollupOptions: {
                                input: {
                                    main: path.resolve(cwd, 'src/main.tsx'),
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
