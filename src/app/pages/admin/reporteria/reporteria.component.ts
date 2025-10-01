import { Component, Input, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { ModalService } from '../../../ui/modal/modal.service';
import { AwsService } from '../../../services/aws.service';
import { ListService } from '../../../services/list.service';
import { CalendarInputComponent } from '../../../ui/calendar-input/calendar-input.component';

@Component({
  selector: 'app-reporteria',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CalendarInputComponent
  ],
  templateUrl: './reporteria.component.html',
  styleUrl: './reporteria.component.scss'
})
export class ReporteriaComponent implements OnInit {
  private _fb = inject(NonNullableFormBuilder);

  @Input() data: any = [
    { id: '1', name: 'Reporte reservas' },
    // { id: '2', name: 'Reporte 2' },
    // { id: '3', name: 'Reporte 3' }
  ];
  @Input() coleccion: string = '';

  loadChange: boolean = false;

  itemSelect: string = 'Reporte reservas'; // item seleccionado de las opciones (nombre)
  itemId: string = '1'; // item seleccionado de las opciones (id)

  public form = this._fb.group({
    fecha_inicio: this._fb.control<Date | null>(null),
    fecha_fin: this._fb.control<Date | null>(null),
  });

  constructor(
    private fs: FirestoreService,
    private modalService: ModalService,
    private awsService: AwsService,
    public listService: ListService
  ) {}

  selectItem(item: string, id: string) {
    this.itemSelect = item;
    this.itemId = id;
  }

  async ngOnInit() {
    const hoy = new Date();

    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.form.patchValue({
      fecha_inicio: haceUnMes,
      fecha_fin: hoy
    });
  }

  private base64ToBlob(base64: string, mime: string): Blob {
    // eliminar prefijos si los hubiera
    base64 = base64.replace(/^data:[^;]+;base64,/, '');
    base64 = base64.replace(/^"|"$/g, ''); // quitar comillas si existen

    const sliceSize = 1024;
    const byteChars = atob(base64);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
      const slice = byteChars.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    // Ensure the array is of type Uint8Array[]
    return new Blob(byteArrays as BlobPart[], { type: mime });
  }

  async descargar() {
    const fechaInicio = this.form.value.fecha_inicio;
    const fechaFin = this.form.value.fecha_fin;
    
    // Ajustar fechas antes de enviar
    const desde = this.listService.changeFechasInicio(fechaInicio);
    const hasta = this.listService.changeFechasFin(fechaFin);

    console.log('desde', desde);
    console.log('hasta', hasta); // tipo=reservas_alumno&

    await this.awsService.get(`download?desde=${desde}&hasta=${hasta}&tipo=reservas_alumno`)
      .then((response: any) => {
        console.log('Response:', response);
        const base64 = response.body; // asegúrate que sea la cadena base64 pura
        const blob = this.base64ToBlob(base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'reporte.xlsx';
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        console.error('Error al guardar cursos', error);
      });
  }
}
