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
    container.$el = el
    container.appendChild(el)
}

// 对比diff算法的入口

// 依次判断对应节点的相关属性
// 判断 children 的时候使用 diff 算法？

const patch = (oldNode, newNode) => {
    console.log('oldNode', oldNode, newNode)
}

export const render = (container, newNode) => {
    // 这里由于我们只有ele，为了专心研究diff；
    // 其实这里还有一层关于 dom 的类型判断（判断svg、html、portal、component节点的区别）
    if (container.node) {
        // 如果存在旧节点 + 新节点
        if (newNode) {
            patch(container.node, newNode)
            container.node = newNode
        } else {
            // 有旧节点 + 没有新节点 => （说明要删除节点了）
            container.removeChild(container.$el)
            container.node = null
        }
    } else {
        // 如果不存在旧节点
        if (newNode) {
            mountEle(container, newNode)
            container.node = newNode
        }
        // 如果新节点也不存在
        // do nothing.
    }
}
