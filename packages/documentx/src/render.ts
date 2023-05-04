/// <reference lib="dom" />

import type { Child, Children } from './index'

/**
 * Creates dom element from a node
 */
export function render(vnode: JSX.Element): HTMLElement {
    if (typeof vnode.type === 'function') {
        return render(vnode.type(vnode.props))
    }

    const el: HTMLElement = document.createElement(vnode.type)

    const children = vnode.props.children
    if (children) {
        mapTypes(children, {
            vnode: (child) => {
                el.appendChild(render(child))
            },
            catch: (child) => {
                if (child === undefined || child === null) return
                el.appendChild(document.createTextNode(child.toString()))
            },
        })
    }

    applyAttributes(vnode, el)

    return el
}

/**
 * Map of elements to their event listeners
 */
const listenersInUse = new WeakMap<
    HTMLElement,
    [string, EventListenerOrEventListenerObject][]
>()

/**
 * Applies attributes of a node to a dom element
 */
function applyAttributes(vnode: JSX.Element, el: HTMLElement) {
    // Remove old listeners
    if (listenersInUse.has(el)) {
        const oldListeners = listenersInUse.get(el)!
        oldListeners.forEach(([eventType, listener]) => {
            el.removeEventListener(eventType, listener)
        })
        // Remove from listeners in use
        listenersInUse.delete(el)
    }

    // Apply attributes
    Object.entries(vnode.props).forEach(([key, value]) => {
        if (key === 'children') return
        // We want to call ref at the end
        if (key === 'ref') return
        if (value === undefined) return
        if (value === 'dangerouslySetInnerHTML') {
            el.innerHTML = value.__html as string
            return
        }
        if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                el.style[styleKey as any] =
                    typeof styleValue === 'number'
                        ? `${styleValue}px`
                        : styleValue === null
                        ? ''
                        : (styleValue as any)
            })
            return
        }
        if (key.startsWith('on') && typeof value === 'function') {
            const eventType = key.slice(2).toLowerCase()
            const event = value as unknown as EventListener

            el.addEventListener(eventType, event)

            // Add to listeners in use for cleanup next time
            if (!listenersInUse.has(el)) {
                listenersInUse.set(el, [[eventType, event]])
            } else {
                listenersInUse.get(el)!.push([eventType, event])
            }
            return
        }
        // Generic set attribute
        if (value !== null && value !== false) {
            el.setAttribute(key, value)
        } else {
            el.removeAttribute(key)
        }
    })

    // Call ref
    if (vnode.props.ref) vnode.props.ref(el)
}

/**
 * Maps over the children of a node
 */
export function mapTypes(
    children: Children,
    handlers: {
        vnode?: (child: JSX.Element) => void
        catch?: (child: Exclude<Child, JSX.Element>) => void
    }
) {
    if (Array.isArray(children)) {
        children.flat().forEach((child) => {
            if (isVNode(child)) {
                handlers.vnode?.(child as unknown as JSX.Element)
            } else {
                handlers.catch?.(child)
            }
        })
    } else if (isVNode(children)) {
        handlers.vnode?.(children as unknown as JSX.Element)
    } else {
        handlers.catch?.(children)
    }
}

function isVNode(child: any): child is JSX.Element {
    return (
        typeof child === 'object' && child !== null && child.type !== undefined
    )
}
