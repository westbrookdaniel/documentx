import { renderToString } from 'documentx'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { createServer } from 'vite'

import fetch from 'cross-fetch'
global.fetch = fetch

async function main() {
    const app = express()

    const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'custom',
    })

    app.use(vite.middlewares)

    const mainModule = await vite.ssrLoadModule('/src/main.tsx')

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl

        try {
            // send html
            let html = fs.readFileSync(
                path.resolve(process.cwd(), 'index.html'),
                'utf-8'
            )

            html = await vite.transformIndexHtml(url, html)

            // minify html (keep comments)
            html = html.replace(/\s\B/gm, '')

            // replace outlet with app
            const { default: App } = mainModule
            if (!App) {
                throw new Error('No app as the default export of /src/main.tsx')
            }
            if (!router || !meta) {
                throw new Error(
                    'router and meta have not been registered using register()'
                )
            }

            router.history.replace(url)

            const appHtml = await renderToString({ type: App, props: {} })
            html = html.replace('<!--outlet-->', appHtml.join(''))

            const head = global.documentxssr.css.map(
                (p) => `<link rel="stylesheet" href="${p}">`
            )

            const tags: string[] = (
                await Promise.all(
                    meta.current.map((node: any) => renderToString(node))
                )
            ).flat()
            head.push(...tags)

            html = html.replace('<!--head-->', head.join('\n'))

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e: any) {
            vite.ssrFixStacktrace(e)
            next(e)
        }
    })

    app.listen(3000)
    console.log('Server running on port 3000')
}

main()
