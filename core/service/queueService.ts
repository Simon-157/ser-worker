import { Queue, Worker } from 'bullmq';
import { redisClient } from '../../config/redis';
import { logger } from '../../config/logger';

const audioQueues: Record<string, Queue> = {};
const workers: Record<string, Worker> = {};

export function createQueue(sessionId: string): void {
  if (!audioQueues[sessionId]) {
    audioQueues[sessionId] = new Queue(sessionId, {connection:redisClient});
    logger.info(`Queue for session ${sessionId} created`);
  } else {
    logger.error(`Queue for session ${sessionId} already exists`);
    throw new Error(`Queue for session ${sessionId} already exists`);
  }
}

export function sendToQueue(sessionId: string, audioData: string): void {
  if (!audioQueues[sessionId]) {
    logger.error(`Queue for session ${sessionId} does not exist`);
    throw new Error(`Queue for session ${sessionId} does not exist`);
  }
  audioQueues[sessionId].add('process_audio', { audioData });
  logger.info(`Audio data sent to queue for session ${sessionId}`);
}

export function startWorker(sessionId: string, processAudioChunk: (audioData: string) => Promise<void>): void {
  if (!audioQueues[sessionId]) {
    logger.error(`Queue for session ${sessionId} does not exist`);
    throw new Error(`Queue for session ${sessionId} does not exist`);
  }
  workers[sessionId] = new Worker(sessionId, async (job) => {
    const audioData = job.data.audioData;
    await processAudioChunk(audioData);
    logger.info(`Audio data processed for session ${sessionId}`);
  },
  {
    concurrency:50,
    connection:redisClient
  }
);
  logger.info(`Worker started for session ${sessionId}`);
}

export function stopWorker(sessionId: string): void {
  if (workers[sessionId]) {
    workers[sessionId].close();
    delete workers[sessionId];
    logger.info(`Worker stopped for session ${sessionId}`);
  }
}

export function cleanupQueue(sessionId: string): void {
  if (audioQueues[sessionId]) {
    audioQueues[sessionId].close();
    delete audioQueues[sessionId];
    logger.info(`Queue cleaned up for session ${sessionId}`);
  }
}