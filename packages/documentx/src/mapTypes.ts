import { Child, Children } from './index'

/**
 * Maps over the children of a node
 */
export async function mapTypes<T>(
    children: Children,
    handlers: {
        vnode?: (
            child: JSX.Element
        ) => Promise<T | T[] | undefined> | T | T[] | undefined
        catch?: (
            child: Exclude<Child, JSX.Element>
        ) => Promise<T | T[] | undefined> | T | T[] | undefined
    }
): Promise<T[]> {
    if (Array.isArray(children)) {
        const result = await Promise.all(
            children.flat().map((child) => {
                if (isVNode(child)) {
                    return handlers.vnode?.(child as unknown as JSX.Element)
                } else {
                    return handlers.catch?.(child)
                }
            })
        )
        return result.filter(Boolean).flat() as T[]
    } else if (isVNode(children)) {
        const result = await handlers.vnode?.(
            children as unknown as JSX.Element
        )
        if (result === undefined) return []
        return Array.isArray(result) ? result : [result]
    } else {
        const result = await handlers.catch?.(children)
        if (result === undefined) return []
        return Array.isArray(result) ? result : [result]
    }
}

export function isVNode(child: any): child is JSX.Element {
    return (
        typeof child === 'object' && child !== null && child.type !== undefined
    )
}
