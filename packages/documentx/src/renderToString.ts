import type { Children } from './index'
import { mapTypes } from './mapTypes'

/**
 * Creates dom string from a node
 */
export async function renderToString(vnode: JSX.Element): Promise<string[]> {
    // Handling fragments
    if (Array.isArray(vnode)) {
        return (
            await Promise.all(vnode.map((child) => renderToString(child)))
        ).flat()
    }
    if (!vnode.type) {
        return getNodesFromChildren(vnode.props.children)
    }
    // Handling components
    if (typeof vnode.type === 'function') {
        return renderToString(await vnode.type(vnode.props))
    }

    let children = await getNodesFromChildren(vnode.props.children)

    let stringAttributes = Object.entries(vnode.props)
        .filter(
            ([key, value]) =>
                key !== 'children' &&
                key !== 'ref' &&
                value !== undefined &&
                !key.startsWith('on')
        )
        .map(([key, value]) => {
            if (key === 'dangerouslySetInnerHTML') {
                return (children = [value.__html as string])
            }
            if (key === 'style' && typeof value === 'object') {
                return `style="${Object.entries(value)
                    .map(([styleKey, styleValue]) => {
                        return `${styleKey}:${
                            typeof styleValue === 'number'
                                ? `${styleValue}px`
                                : styleValue === null
                                ? ''
                                : styleValue
                        }`
                    })
                    .join(';')}"`
            }
            return `${key}="${value}"`
        })
        .join(' ')

    if (stringAttributes) stringAttributes = ' ' + stringAttributes

    return [
        `<${vnode.type}${stringAttributes}>${children.join('')}</${
            vnode.type
        }>`,
    ]
}

const getNodesFromChildren = async (children: Children) => {
    return await mapTypes<string>(children, {
        vnode: async (child) => {
            return await renderToString(child)
        },
        catch: (child) => {
            if (child === undefined || child === null) return
            return child.toString()
        },
    })
}
