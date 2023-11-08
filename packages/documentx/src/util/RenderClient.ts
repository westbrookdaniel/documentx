/**
 * Only render on the client
 */
export const RenderClient = ({
    children,
    fallback,
}: {
    children: JSX.Element
    fallback: JSX.Element
}) => {
    if (typeof window === 'undefined') {
        return fallback
    }
    return children
}
