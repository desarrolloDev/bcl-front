import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

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
}
