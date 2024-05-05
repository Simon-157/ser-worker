import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './core/controller/socketController';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

setupSocket(io);

export default app;
