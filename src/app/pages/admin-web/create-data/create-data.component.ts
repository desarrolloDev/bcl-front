import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { InputComponent } from '../../../ui/input/input.component';
import { TextTareaComponent } from '../../../ui/text-tarea/text-tarea.component';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { SelectComponent } from '../../../ui/select/select.component';
import { FirestoreService } from '../../../services/firestore.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-create-data',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    InputComponent,
    TextTareaComponent,
    CheckboxComponent,
    SelectComponent
  ],
  templateUrl: './create-data.component.html',
  styleUrl: './create-data.component.scss'
})
export class CreateDataComponent {
  @Input() data: any = [];
  @Input() coleccion: string = '';

  constructor(
    private fs: FirestoreService
  ) {}

  itemSelect: string = ''; // item seleccionado de las opciones (nombre)
  itemId: string = ''; // item seleccionado de las opciones (id)

  typeData: string = ''; // Sirve para saber si es data standar o personalizada (Standar: string - arrayString)
  dataText: string = ''; // data para tipo string
  dataList: any = []; // data para tipo arrayString

  listCursos: { id: string, nombre: string }[] = [];
  cursoSelect: string = '';
  data_paquete_precio: any = [];

  selectItem(item: string, id: string) {
    this.itemSelect = item;
    this.itemId = id;

    const listaSelectItem = this.data.filter((itemList: any) => itemList.id == id);
    console.log('listaSelectItem', listaSelectItem);

    if (listaSelectItem[0].type == 'string') {

      this.typeData = 'string';
      this.dataText = listaSelectItem[0].data.length > 0 ? listaSelectItem[0].data : [];

    } else if (listaSelectItem[0].type == 'arrayString') {

      this.typeData = 'arrayString';
      this.dataList = listaSelectItem[0].data.length > 0 ? listaSelectItem[0].data.map((item: any) => ({ item, editing: false, id: uuidv4() })) : [];

    } else if (listaSelectItem[0].type == 'personalizado') {

      if (listaSelectItem[0].id == 'paquete_clase') {

        this.typeData = 'paquete_precio';
  
        const searchCursos = this.data.filter((itemList: any) => itemList.id == 'curso');
        if (searchCursos.length > 0) {

          this.listCursos = searchCursos[0].data.map((item: any) => ({ id: item, nombre: item }));
  
          const newDataPaquetePrecio = [];
          for (let i = 0; i < searchCursos[0].data.length; i++) {
            const curso = searchCursos[0].data[i];

            const dataCurso = Object.entries(listaSelectItem[0])
              .filter(([clave, valor]) => clave == curso)
              .map(([clave, valor]) => valor);
            console.log('dataCurso', dataCurso)
            newDataPaquetePrecio.push({ id: curso, data: dataCurso.length > 0 ? dataCurso[0] : [] });

          }
          console.log('newDataPaquetePrecio', newDataPaquetePrecio);
  
          this.data_paquete_precio = newDataPaquetePrecio;
        } 
      }

    }
  }

  addItem() {
    if (this.typeData == 'arrayString') {
      this.dataList.push({
        id: uuidv4(),
        item: '',
        isNew: true,
        editing: true
      });
    } else if (this.typeData == 'paquete_precio') {
      this.data_paquete_precio.forEach((element: any) => {
        if (element.id == this.cursoSelect) {
          element.data = [...element.data, {
            id: uuidv4(),
            name: '',
            grupal: 0,
            individual: 0,
            isNew: true,
            editing: true
          }];
        }
      });
    }
  }

  deleteItem(item: any) {
    if (this.typeData == 'arrayString') this.dataList = this.dataList.filter((i: any) => i.id !== item.id);
    else if (this.typeData == 'paquete_precio') console.log('no')
  }

  editItem(item: any) { item.editing = true; }

  stopEditing(item: any) { item.editing = false; }

  save() {
    if (this.typeData == 'string') this.fs.updateSubColeccionData(this.coleccion, this.itemId, this.dataText);
    else if (this.typeData == 'string') {
      let newData: any[] = [];
      this.dataList.forEach((element: any) => {
        newData.push(element.item);
      });
      this.fs.updateSubColeccionData(this.coleccion, this.itemId, newData);
    } else if (this.typeData == 'paquete_precio') {
      this.data_paquete_precio.forEach((element: any) => {
        const newData: any = [];
        element.data.forEach((element: any) => {
          element.isNew = false;
          element.editing = false;
          newData.push(element);
        });
        this.fs.updateSubColeccionData(this.coleccion, this.itemId, { [element.id]: newData });
      });
    }
  }
}
