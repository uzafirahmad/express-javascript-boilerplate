class SocketController {
    handleConnection = (socket) => {
        console.log("socket connected", socket.id)
    };

    handleDisconnection = async (socket) => {
        console.log("socket disconnected", socket.id)
    };
}

export default SocketController