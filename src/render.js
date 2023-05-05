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
            // 这里是我们相对于单端节点对比要修改的代码部分
            let oldStartIndex = 0
            let newStartIndex = 0
            let oldEndIndex = oldC.length - 1
            let newEndIndex = newC.length - 1
            let oldStartNode = oldC[oldStartIndex]
            let oldEndNode = oldC[oldEndIndex]
            let newStartNode = newC[newStartIndex]
            let newEndNode = newC[newEndIndex]
            // 双端节点比较
            while (newStartIndex < newEndIndex && oldStartIndex < oldEndIndex) {
                if (newStartNode.key === oldStartNode.key) {
                    // 最开始的新节点 === 最开始的旧节点 => 位置没发生变化
                    patch(oldStartNode, newStartNode, container)
                    oldStartNode = oldC[++oldStartIndex]
                    newStartNode = newC[++newStartIndex]
                } else if (newEndNode.key === oldEndNode.key) {
                    // 最末尾的新节点 === 最末尾旧节点 => 位置没发生变化
                    patch(oldEndNode, newEndNode, container)
                    oldEndNode = oldC[--oldEndIndex]
                    newEndNode = newC[--newEndIndex]
                } else if (newEndNode.key === oldStartNode.key) {
                    // 最末尾的新节点 === 最开始的旧节点 => 最开始的旧节点位置变化了，要移动到最后
                    patch(oldStartNode, newEndNode, container)
                    container.insertBefore(oldStartNode.$el, oldEndNode.$el.nextSibling)
                    oldStartNode = oldC[++oldStartIndex]
                    newEndNode = newC[--newEndIndex]
                } else if (newStartNode.key === oldEndNode.key) {
                    // 最开始的新节点 === 最末尾的旧节点 => 最末尾的旧节点位置发生了变化，要移动到最前
                    patch(oldEndNode, newStartNode, container)
                    container.insertBefore(oldEndNode.$el, oldStartNode.$el)
                    newStartNode = newC[++newStartIndex]
                    oldEndNode = oldC[--oldEndIndex]
                } else {
                    // 双端没有对比到，判断一下是否是新增加点
                    // 是新增则进行必要的创建【注意这里也是找 newStartNode，和单端一样都是以新列表为准】
                    // 不是新增的则直接用 findIndex 去找到
                    const index = oldC.findIndex(node => node.key === newStartNode.key)
                    if (index > 0) {
                        const moveTarget = oldC[index]
                        patch(moveTarget, newStartNode, container)
                        container.insertBefore(moveTarget.$el, oldStartNode)
                        // 我们把旧节点移动到前面去了，但列表的匹配还要记录，这里要有个占位方便后续判断
                        oldC[index] = null
                    } else {
                        mount(container, newStartNode)
                    }
                    newStartNode = newC[++newStartIndex]
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