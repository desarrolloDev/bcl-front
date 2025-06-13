import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"bcl-dev-92308","appId":"1:961121153987:web:a42812a707afadad6d4376","storageBucket":"bcl-dev-92308.firebasestorage.app","apiKey":"AIzaSyCZkDITXdoP66V7pZDbnZyf69x3xkuvpRI","authDomain":"bcl-dev-92308.firebaseapp.com","messagingSenderId":"961121153987","measurementId":"G-TS785WSPF3"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
