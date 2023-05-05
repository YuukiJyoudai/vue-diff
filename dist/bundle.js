
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
// 本文章仅为了研究 diff 算法，所以 node-type 仅为 ul、li(html元素)
// 不考虑除了ul、li以外的元素
// 不考虑vnode中的样式、事件
const CHILDREN_FLAG = {
    NO_CHILD: 0,
    SINGLE_CHILD: 1,
    MULTI_CHILD: 1 << 1
};
/**
 * 用 vNode 描述真实 DOM
 * @param {string} tag - 元素标签类型
 * @param {string} data - 元素标签内容
 * @param {array} children - 元素子节点
 * @returns tag, data, children, childrenFlag, key
 */
class VNode {
    constructor({tag, data, key, children = []}) {
        let childFlag;
        let len = children.length;
        if (len) {
            childFlag = len > 1 ? CHILDREN_FLAG.MULTI_CHILD : CHILDREN_FLAG.SINGLE_CHILD;
        } else {
            childFlag = CHILDREN_FLAG.NO_CHILD;
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

// render之mount函数
const mount = (container, node, refNode) => {
    if (!container || !node) {
        return
    }
    const tag = node.tag;
    const el = document.createElement(tag);
    el.innerText = node.data || '';
    // 判断是否有子节点需要挂载
    const len = node.children.length;
    if (len) {
        for (let i = 0; i < len; i++) {
            mount(el, node.children[i]);
        }
    }
    node.$el = el;
    // 增加一个判断，如果有参考节点，则将节点插入在参考节点之前
    if (refNode) {
        container.insertBefore(el, refNode);
    } else {
        container.appendChild(el);
    }
};
// render之patch
const _isSameNode = (oldN, newN) => {
    return oldN.key === newN.key && oldN.tag === newN.tag
};
const patch = (oldN, newN, container) => {
    container.node = newN;
    // 预处理，不是相同的，直接 remove + mount 就可以了
    if (!_isSameNode(oldN, newN)) {
        container.removeChild(container.$el);
        mount(container, newN);
        return
    }
    // patch节点的各个属性，这里我们为了探究diff算法，结构比较简单，只有 data 中的 innerText 需要替换
    // 这里有个很关键的地方，让新节点的 $el 也获取旧节点的 $el
    const el = newN.$el = oldN.$el;
    // patchData
    if (oldN.data !== newN.data) {
        el.innerText = newN.data;
    }
    if (oldN.childFlag === CHILDREN_FLAG.NO_CHILD && newN.childFlag === CHILDREN_FLAG.NO_CHILD) {
        return
    }
    // patchChildren【diff关键】，这里有个预处理，判断两者的 children
    const {children: newChildren, childFlag: newFlag} = newN;
    const {children: oldChildren, childFlag: oldFlag} = oldN;
    patchChildren(oldChildren, oldFlag, newChildren, newFlag, oldN.$el);
};
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
            let oldStartIndex = 0;
            let newStartIndex = 0;
            let oldEndIndex = oldC.length - 1;
            let newEndIndex = newC.length - 1;
            let oldStartNode = oldC[oldStartIndex];
            let oldEndNode = oldC[oldEndIndex];
            let newStartNode = newC[newStartIndex];
            let newEndNode = newC[newEndIndex];
            // 双端节点比较
            while (newStartIndex < newEndIndex && oldStartIndex < oldEndIndex) {
                if (newStartNode.key === oldStartNode.key) {
                    // 最开始的新节点 === 最开始的旧节点 => 位置没发生变化
                    patch(oldStartNode, newStartNode, container);
                    oldStartNode = oldC[++oldStartIndex];
                    newStartNode = newC[++newStartIndex];
                } else if (newEndNode.key === oldEndNode.key) {
                    // 最末尾的新节点 === 最末尾旧节点 => 位置没发生变化
                    patch(oldEndNode, newEndNode, container);
                    oldEndNode = oldC[--oldEndIndex];
                    newEndNode = newC[--newEndIndex];
                } else if (newEndNode.key === oldStartNode.key) {
                    // 最末尾的新节点 === 最开始的旧节点 => 最开始的旧节点位置变化了，要移动到最后
                    patch(oldStartNode, newEndNode, container);
                    container.insertBefore(oldStartNode.$el, oldEndNode.$el.nextSibling);
                    oldStartNode = oldC[++oldStartIndex];
                    newEndNode = newC[--newEndIndex];
                } else if (newStartNode.key === oldEndNode.key) {
                    // 最开始的新节点 === 最末尾的旧节点 => 最末尾的旧节点位置发生了变化，要移动到最前
                    patch(oldEndNode, newStartNode, container);
                    container.insertBefore(oldEndNode.$el, oldStartNode.$el);
                    newStartNode = newC[++newStartIndex];
                    oldEndNode = oldC[--oldEndIndex];
                } else {
                    // 双端没有对比到，判断一下是否是新增加点
                    // 是新增则进行必要的创建【注意这里也是找 newStartNode，和单端一样都是以新列表为准】
                    // 不是新增的则直接用 findIndex 去找到
                    const index = oldC.findIndex(node => node.key === newStartNode.key);
                    if (index > 0) {
                        const moveTarget = oldC[index];
                        patch(moveTarget, newStartNode, container);
                        container.insertBefore(moveTarget.$el, oldStartNode);
                        // 我们把旧节点移动到前面去了，但列表的匹配还要记录，这里要有个占位方便后续判断
                        oldC[index] = null;
                    } else {
                        mount(container, newStartNode);
                    }
                    newStartNode = newC[++newStartIndex];
                }
            }
            break
    }
};
// render主体函数
const render = (container, newNode) => {
    if (container.node) {
        if (newNode) {
            // 1.旧节点存在，新节点存在【对比更新】
            patch(container.node, newNode, container);
        } else {
            // 2.旧节点存在，新节点不存在【删除】
            container.removeChild(container.$el);
            container.node = null;
        }
    } else {
        if (newNode) {
            // 3.旧节点不存在，新节点存在【新增】
            mount(container, newNode);
            container.node = newNode;
        }
    }
};

// 目标：创建真实 dom ul - li*5
// 5个li节点
const arr = 'ABCDE';
var liMap = {};
for (let i = 0; i < arr.length; i++) {
    liMap[i] = new VNode({
        tag: 'li',
        key: arr[i],
        data: `${arr[i]}`
    });
}
const oldList = [...Array(5).fill('').map((item, index) => liMap[index])];
// ul外层节点 + 5个li节点【旧的】
var oldNode = new VNode({
    tag: 'ul',
    children: oldList
});
const oRoot = document.getElementById('root');
// 使用 mutationObserver 查看 dom 操作的事件
const observer = new MutationObserver((mutationList) => {
    console.log('mutationList', mutationList);
});

observer.observe(oRoot, {
    // 监听属性值的变化
    attributes: true,
    // 监听节点的新增与删除
    childList: true,
    // 以 target 为根节点的整个子树
    subtree: true
});

render(oRoot, oldNode);

// 如果说新的顺序是 'EABDC'
// 乱序函数
const sort = (str, arr) => {
    const res = [].concat(arr);
    return res.sort((a, b) => {
        const keyPre = str.indexOf(a.key);
        const keyNext = str.indexOf(b.key);
        // 为负值的则在前面
        return keyPre - keyNext
    })
};

// 从 ABCED 变为 EABDC
const newList = sort('EABDC', oldList);
const newNode = new VNode({
    tag: 'ul',
    children: newList
});

// 替换 DOM 的入口
setTimeout(() => {
    performance.mark('start');
    render(oRoot, newNode);
    setTimeout(() => {
        performance.mark('end');
        console.log(performance.measure('test', 'start', 'end'));
    }, 0);
}, 500);
