import {CHILDREN_FLAG} from './dom'

const mountEle = (container, node) => {
    if (!container || !node) {
        return
    }
    const tag = node.tag
    const el = document.createElement(tag)
    el.innerText = node.data || ''
    // 判断是否有子节点需要挂载
    const len = node.children.length
    if (len) {
        for (let i = 0; i < len; i++) {
            mountEle(el, node.children[i])
        }
    }
    container.appendChild(el)
}

export const render = (container, node, newNode) => {
    // 这里由于我们只有ele，为了专心研究diff；
    // 其实这里还有一层关于 dom 的类型判断（判断svg、html、portal、component节点的区别）
    mountEle(container, node)
}

console.log('CHILDREN_FLAG', CHILDREN_FLAG)