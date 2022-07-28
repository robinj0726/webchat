const Koa = require('koa');
const app = new Koa();
const serve = require('koa-static');
const port = process.env.PORT || 4000;

const koaHistorify = require('koa-historify')

app.use(serve(__dirname + '/../client/dist/'));
app.use(koaHistorify(__dirname + '/../client/dist/index.html'));

const fs = require('fs');
const httpsOptions = {
    key: fs.readFileSync('./localhost.key', 'utf8'),
    cert: fs.readFileSync('./localhost.crt', 'utf8')
};

const server = require('https').createServer(httpsOptions, app.callback());
const io = require('socket.io')(server);
const clients = {};

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnect`);
        socket.leave();

        const client = clients[socket.id];
        if (!client) return;
        

        const room = io.sockets.adapter.rooms.get(client.roomId);
        if (room) {
            console.log(`total users ${room.size} in ${client.roomId}`);

            socket.broadcast.to(client.roomId).emit('user:leave', socket.id)    
        } else {
            console.log(`room ${client.roomId} is empty`);
        }
        
        delete clients[socket.id];
    });

    socket.on('user:join', (roomId, callback) => {
        console.log(`${socket.id} joined ${roomId}`);
        clients[socket.id] = {
            'roomId': roomId
        };

        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user:join', socket.id);

        const numClients = io.sockets.adapter.rooms.get(roomId).size;
        console.log(`total users ${numClients} in ${roomId}`);

        callback({
            id: socket.id,
            status: "ok"
        });
    });

    socket.on('user:rtc:ready', roomId => {
        socket.broadcast.to(roomId).emit('user:rtc:ready', socket.id);
    });

    socket.on('user:rtc:start', id => {
        io.to(id).emit('user:rtc:start', socket.id);
    });

    socket.on('user:rtc:stop', id => {
        io.to(id).emit('user:rtc:stop', socket.id);
    });

    socket.on('user:rtc:offer', ({ id, offer }) => {
        io.to(id).emit('user:rtc:offer', { id: socket.id, offer })
    });
    
    socket.on('user:rtc:answer', ({ id, answer }) => {
        io.to(id).emit('user:rtc:answer', { id: socket.id, answer })
    });

    socket.on('user:rtc:candidate', ({ id, candidate }) => {
        io.to(id).emit('user:rtc:candidate', { id: socket.id, candidate })
    });

});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

