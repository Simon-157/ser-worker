import { Server } from 'socket.io';

export function sendEmotionToClient(io: Server, sessionId: string, emotion: string): void {
  io.to(sessionId).emit('emotion_detected', emotion);
}
