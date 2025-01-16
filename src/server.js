import { app, socket } from './app.js';

const REST_PORT = process.env.REST_PORT || 8000;
const SOCKET_PORT = process.env.SOCKET_PORT || 8080;


app.listen(REST_PORT, () => {
    console.log(`REST server is running at port ${REST_PORT}`);
});

socket.listen(SOCKET_PORT, () => {
    console.log(`SOCKET server running on port ${SOCKET_PORT}`);
});
