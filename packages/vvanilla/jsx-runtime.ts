function jsx(type: any, props: any) {
  return { type, props }
}

function Fragment(props: any) {
  return props.children
}

export { jsx, jsx as jsxs, Fragment }
