import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// const token = await firebase.auth().currentUser.getIdToken();
// fetch('https://tu-api.amazonaws.com/Prod/items', {
//   headers: {
//     Authorization: `Bearer ${token}`
//   }
// });

@Injectable({ providedIn: 'root' })
export class AwsService {

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${environment.apiUrlLocal}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${environment.apiUrlLocal}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  }
}
