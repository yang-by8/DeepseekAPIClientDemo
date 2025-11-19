export default {
  // 开发服务器配置
  server: {
    // 启动时自动打开浏览器
    open: false,
    // 开发服务器端口，默认是 5173，可根据需要修改
    port: 5011,
    // 允许来自任何源的请求（开发环境下方便调试）
    cors: true,

    // 代理配置，解决跨域问题 --在这个项目中没用到，这个调的是在线的deepseekapi,不是本地的ollama接口。
    proxy: {
      // 当请求路径以 '/ollama' 开头时，代理到 Ollama 服务
      '/ollama': {
        target: 'http://127.0.0.1:11434', // Ollama 服务默认地址  
        changeOrigin: true, // 必要时修改请求头中的 Origin
        secure:false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', function (proxyReq, req, res) {
            proxyReq.removeHeader('referer') 
            proxyReq.removeHeader('origin') 
          });
          proxy.on('proxyRes', function (proxyRes, req, res) {
            delete proxyRes.headers['set-cookie']
            proxyRes.headers['cookie'] = '';
          });
        },
        // 不需要重写路径，因为 Ollama API 本身就以 /api 开头
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      }
    }
  },
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 生产环境源映射
    sourcemap: false,
    // 压缩配置
    minify: 'esbuild'
  }
};