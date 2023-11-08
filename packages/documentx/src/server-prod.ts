import { createApp, eventHandler, toNodeListener } from 'h3'
import { listen } from 'listhen'
import { globSync } from 'glob'
import path from 'path'
import { renderToString } from './renderToString'

async function main() {
    const app = createApp()

    const globRoot = path.resolve(__dirname, './pages')

    await Promise.all(
        globSync(globRoot + '/**/page.{ts,tsx,js,jsx}').map(async (file) => {
            const route = file
                .replace('./pages', '')
                .replace(new RegExp('\\page.(ts|tsx|js|jsx)$'), '')

            const { default: Page } = await import(
                path.resolve(__dirname, './main.js')
            )
            if (!Page) throw new Error('No default export found')

            app.use(
                route,
                eventHandler((event) => {
                    if (event.method !== 'GET') return
                    event.headers.set('Content-Type', 'text/html')
                    return renderToString({ type: Page, props: {} })
                })
            )
        })
    )

    listen(toNodeListener(app))
}
main()
