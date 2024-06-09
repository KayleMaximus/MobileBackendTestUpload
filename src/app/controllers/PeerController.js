const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
class PeerController {

    //[GET] /home
    async index(req, res){
      io.on('connection', (socket) => {
        console.log('A user connected');
    
        socket.on('joinRoom', (roomName) => {
            socket.join(roomName);
            console.log(`User joined room: ${roomName}`);
        });
    
        socket.on('addSong', (roomName, song) => {
            io.to(roomName).emit('songAdded', song);
        });
    
        // Other event handlers for managing playlist, playback, etc.
    });
      res.status(200).json({ mes:'Hello From Peerjs' });
    }

}

module.exports = new PeerController;