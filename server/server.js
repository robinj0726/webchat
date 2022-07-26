const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const port = process.env.PORT || 4000;

app.use(serve(__dirname + '/../client/dist/'));

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const socketActions = {
    connection: 'connection',
    disconnect: 'disconnect',
    createOrJoin: "create or join",
    created: "created",
    join: "join",
    joined: "joined",
    message: "message",
    data: "data",
};

io.on(socketActions.connection, (socket) => {
    console.log(`${socket.id} connected`);
    socket.on(socketActions.disconnect, () => {
        console.log(`${socket.id} disconnect`);
    });

    socket.on(socketActions.createOrJoin, (room, callback) => {
        console.log(`${socket.id} joined ${room}`);
        socket.join(room);

        numberClients = io.sockets.adapter.rooms.get(room).size;
        console.log(numberClients)

        callback({
            status: "ok"
        });
      });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

