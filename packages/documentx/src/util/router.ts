import { render } from '../render'
import { History, createBrowserHistory, createMemoryHistory } from 'history'
import { hijackLinks } from './hijackLinks'
import { Reference } from './ref'
import { getTarget } from './getTarget'

export type Route = () => JSX.Element | Promise<JSX.Element>

export type Router = {
    history: History
    currentMatch: () => {
        preload: () => Promise<void>
        component: () => Promise<Route>
        params: () => Record<string, string>
    }
    match: (path: string) => {
        preload: () => Promise<void>
        component: () => Promise<Route>
        params: () => Record<string, string>
    }
    params: () => Record<string, string>
    bind: (
        el: Reference | { target: HTMLElement },
        options?: {
            error: (err: unknown) => JSX.Element
        }
    ) => Promise<JSX.Element>
}

/**
 * Create a router
 * This router will hijack anchor tags and perform client-side routing
 *
 * Supports being run during SSR
 *
 * @param routes Map of routes to components
 *
 * @example
 * const router = createRouter({
 *  '/': () => () => <h1>Home</h1>,
 *  '/about': () => () => <h1>About</h1>,
 *  '/users/:id': () => () => <h1>User {router.params().id}</h1>,
 *  '404': () => () => <h1>Not Found</h1>,
 * })
 */
export const createRouter = (
    routes: Record<string, () => Promise<Route>>
): Router => {
    let history: History

    if (typeof document === 'undefined') {
        history = createMemoryHistory()
    } else {
        history = createBrowserHistory()
    }

    const router: Router = {
        history,
        /**
         * Get the matching element for the current path
         */
        currentMatch: () => router.match(history.location.pathname),
        /**
         * Get the matching element for a given path
         * Handles 404s and dynamic routes
         */
        match: (path) => {
            const foundRoute = Object.keys(routes).find((route) => {
                const routeParts = route.split('/')
                const pathParts = path.split('/')
                if (routeParts.length !== pathParts.length) return false
                return routeParts.every((part, i) => {
                    if (part.startsWith(':')) return true
                    return part === pathParts[i]
                })
            })
            return {
                preload: async () => {
                    // Currently only preloads the module,
                    // but we could do data loading here too
                    await routes[foundRoute || '404']()
                },
                component: routes[foundRoute || '404'],
                params: () => {
                    const routeParts = foundRoute!.split('/')
                    const pathParts = path.split('/')
                    return routeParts.reduce((acc, part, i) => {
                        if (part.startsWith(':'))
                            acc[part.slice(1)] = pathParts[i]
                        return acc
                    }, {} as Record<string, string>)
                },
            }
        },
        /**
         * Get the params for the current route
         */
        params: () => router.currentMatch().params(),
        /**
         * Bind the router to an element
         *
         * @param el The element where the route component will be rendered within
         * @returns The element for the initial route
         */
        bind: async (el, options) => {
            const error =
                options?.error ||
                ((err: unknown) => {
                    throw err
                })

            history.listen(async () => {
                if (typeof document === 'undefined') return
                const route = router.currentMatch()
                try {
                    const comp = await route.component()
                    const children = await render(await comp())
                    getTarget(el).replaceChildren?.(...children)
                } catch (c) {
                    const children = await render(error(c))
                    getTarget(el).replaceChildren?.(...children)
                }
                window.scrollTo(0, 0)
            })

            const route = await router.currentMatch().component()
            return await route()
        },
    }

    if (typeof document !== 'undefined') {
        hijackLinks(router)
    }

    return router
}

export const lazy = (routeImport: () => Promise<{ default: Route }>) => {
    return async () => {
        const mod = await routeImport()
        return () => mod.default()
    }
}
