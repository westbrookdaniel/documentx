import { renderToString } from 'documentx'
import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import compression from 'compression'

import fetch from 'cross-fetch'
global.fetch = fetch

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const PORT = process.env.PORT || 3000

async function main() {
    const app = express()

    app.use(cors())
    app.use(compression())

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

    app.listen(PORT)
    console.log(`Server running on port ${PORT}`)
}

main()
