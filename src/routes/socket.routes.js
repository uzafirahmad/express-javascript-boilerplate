import socketController from '../controllers/socket.controller.js'

const socketRoutes = (io) => {
    io.on('connection', (socket) => {
        socketController.handleConnection(socket)

        socket.on('disconnect', async () => {
            socketController.handleDisconnection(socket);
        });

    })
}

export default socketRoutes;