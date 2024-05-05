import { db } from '@config/firebase';
import { logger } from '@config/logger';
import { collection, doc, setDoc, getDoc, Timestamp, updateDoc, arrayUnion,  } from 'firebase/firestore';


// types
type Emotion = {
  emotion: string;
  timestamp: Timestamp;
};

type Session = {
  sessionId: string;
  userId: string;
  createdAt: Timestamp;
  emotions: Emotion[];
};

export async function createSession(sessionId: string, userId: string): Promise<void> {
  try {
    const sessionsCollection = collection(db, 'sessions');
    const sessionDoc = doc(sessionsCollection, sessionId);
    const newSession: Session = {
      sessionId,
      userId,
      createdAt: Timestamp.now(),
      emotions: [] // Initialize emotions as an empty array
    };
    await setDoc(sessionDoc, newSession);
  } catch (error) {
    logger.log({ level: "error", message: `Error creating session: ${error}` });
    throw new Error('Failed to create session');
  }
}

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const sessionsCollection = collection(db, 'sessions');
    const sessionDoc = doc(sessionsCollection, sessionId);
    const snapshot = await getDoc(sessionDoc);
    if (snapshot.exists()) {
      return snapshot.data() as Session;
    } else {
      throw new Error(`Session ${sessionId} does not exist`);
    }
  } catch (error) {
    logger.log({ level: "error", message: `Error getting session: ${error}` });
    throw new Error('Failed to get session');
  }
}

export async function storeEmotion(sessionId: string, userId: string, emotion: string): Promise<void> {
  try {
    const sessionsCollection = collection(db, 'sessions');
    const sessionDoc = doc(sessionsCollection, sessionId);
    const newEmotion: Emotion = {
      emotion,
      timestamp: Timestamp.now()
    };
    await updateDoc(sessionDoc, {
      emotions: arrayUnion(newEmotion) 
    });
  } catch (error) {
    logger.log({ level: "error", message: `Error storing emotion: ${error}` });
    throw new Error('Failed to store emotion');
  }
}

export async function getEmotions(sessionId: string): Promise<Emotion[] | null> {
  try {
    const sessionData = await getSession(sessionId);
    return sessionData?.emotions || null;
  } catch (error) {
    logger.log({ level: "error", message: `Error getting emotions: ${error}` });
    throw new Error('Failed to get emotions');
  }
}