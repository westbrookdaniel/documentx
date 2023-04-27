import type { Child, Children, VNode } from '..'

export function traverse(
  children: Children,
  handlers: {
    vnode?: (child: VNode, i?: number) => void
    catch?: (child: Exclude<Child, VNode>, i?: number) => void
  }
) {
  if (Array.isArray(children)) {
    children.flat().forEach((child, i) => {
      // TODO: Use symbol to check if it's a vnode
      if (typeof child === 'object') {
        handlers.vnode?.(child as unknown as VNode, i)
      } else {
        handlers.catch?.(child, i)
      }
    })
  } else if (typeof children === 'object') {
    // TODO: Use symbol to check if it's a vnode
    handlers.vnode?.(children as unknown as VNode)
  } else {
    handlers.catch?.(children)
  }
}
