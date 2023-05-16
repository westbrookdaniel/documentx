import { Router } from './router'

export function hijackLinks(router: Router) {
    // Observer for preloading links
    const interObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const href = entry.target.getAttribute('href')
                if (href) requestIdleCallback(router.match(href).preload)
            }
        })
    })

    // Hijack all links
    document
        .querySelectorAll('a')
        .forEach((el) => hijackLink(router, el, interObs))

    // Watch for changes to the dom and hijack new or changed links
    const mutObs = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case 'childList':
                    mutation.addedNodes.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            if (el instanceof HTMLAnchorElement)
                                hijackLink(router, el, interObs)
                            el.querySelectorAll('a').forEach((el) =>
                                hijackLink(router, el, interObs)
                            )
                        }
                    })
                    break
                case 'attributes': {
                    const el = mutation.target
                    if (el instanceof HTMLElement) {
                        if (el instanceof HTMLAnchorElement)
                            hijackLink(router, el, interObs)
                        el.querySelectorAll('a').forEach((el) =>
                            hijackLink(router, el, interObs)
                        )
                    }
                }
            }
        })
    })

    mutObs.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
    })

    return router
}

/**
 * Map of elements to their event listeners
 */
const existingRouterListeners = new WeakMap<
    HTMLElement,
    [string, EventListenerOrEventListenerObject][]
>()

const hijackLink = (
    router: Router,
    el: HTMLAnchorElement,
    interObs: IntersectionObserver
) => {
    // Remove old listener
    // We remove it here in case the target changes, or it changes to an external link
    if (existingRouterListeners.has(el)) {
        const listeners = existingRouterListeners.get(el)!
        listeners.forEach(([eventType, listener]) =>
            el.removeEventListener(eventType, listener)
        )
        // Remove from map
        existingRouterListeners.delete(el)
        interObs.unobserve(el)
    }

    // Navigate
    const click = (e: Event) => {
        const href = el.getAttribute('href')!
        if (!el.target && href?.startsWith('/')) {
            e.preventDefault()
            router.history.push(href)
        }
    }
    el.addEventListener('click', click)

    // Preload
    const mouseenter = () => {
        const href = el.getAttribute('href')!
        if (!el.target && href?.startsWith('/')) {
            requestIdleCallback(router.match(href).preload)
        }
    }
    el.addEventListener('mouseenter', mouseenter)

    const href = el.getAttribute('href')!
    if (!el.target && href?.startsWith('/')) {
        interObs.observe(el)
    }

    // Add to map
    existingRouterListeners.set(el, [
        ['click', click],
        ['mouseenter', mouseenter],
    ])
}
