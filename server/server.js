const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const port = process.env.PORT || 4000;

app.use(serve(__dirname + '/../client/dist/'));

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('a user connected');
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});
