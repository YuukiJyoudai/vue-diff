// 启动服务器
import serve from 'rollup-plugin-serve'
// 服务器热加载
import livereload from 'rollup-plugin-livereload'
export default {
    input: 'main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'es'
    },
    plugins: [
        serve({
            contentBase: './dist',
            port: '8081'
        }),
        livereload()
    ]
}
