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

  updateSubColeccionData(coleccion: string, documento: string, newData: any, tipo: string | '') {
    const docRef = doc(this.firestore, coleccion, documento);
    return updateDoc(docRef, documento !== 'paquete_clase' ? (tipo == '' ? { data: newData } : newData) : newData);
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

  async getAllReservasSemana(uid: string, semanas: any[]) {
    const dataSemal: any = {};

    for (let i = 0; i < semanas.length; i++) {
      await this.getReservas(uid, semanas[i].id.replaceAll('/', '|'))
      .then(data => {
        dataSemal[semanas[i].id] = data;
      }).catch((error) => {
        dataSemal[semanas[i].id] = [];
      });
    }

    return dataSemal;
  }

  async getReservas(uid: string, periodo: string): Promise<any[]> {
    const docRef = doc(this.firestore, 'reservas_clase', uid);
    const snapshot = await getDoc(docRef);
  
    if (!snapshot.exists()) {
      throw new Error('Documento no encontrado');
    }
  
    const data = snapshot.data();
  
    const reservas = data[periodo];
  
    if (!reservas) {
      console.warn('No hay reservas en este periodo');
      return [];
    }

    return Object.values(reservas);
  }
}
