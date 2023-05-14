import { renderToString } from 'documentx'
import express from 'express'
import fs from 'fs'
import path from 'path'

import fetch from 'cross-fetch'
global.fetch = fetch

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main() {
    const app = express()

    app.use(
        express.static(path.resolve(__dirname, '.'), {
            index: false,
            redirect: false,
        })
    )

    const mainModule = await import(path.resolve(__dirname, './main.js'))

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl

        try {
            // send html
            let html = fs.readFileSync(
                path.resolve(__dirname, 'index.html'),
                'utf-8'
            )

            // minify html (keep comments)
            html = html.replace(/\s\B/gm, '')

            // replace outlet with app
            const { default: App, router, meta } = mainModule
            if (!App) {
                throw new Error('No app as the default export of /src/main.tsx')
            }
            if (!router) {
                throw new Error('router is not exported from /src/main.tsx')
            }
            if (!meta) {
                throw new Error('meta is not exported from /src/main.tsx')
            }

            router.history.replace(url)

            const appHtml = await renderToString({ type: App, props: {} })
            html = html.replace('<!--outlet-->', appHtml.join(''))

            const head: string[] = []

            const tags: string[] = (
                await Promise.all(
                    meta.current.map((node: any) => renderToString(node))
                )
            ).flat()
            head.push(...tags)

            html = html.replace('<!--head-->', head.join('\n'))

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e: any) {
            next(e)
        }
    })

    app.listen(3000)
    console.log('Server running on port 3000')
}

main()
