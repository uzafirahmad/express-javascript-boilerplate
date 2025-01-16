import SocketController from '../controllers/socketControllers.js';

const socketController = new SocketController()

const socketRoutes = (io) => {
    io.on('connection', (socket) => {
        socketController.handleConnection(socket)

        socket.on('disconnect', async () => {
            socketController.handleDisconnection(socket);
        });

    })
}

export default socketRoutes;