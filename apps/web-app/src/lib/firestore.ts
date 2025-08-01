import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'

// Exportar la instancia de Firestore y las funciones
export { db, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } 