import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
}

const app = express();
app.use(cors(corsOptions));
const server = http.createServer(app);
export const io = new Server(server, 
    {
        cors: corsOptions,
    }
);

export default server;
