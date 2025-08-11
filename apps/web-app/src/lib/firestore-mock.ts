// Wrapper/light mock que reexporta las APIs reales de Firestore (SDK modular v9)
// Útil para centralizar imports y facilitar futuros mocks si se requieren.

export {
    addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit,
    onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';

