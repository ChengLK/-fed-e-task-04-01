export default function unmountNode (node) {
  // 获取节点的 _virtualDOM 对象
  const virtualDOM = node._virtualDOM
  // 1. 文本节点可以直接删除
  if ( virtualDOM.type === 'text' ) {
    node.remove()
    // 阻止程序向下执行
    return
  }
  // 2. 看一下节点是否是由组件生成的
  const component = virtualDOM.component
  if (component) {
    component.componentWillUnmount()
  }
  // 3. 看一下节点身上是否有 ref 属性
  if (virtualDOM?.props?.ref) {
    virtualDOM.props.ref(null)
  }
  // 4. 看一下节点的属性中是否有事件属性，如果有的话，要卸载掉，否则会造成内存泄漏
  Object.keys(virtualDOM.props).forEach(propName => {
    if (propName.slice(0, 2) === 'on') {
      const eventName = propName.toLowerCase.slice(2)
      const eventHandler = virtualDOM.props[eventName]
      node.removeEventListener(eventName, eventHandler)
    }
  })
  // 5. 递归删除子节点
  if (node.childNodes.length > 0) {
    node.childNodes.forEach(child => {
      unmountNode(child)
    })
  }
  // 删除节点
  node.remove()
}