const Koa = require('koa');
const app = new Koa();
const port = 4000;

const server = require('http').createServer(app.callback());
server.listen(port, () => {
    console.log(`the server listening on port ${port}`)
});
