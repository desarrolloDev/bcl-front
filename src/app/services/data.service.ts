import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _datosListasAlumno: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosListasProfesor: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor() {
  }

  setDatosListasAlumno(value: any) { this._datosListasAlumno.next(value); }
  get datosListasAlumno(): any { return this._datosListasAlumno.value; }

  setDatosListasProfesor(value: any) { this._datosListasProfesor.next(value); }
  get datosListasProfesor(): any { return this._datosListasProfesor.value; }
}
