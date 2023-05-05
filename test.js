const obj = {
	a: {
        b: 1, 
        c: 2, 
        d: {e: 5}
    },
	b: [1, 3, {a: 2, b: 3}],
	c: 3
}
const flatten = (obj) => {
    let res = {}
    let path = ''
    const dfs = (o, path) => {
        if (typeof o === 'object') {
            for (let key in o) {
                dfs(o[key], `${path}.${key}`)
            }
        } else {
            res[path] = o
        }
    }
    dfs(obj, path)
    return res
}
console.log(flatten(obj))