import { exec as execCb } from 'child_process';
import { writeFileSync } from 'fs';
import { promisify } from 'util';

const exec = promisify(execCb);

const emotionLabels = ["neutral", "calm", "happy", "sad", "angry", "fearful", "disgust", "surprised"];

export async function predictEmotion(audioData: string): Promise<string> {
  // Write audio data to file
  writeFileSync('temp_audio.wav', audioData, 'binary');

  // Execute emotion prediction script
  const command = 'python emotion_prediction.py temp_audio.wav';
  const { stdout, stderr } = await exec(command);
  
  if (stderr) {
    throw new Error(stderr);
  }

  const emotionIndex = parseInt(stdout);
  return emotionLabels[emotionIndex];
}

