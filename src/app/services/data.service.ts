import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _datosListasAlumno: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosListasProfesor: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosHorarios: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosCursosProf: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _datosSelectCursosProf: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _termCondProf: BehaviorSubject<any> = new BehaviorSubject<string>('');
  private _listaProf: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _termCondAlumno: BehaviorSubject<any> = new BehaviorSubject<string>('');
  private _datosCursosAlumno: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _gradoAlumno: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _paquetesAlumno: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor() {
  }

  setDatosListasAlumno(value: any) { this._datosListasAlumno.next(value); }
  get datosListasAlumno(): any { return this._datosListasAlumno.value; }

  setDatosListasProfesor(value: any) { this._datosListasProfesor.next(value); }
  get datosListasProfesor(): any { return this._datosListasProfesor.value; }

  setDatosHorarios(value: any) { this._datosHorarios.next(value); }
  get datosHorarios(): any { return this._datosHorarios.value; }

  setDatosCursos(value: any) { this._datosCursosProf.next(value); }
  get datosCursosProf(): any { return this._datosCursosProf.value; }

  setDatosSelectCursosProf(value: any) { this._datosSelectCursosProf.next(value); }
  get datosSelectCursosProf(): any { return this._datosSelectCursosProf.value; }

  setTermCondProf(value: any) { this._termCondProf.next(value); }
  get termCondProf(): any { return this._termCondProf.value; }

  setListaProf(value: any) { this._listaProf.next(value); }
  get listaProf(): any { return this._listaProf.value; }

  setTermCondAlumno(value: any) { this._termCondAlumno.next(value); }
  get termCondAlumno(): any { return this._termCondAlumno.value; }

  setDatosCursosAlumno(value: any) { this._datosCursosAlumno.next(value); }
  get datosCursosProfAlumno(): any { return this._datosCursosAlumno.value; }

  setGradoAlumno(value: any) { this._gradoAlumno.next(value); }
  get gradoAlumno(): any { return this._gradoAlumno.value; }

  setPaquetesAlumno(value: any) { this._paquetesAlumno.next(value); }
  get paquetesAlumno(): any { return this._paquetesAlumno.value; }
}
