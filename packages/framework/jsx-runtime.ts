function jsx(type: any, props: any) {
  if (typeof type === 'function') {
    return { type, props }
  }
  return { type, props }
}

function Fragment(props: any) {
  return props.children
}

export { jsx, jsx as jsxs, Fragment }
