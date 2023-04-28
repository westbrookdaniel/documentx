function jsx(type: any, props: any) {
  if (typeof type === 'function') {
    return { type, props }
  }
  return { type, props }
}

function Fragment(props: any) {
  return props.children
}

// It's all the same so we don't care where it comes from
export { jsx, jsx as jsxs, Fragment }
export { jsx as jsxDEV, jsx as jsxsDEV }
