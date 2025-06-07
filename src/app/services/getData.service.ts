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

    async dataProfesoresXcurso(curso: string) {
        let profesoresList: any[] = [];

        await this.fs.getTeachersByCourse(curso)
            .then(data => {
                if (data.length > 0) {
                    const newLista = data.map((item) => {
                        return { nombre: `${item.nombre} ${item.apellido}`, id: item.id }
                    })
                    profesoresList = newLista
                }
            }).catch((error) => { profesoresList = []; });

        const profesores = await this.dataProfesores();

        const profesoresValidos: any[] = [];
        for (let i = 0; i < profesoresList.length; i++) {
            const searchProf = profesores.filter((item) => item.id == profesoresList[i].id);
            if (searchProf.length > 0) profesoresValidos.push(searchProf[0]);
        }

        return profesoresValidos;
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

    async saveReservation(data: any): Promise<void> {
        let response = '';
        await this.fs.saveReservation(data)
        .then(data => { response = 'Guardado'; })
        .catch((error) => { response = 'Error'; });
    }

    async getReservation(profesorId: string, alumnoId: string, fechaInicio: Date, fechaFin: Date): Promise<void> {
        
    }
}
