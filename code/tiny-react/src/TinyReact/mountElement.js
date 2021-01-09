import mountNativeElement from './mountNativeElement'
import mountComponentElement from './mountComponentElement'

import isFunction from './isFunction'
export default function mountElement (virtualDOM, container, oldDOM) {
  // Component VS NativeElement
  if (isFunction(virtualDOM)) {
    // Component
    mountComponentElement(virtualDOM, container, oldDOM)
  } else {
    // NativeElement
    mountNativeElement(virtualDOM, container, oldDOM)
  }
}
