import { renderToString } from 'documentx'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { ViteDevServer, createServer } from 'vite'

import fetch from 'cross-fetch'
global.fetch = fetch

const isDev = process.env.NODE_ENV === 'dev'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main() {
    const app = express()

    let vite: ViteDevServer | undefined

    if (isDev) {
        vite = await createServer({
            server: { middlewareMode: true },
            appType: 'custom',
        })
    }

    if (isDev && vite) {
        app.use(vite.middlewares)
    } else {
        app.use(
            '/assets',
            express.static(path.resolve(__dirname, './assets'), {
                index: false,
            })
        )
    }

    const mainModule =
        isDev && vite
            ? await vite.ssrLoadModule('/src/main.tsx')
            : await import(path.resolve(__dirname, './main.js'))

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl

        try {
            // send html
            let html = fs.readFileSync(
                isDev
                    ? path.resolve(process.cwd(), 'index.html')
                    : path.resolve(__dirname, 'index.html'),
                'utf-8'
            )

            if (isDev && vite) html = await vite.transformIndexHtml(url, html)

            // replace outlet with app
            const { default: App, router } = mainModule

            router.history.replace(url)

            const appHtml = await renderToString({ type: App, props: {} })
            html = html.replace('<!--outlet-->', appHtml.join(''))

            if (isDev) {
                html = html.replace(
                    '<!--head-->',
                    global.documentxssr.css
                        .map((p) => `<link rel="stylesheet" href="${p}">`)
                        .join('\n')
                )
            }

            // minify html
            html = html.replace(/<!--(.*?)-->|\s\B/gm, '')

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e: any) {
            if (isDev && vite) vite.ssrFixStacktrace(e)
            next(e)
        }
    })

    app.listen(3000)
    console.log('Server running on port 3000')
}

main()
