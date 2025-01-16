export const handleConnection = (socket) => {
    console.log("socket connected", socket.id)
};

export const handleDisconnection = async (socket) => {
    console.log("socket disconnected", socket.id)
};
