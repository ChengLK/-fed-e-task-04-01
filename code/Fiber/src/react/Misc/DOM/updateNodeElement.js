export default function updateNodeElement (newElement, virtualDOM, oldVirtualDOM = {}) {
  const newProps = virtualDOM.props || {}
  const oldProps = oldVirtualDOM?.props || {}

  // 处理文本节点
  if (virtualDOM.type === 'text') {
    if (newProps.textContent !== oldProps.textContent) {
      if (virtualDOM.parent.type !== oldVirtualDOM.parent.type) {
        // 父级节点类型不同
        virtualDOM.parent.stateNode.appendChild(document.createTextNode(newProps.textContent))
      } else {
        // 父级节点类型相同
        virtualDOM.parent.stateNode.replaceChild(
          document.createTextNode(newProps.textContent),
          oldVirtualDOM.stateNode
        )
      }
    }
    return
  }

  Object.keys(newProps).forEach(propName => {
    // 获取属性值
    const newPropsValue = newProps[propName]
    const oldPropsValue = oldProps[propName]
    if (oldPropsValue !== newPropsValue) {
      // 属性是否是事件属性（以 on 开头） onClick -> click
      if (propName.slice(0, 2) === 'on') {
        // 事件名称
        const eventName = propName.toLowerCase().slice(2)
        // 为元素添加事件
        newElement.addEventListener(eventName, newPropsValue) // 不会替换掉同名事件，要手动卸载原有事件

        if (oldPropsValue) {
          newElement.removeEventListener(eventName, oldPropsValue) // 卸载掉原有事件的事件处理函数
        }

      } else if (propName === 'value' || propName === 'checked') {
        newElement[propName] = newPropsValue
      } else if (propName !== 'children') {
        if (propName === 'className') {
          newElement.setAttribute('class', newPropsValue)
        } else {
          newElement.setAttribute(propName, newPropsValue)
        }
      }
    }
  })
  // 判断属性被删除： oldProps 里的属性在 newProps 中没有
  Object.keys(oldProps).forEach(propName => {
    const newPropsValue = newProps[propName]
    const oldPropsValue = oldProps[propName]
    if (!newPropsValue) {
      // 属性被删除了
      if (propName.slice(0, 2) === 'on') {
        const eventName = propName.toLowerCase().slice(2)
        newElement.removeEventListener(eventName, oldPropsValue)
      }
      if (propName !== 'children') {
        newElement.removeAttribute(propName)
      }
    }
  })
}