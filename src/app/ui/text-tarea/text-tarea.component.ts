import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-tarea',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './text-tarea.component.html',
  styleUrl: './text-tarea.component.scss'
})
export class TextTareaComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() color: string = '#DABC62';
  @Input() bg: string = '#FFFFFF';
  @Input() borderColor: string = '#FFFFFF';
  @Input() name: string = '';
  @Input() rows: number = 0;
  @Input() cols: number = 0;

  @Input() typeControl: string = 'form'; // 'model'
  @Input() control = new FormControl<string | number>('', []);
  @Input() controlModel: any;

  @Output() controlModelChange = new EventEmitter<any>();
}