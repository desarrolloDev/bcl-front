import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// import { LayoutComponent } from '../app/core/pages/layout/layout.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    // LayoutComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bcl-front';

  // Import the functions you need from the SDKs you need

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  firebaseConfig = {
    apiKey: "AIzaSyCZkDITXdoP66V7pZDbnZyf69x3xkuvpRI",
    authDomain: "bcl-dev-92308.firebaseapp.com",
    projectId: "bcl-dev-92308",
    storageBucket: "bcl-dev-92308.firebasestorage.app",
    messagingSenderId: "961121153987",
    appId: "1:961121153987:web:a42812a707afadad6d4376",
    measurementId: "G-TS785WSPF3"
  };

  // Initialize Firebase
  app = initializeApp(this.firebaseConfig);
  // analytics = getAnalytics(this.app);
  auth = getAuth(this.app); // Initialize Firebase Authentication and get a reference to the service
}
