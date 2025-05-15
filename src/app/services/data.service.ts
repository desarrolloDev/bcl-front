import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _datosListasAlumno: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosListasProfesor: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosHorarios: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosCursos: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _termCondProf: BehaviorSubject<any> = new BehaviorSubject<string>('');

  constructor() {
  }

  setDatosListasAlumno(value: any) { this._datosListasAlumno.next(value); }
  get datosListasAlumno(): any { return this._datosListasAlumno.value; }

  setDatosListasProfesor(value: any) { this._datosListasProfesor.next(value); }
  get datosListasProfesor(): any { return this._datosListasProfesor.value; }

  setDatosHorarios(value: any) { this._datosHorarios.next(value); }
  get datosHorarios(): any { return this._datosHorarios.value; }

  setDatosCursos(value: any) { this._datosCursos.next(value); }
  get datosCursos(): any { return this._datosCursos.value; }

  setTermCondProf(value: any) { this._termCondProf.next(value); }
  get termCondProf(): any { return this._termCondProf.value; }
}
