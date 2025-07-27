import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { getAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class ApiService {
  async get<T>(endpoint: string): Promise<T> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const res = await fetch(`${environment.apiUrl}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return await res.json();
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const res = await fetch(`${environment.apiUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return await res.json();
  }
}
