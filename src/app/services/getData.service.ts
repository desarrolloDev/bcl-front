import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { FirestoreService } from './firestore.service';
import { retryWhen } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GetDataService {
    constructor(
        private dataService: DataService,
        private fs: FirestoreService
    ) { }

    async getDataAlumnosTC() {
        let terminos = '';
        if (this.dataService.termCondAlumno.length == 0) {
            await this.fs.getSubColeccionData('data_alumnos/terminos_condiciones')
                .then(data => {
                    this.dataService.setTermCondAlumno(data.data);
                    terminos = data.data;
                })
                .catch((error) => { console.log('error', error); });
        } else terminos = this.dataService.termCondAlumno;
        return terminos;
    }

    async getCursosAlumnos() {
        let cursos = [];
        if (this.dataService.datosCursosProfAlumno.length == 0) {
            await this.fs.getSubColeccionData('data_alumnos/curso')
                .then(data => {
                    this.dataService.setDatosCursosAlumno(data.data);
                    cursos = data.data;
                })
                .catch((error) => { console.log('error', error); });
        } else cursos = this.dataService.datosCursosProfAlumno;
        return cursos;
    }

    async getPaquetes(curso: string, tipo: string) { // ciclo_grado - paquete_clase
        let paquete: any[] = [];
        
        await this.fs.getPaquetes(curso, tipo)
            .then((data: any) => { paquete = data; })
            .catch((error) => { paquete = []; });

        return paquete;
    }

    async dataProfesores() {
        let profesoresList: any[] = [];
        if (this.dataService.listaProf.length == 0) {
            await this.fs.getSubColeccionData('data_alumnos/profesor_preferencia')
                .then(data => {
                    this.dataService.setListaProf(data.data);
                    profesoresList = data.data;
                })
                .catch((error) => {
                    console.log('error', error);
                    this.dataService.setListaProf([]);
                });
        } else profesoresList = this.dataService.listaProf;
        return profesoresList;
    }

    async horariosList() {
        let lista: any[] = [];
        if (this.dataService.datosHorarios.length == 0) {
            await this.fs.getSubColeccionData('data_profesor/horarios')
                .then(data => {
                    this.dataService.setDatosHorarios(data.data);
                    lista = data.data;
                }).catch((error) => { lista = []; });
        } else lista = this.dataService.datosHorarios;
        return lista;
    }

    async terminos_condiciones_prof() {
        let terminos_condiciones: string = '';
        if (this.dataService.termCondProf.length == 0) {
            await this.fs.getSubColeccionData('data_profesor/terminos_condiciones')
                .then(data => {
                    this.dataService.setTermCondProf(data.data);
                    terminos_condiciones = data.data;
                }).catch((error) => { terminos_condiciones = ''; });
        } else terminos_condiciones = this.dataService.termCondProf;
        return terminos_condiciones;
    }

    async data_cursos_prof() {
        let lista: any[] = [];
        if (this.dataService.datosCursosProf.length == 0) {
            await this.fs.getSubColeccionData('data_profesor/cursos')
                .then(data => {
                    this.dataService.setDatosCursos(data.data);
                    lista = data.data;
                }).catch((error) => { lista = []; });
        } else lista = this.dataService.datosCursosProf;
        return lista;
    }
}
