import { mapTypes } from './render'

/**
 * Creates dom string from a node
 */
export function renderToString(vnode: JSX.Element): string {
    if (typeof vnode.type === 'function') {
        return renderToString(vnode.type(vnode.props))
    }

    let elChildren: string[] = []

    const children = vnode.props.children
    if (children) {
        mapTypes(children, {
            vnode: (child) => {
                elChildren.push(renderToString(child))
            },
            catch: (child) => {
                if (child === undefined || child === null) return
                elChildren.push(child.toString())
            },
        })
    }

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
                return (elChildren = [value.__html as string])
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

    if (stringAttributes) {
        stringAttributes = ' ' + stringAttributes
    }

    return `<${vnode.type}${stringAttributes}>${elChildren.join('')}</${
        vnode.type
    }>`
}
