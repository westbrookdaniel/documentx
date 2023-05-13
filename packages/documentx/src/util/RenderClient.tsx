export const RenderClient = ({
    children,
    fallback,
}: {
    children: JSX.Element
    fallback?: JSX.Element
}) => {
    if (typeof document === 'undefined') {
        return fallback ?? null
    }
    return children
}
