const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {

    app.use(
        '/api', createProxyMiddleware({
            target: "http://34.100.176.190:4002",
            changeOrigin: true
        })
    );
};