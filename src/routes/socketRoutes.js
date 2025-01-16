import {
    handleConnection,
    handleDisconnection,
} from '../controllers/socketControllers.js';

const socketRoutes = (io) => {
    io.on('connection', (socket) => {
        handleConnection(socket);

        socket.on('disconnect', async () => {
            handleDisconnection(socket);
        });

    })
}

export default socketRoutes;