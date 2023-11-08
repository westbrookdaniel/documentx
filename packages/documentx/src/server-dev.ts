import { createApp, eventHandler, toNodeListener } from 'h3'
import { listen } from 'listhen'
import { globSync } from 'glob'
import { renderToString } from './renderToString'
import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'

async function main() {
    const app = createApp()

    const files = globSync('./src/pages/**/page.{ts,tsx,js,jsx}')

    // If no .documentx folder exists, create it
    if (!fs.existsSync(path.join(process.cwd(), '.documentx'))) {
        fs.mkdirSync(path.join(process.cwd(), '.documentx'))
    }

    await esbuild.build({
        entryPoints: files.map((file) => path.join(process.cwd(), file)),
        bundle: true,
        platform: 'neutral',
        jsx: 'automatic',
        jsxImportSource: 'documentx',
        jsxFactory: '',
        outdir: '.documentx/build',
    })

    await Promise.all(
        files.map(async (file) => {
            const route = file
                .replace('src/pages', '')
                .replace(new RegExp('\\page.(ts|tsx|js|jsx)$'), '')

            const builtFile = file.replace(
                new RegExp('\\page.(ts|tsx|js|jsx)$'),
                'page.js'
            )

            const { default: Page } = await import(
                path.join(process.cwd(), '.documentx/build', builtFile)
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
