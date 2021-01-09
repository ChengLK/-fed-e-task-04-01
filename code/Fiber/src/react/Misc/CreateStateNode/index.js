import { createDOMElement } from '../DOM'
import { createReactInstance } from '../createReactInstance'

const createStateNode = fiber => {
  if (fiber.tag === 'host_component') { // 普通节点
    return createDOMElement(fiber)
  }
  return createReactInstance(fiber)
}

export default createStateNode