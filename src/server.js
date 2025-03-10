import { server } from './app.js';

const PORT = process.env.PORT || 8002;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});