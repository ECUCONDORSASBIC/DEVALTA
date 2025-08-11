// DEPRECATED: Usa '../lib/firestore-mock' directamente.
// Este archivo se mantiene como shim temporal para compatibilidad y será removido.
// Motivo: centralizamos las importaciones del SDK modular en 'firestore-mock'
// para evitar usos incorrectos (p.ej. collection() sin pasar 'db').

export {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from './firestore-mock'

// Mantener export de 'db' por compatibilidad si alguien lo importaba desde aquí
export { db } from '../../config/firebase'
