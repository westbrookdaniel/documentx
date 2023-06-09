import { Route, lazy } from './router'

/**
 * Map a module map to routes for the router
 * Intended for use with vite's import.meta.glob
 */
export function fileRouter(
    moduleMap: Record<string, () => Promise<unknown>>,
    root: string
): Record<string, () => Promise<Route>> {
    const files = moduleMap as Record<string, () => Promise<{ default: Route }>>

    return Object.fromEntries(
        Object.entries(files).map(([path, loader]) => {
            let route = path.replace(root, '').replace(/\.tsx$/, '')
            if (route === '/404') route = '404'
            if (route === '/index') route = '/'
            return [route, lazy(loader)]
        })
    )
}
