
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
const mount = (container, node) => {
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
    container.appendChild(el);
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
    const el = newN.$el = oldN.$el;
    // 更新data
    if (oldN.data !== newN.data) {
        el.innerText = newN.data;
    }
    // 这里对于children不使用diff，直接批量删除、批量添加【不进行复用】
    for (let i = 0; i < oldN.children.length; i++) {
        el.removeChild(oldN.children[i].$el);
    }
    for (let i = 0; i < newN.children.length; i++) {
        mount(el, newN.children[i]);
    }
};
// render主体函数
const render = (container, newNode) => {
    if (container.node) {
        if (newNode) {
            // 1.旧节点存在，新节点存在【对比更新】
            patch(container.node, newNode, container);
            // 更新children
            container.node = newNode;
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
