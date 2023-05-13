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

            // minify html
            html = html.replace(/<!--(.*?)-->|\s\B/gm, '')

            // replace outlet with app
            const { default: App, router } = mainModule

            router.history.replace(url)

            const appHtml = await renderToString({ type: App, props: {} })
            html = html.replace('<!--outlet-->', appHtml.join(''))

            html = html.replace(
                '<!--head-->',
                global.documentxssr.css
                    .map((p) => `<link rel="stylesheet" href="${p}">`)
                    .join('\n')
            )

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