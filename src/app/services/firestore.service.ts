import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // Añadir Usuario
  addUser(data: any) {
    const itemRef = doc(this.firestore, 'user', data.correo);
    return setDoc(itemRef, data);
  }

  // data de un usuario
  getItemByEmail(email: string): Promise<any> {
    const itemDoc = doc(this.firestore, `user/${email}`);
    return getDoc(itemDoc).then(docSnap => {
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('El usuario no existe.');
      }
    });
  }

  // listar documentos de una colección
  obtenerDocumentos(coleccion: string): Promise<any> {
    const miColeccion = collection(this.firestore, coleccion);
    return getDocs(miColeccion).then(documentos => {
      if (documentos.docs) {
        const listaDocumentos = documentos.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        return listaDocumentos;
      } else {
        throw new Error('El usuario no existe.');
      }
    })
  }

  updateSubColeccionData(coleccion: string, documento: string, newData: any) {
    const docRef = doc(this.firestore, coleccion, documento);
    return updateDoc(docRef, documento !== 'paquete_clase' ? { data: newData } : newData);
  }

  // data de un usuario
  getSubColeccionData(ruta: string): Promise<any> {
    const itemDoc = doc(this.firestore, ruta);
    return getDoc(itemDoc).then(docSnap => {
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('El usuario no existe.');
      }
    });
  }
}
