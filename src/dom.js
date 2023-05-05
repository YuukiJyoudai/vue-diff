// 本文章仅为了研究 diff 算法，所以 node-type 仅为 ul、li(html元素)
// 不考虑除了ul、li以外的元素
// 不考虑vnode中的样式、事件
export const CHILDREN_FLAG = {
    NO_CHILD: 0,
    SINGLE_CHILD: 1,
    MULTI_CHILD: 1 << 1
}
/**
 * 用 vNode 描述真实 DOM
 * @param {string} tag - 元素标签类型
 * @param {string} data - 元素标签内容
 * @param {array} children - 元素子节点
 * @returns tag, data, children, childrenFlag, key
 */
export class VNode {
    constructor({tag, data, key, children = []}) {
        let childFlag
        let len = children.length
        if (len) {
            childFlag = len > 1 ? CHILDREN_FLAG.MULTI_CHILD : CHILDREN_FLAG.SINGLE_CHILD
        } else {
            childFlag = CHILDREN_FLAG.NO_CHILD
        }
        return {
            tag,
            data,
            key,
            children,
            childFlag
        }
    }
}