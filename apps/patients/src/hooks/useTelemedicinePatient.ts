'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getFirestore, doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const useTelemedicinePatient = (sessionId, patientId, doctorId) => {
  const [session, setSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const db = getFirestore();
    const sessionRef = doc(db, 'telemedicine_sessions', sessionId);

    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setSession({ id: doc.id, ...doc.data() });
      } else {
        setError('La sesión de telemedicina no fue encontrada.');
      }
    });

    const messagesRef = collection(db, `telemedicine_sessions/${sessionId}/messages`);
    const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.timestamp - b.timestamp);
      setChatHistory(messages);
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [sessionId]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const db = getFirestore();
    const messagesRef = collection(db, `telemedicine_sessions/${sessionId}/messages`);
    
    try {
      await addDoc(messagesRef, {
        text,
        sender: 'patient',
        senderId: patientId,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error enviando mensaje: ", e);
      setError("No se pudo enviar el mensaje.");
    }
  }, [sessionId, patientId]);

  return { session, chatHistory, sendMessage, error };
};
