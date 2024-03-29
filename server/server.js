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
const io = require('socket.io')(server, {
    allowEIO3: true // false by default
  });

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnect`);
        const roomId = socket.roomId;

        socket.leave();

        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
            console.log(`total users ${room.size} in ${socket.roomId}`);

            socket.broadcast.to(socket.roomId).emit('user:leave', socket.id)    
        } else {
            console.log(`room ${socket.roomId} is empty`);
        }
        
    });

    socket.on('user:join', (roomId, callback) => {
        console.log(`${socket.id} joined ${roomId}`);
        socket.roomId = roomId;

        socket.join(roomId);
        io.in(roomId).emit('user:joined', {
            "id" : socket.id,
            "iceServers": [{
                // urls: 'stun:stun.l.google.com:19302'
                urls: "stun:openrelay.metered.ca:80"
            }]
        });

        const numClients = io.sockets.adapter.rooms.get(roomId).size;
        console.log(`total users ${numClients} in ${roomId}`);

        if (callback) {
            callback({
                id: socket.id,
                status: "ok"
            });    
        }
    });

    socket.on('user:rtc:ready', () => {
        socket.broadcast.to(socket.roomId).emit('user:rtc:ready', socket.id);
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

