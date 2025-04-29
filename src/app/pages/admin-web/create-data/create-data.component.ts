import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { InputComponent } from '../../../ui/input/input.component';
import { TextTareaComponent } from '../../../ui/text-tarea/text-tarea.component';
import { CheckboxComponent } from '../../../ui/checkbox/checkbox.component';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-create-data',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    InputComponent,
    TextTareaComponent,
    CheckboxComponent
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

  itemSelect: string = '';
  itemId: string = '';

  typeData: string = '';

  dataList: any = [];
  dataText: string = '';

  selectItem(item: string, id: string) {
    this.itemSelect = item;
    this.itemId = id;

    const listaSelectItem = this.data.filter((itemList: any) => itemList.name == item);
    // console.log('listaSelectItem', listaSelectItem);

    if (listaSelectItem.length > 0) {
      if (typeof listaSelectItem[0].data == 'string') {
        this.typeData = 'string';
        this.dataText = listaSelectItem[0].data;
      } else if (typeof listaSelectItem[0].data == 'object') {
        if (typeof listaSelectItem[0].data[0] == 'object') {
          this.typeData = 'arrayObject';
          this.dataList = listaSelectItem[0].data.map((item: any) => ({ editing: false, id: uuidv4(), name: item.name, grupal: item.grupal, individual: item.individual }));
        } else {
          this.typeData = 'arrayString';
          this.dataList = listaSelectItem[0].data.map((item: any) => ({ item, editing: false, id: uuidv4() }));
        }
      }
    }
    // console.log('this.typeData', this.typeData);
    // console.log('this.dataText', this.dataText);
    // console.log('this.dataList', this.dataList);
  }

  addItem() {
    if (this.typeData == 'arrayString') {
      this.dataList.push({
        id: uuidv4(),
        item: '',
        isNew: true,
        editing: true
      });
    } else if (this.typeData == 'arrayObject') {
      this.dataList.push({
        id: uuidv4(),
        name: '',
        grupal: false,
        individual: false,
        isNew: true,
        editing: true
      })
    }
  }

  deleteItem(item: any) {
    this.dataList = this.dataList.filter((i: any) => i.id !== item.id);
  }

  editItem(item: any) { item.editing = true; }

  stopEditing(item: any) { item.editing = false; }

  save() {
    console.log('this.dataList', this.dataList);
    console.log('this.dataText', this.dataText);
    // this.dropdownService.saveItems(this.items);

    if (this.typeData == 'string') this.fs.updateSubColeccionData(this.coleccion, this.itemId, this.dataText);
    else {
      let newData: any[] = [];
      if (this.typeData == 'arrayString') {
        this.dataList.forEach((element: any) => {
          newData.push(element.item);
        });
      } else if (this.typeData == 'arrayObject') {
        this.dataList.forEach((element: any) => {
          newData.push({
            name: element.name,
            grupal: element.grupal,
            individual: element.individual
          });
        });
      }
      this.fs.updateSubColeccionData(this.coleccion, this.itemId, newData);
    }
  }
}
