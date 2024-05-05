import { Server, Socket } from 'socket.io';
import { createSession } from '../service/firebaseService';
import { createQueue, sendToQueue, cleanupQueue } from '../service/queueService';
import { startProcessing } from './audioController';

export function setupSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('create_session', async (sessionId: string, userId: string) => {
      try {
        createQueue(sessionId);
        await createSession(sessionId, userId);
        // Notify client that session is created
        socket.emit('session_created', sessionId);
        io.to(sessionId).emit('session_created', sessionId);
        // start processing audio
        startProcessing(sessionId, io, userId);
    } catch (error) {
        // Handle error
        console.error('Error creating session:', error);
        socket.emit('error', 'Failed to create session');
      }
    });

    socket.on('audio_chunk', (sessionId: string, userId: string, audioData: string) => {
      try {
        sendToQueue(sessionId, audioData);
      } catch (error) {
        // Handle error
        console.error('Error sending audio chunk to queue:', error);
        socket.emit('error', 'Failed to send audio chunk to queue');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('end_session', async (sessionId: string) => {
      try {
        cleanupQueue(sessionId);
        // await deleteSession(sessionId);
        // // Notify client that session is ended
        io.to(sessionId).emit('session_ended');
      } catch (error) {
        // Handle error
        console.error('Error ending session:', error);
        socket.emit('error', 'Failed to end session');
      }
    });
  });
}
