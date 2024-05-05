import { Server, Socket } from 'socket.io';
import { startProcessing } from './audioController';
import { logger } from '@config/logger';
import { createSession } from '@core/service/firebaseService';
import { createQueue, sendToQueue, cleanupQueue } from '@core/service/queueService';

export function setupSocket(io: Server): void {
    //
    logger.log("info", "Setting up socket");

  io.on('connection', (socket: Socket) => {
    logger.log("info", "client connected");
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
        logger.error('Error creating session:', error);
        socket.emit('error', 'Failed to create session');
      }
    });

    socket.on('audio_chunk', (sessionId: string, userId: string, audioData: string) => {
      try {
        sendToQueue(sessionId, audioData);
      } catch (error) {
        // Handle error
        logger.error('Error sending audio chunk to queue:', error);
        socket.emit('error', 'Failed to send audio chunk to queue');
      }
    });

    socket.on('disconnect', () => {
      logger.log("info", "client disconnected");
    });

    socket.on('end_session', async (sessionId: string) => {
      try {
        cleanupQueue(sessionId);
        // await deleteSession(sessionId);
        // // Notify client that session is ended
        io.to(sessionId).emit('session_ended');
      } catch (error) {
        // Handle error
        logger.error('Error ending session:', error);
        socket.emit('error', 'Failed to end session');
      }
    });
  });

  logger.log("info", "Socket setup complete");
}
