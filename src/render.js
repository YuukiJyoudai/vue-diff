import {CHILDREN_FLAG} from './dom'
// render之mount函数
export const mount = (container, node, refNode) => {
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
            mount(el, node.children[i])
        }
    }
    node.$el = el
    // 增加一个判断，如果有参考节点，则将节点插入在参考节点之前
    if (refNode) {
        container.insertBefore(el, refNode)
    } else {
        container.appendChild(el)
    }
}
// render之patch
const _isSameNode = (oldN, newN) => {
    return oldN.key === newN.key && oldN.tag === newN.tag
}
const patch = (oldN, newN, container) => {
    container.node = newN
    // 预处理，不是相同的，直接 remove + mount 就可以了
    if (!_isSameNode(oldN, newN)) {
        container.removeChild(container.$el)
        mount(container, newN)
        return
    }
    // patch节点的各个属性，这里我们为了探究diff算法，结构比较简单，只有 data 中的 innerText 需要替换
    // 这里有个很关键的地方，让新节点的 $el 也获取旧节点的 $el
    const el = newN.$el = oldN.$el
    // patchData
    if (oldN.data !== newN.data) {
        el.innerText = newN.data
    }
    if (oldN.childFlag === CHILDREN_FLAG.NO_CHILD && newN.childFlag === CHILDREN_FLAG.NO_CHILD) {
        return
    }
    // patchChildren【diff关键】，这里有个预处理，判断两者的 children
    const {children: newChildren, childFlag: newFlag} = newN
    const {children: oldChildren, childFlag: oldFlag} = oldN
    patchChildren(oldChildren, oldFlag, newChildren, newFlag, oldN.$el)
}
const patchChildren = (oldC, oldF, newC, newF, container) => {
    switch(oldF) {
        case CHILDREN_FLAG.NO_CHILD:
            // 旧无节点（省略）
            break
        case CHILDREN_FLAG.SINGLE_CHILD:
            // 旧单节点（省略）
            break
        case CHILDREN_FLAG.MULTI_CHILD:
            // 旧多节点（【 DIFF 】【 DIFF 】【 DIFF 】【 DIFF 】【 DIFF 】）
            // 目标是【尽可能通过移动元素来解决，而不是 删除、添加 元素】
            let lastIndex = 0
            for (let i = 0; i < newC.length; i++) {
                const nextNode = newC[i]
                for (let j = 0; j < oldC.length; j++) {
                    const preNode = oldC[j]
                    // 寻找相同节点： 更新数据 + 移动节点
                    if (nextNode.key === preNode.key) {
                        // 这里用新的虚拟dom，去替代了旧的虚拟dom，并且最后会实装在 container（真实dom上）
                        // 【更新数据】，新虚拟dom ==> 旧虚拟dom，两者之间的差异！！所谓的DIFF！
                        patch(preNode, nextNode, container)
                        if (j < lastIndex) {
                            // 【移动节点】如果位置小于 lastIndex，则说明旧节点的位置需要移动
                            const refNode = newC[i - 1].$el.nextSibling
                            container.insertBefore(preNode.$el, refNode)
                        } else {
                            // 不需要移动的情况：如果位置大于 lastIndex，则说明是按顺序的（从小到大）
                            lastIndex = j
                        }
                        break
                    }
                }
            }
            break
    }
}
// render主体函数
export const render = (container, newNode) => {
    if (container.node) {
        if (newNode) {
            // 1.旧节点存在，新节点存在【对比更新】
            patch(container.node, newNode, container)
        } else {
            // 2.旧节点存在，新节点不存在【删除】
            container.removeChild(container.$el)
            container.node = null
        }
    } else {
        if (newNode) {
            // 3.旧节点不存在，新节点存在【新增】
            mount(container, newNode)
            container.node = newNode
        } else {
            // 4.旧节点不存在，新节点不存在【nothing】
        }
    }
}