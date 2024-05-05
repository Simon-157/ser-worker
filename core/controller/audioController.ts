import { logger } from "../../config/logger";
import { sendEmotionToClient } from "../../util/soc";
import { storeEmotion } from "../service/firebaseService";
import { startWorker } from "../service/queueService";
import { predictEmotion } from "./emotionController";


export function startProcessing(sessionId: string, io: any, userId:string): void {
  try {
    startWorker(sessionId, async (audioData) => {
      try {
        const emotion = await predictEmotion(audioData);
        logger.info(`Emotion detected: ${emotion}`);
        const res = await storeEmotion(sessionId, userId, emotion);
        // send to client
        sendEmotionToClient(io, sessionId, emotion);
      } catch (error) {
        // Handle error
       logger.error("error processing audio chunk")
      }
    });
  } catch (error) {
  logger.error("An error occured while starting worker for processing audio")
  }
}
