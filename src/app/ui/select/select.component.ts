import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input() label: string = '';
  @Input() items: { id: string, nombre: string }[] = [];
  @Input() color: string = '#6C6C6C';
  @Input() padding: string = '8px';
  @Input() textSize: string = '12px';
  @Input() heightSelect: string = '38';

  @Input() typeControl: string = 'form'; // 'model'
  @Input() control = new FormControl<string | number>('', []);
  @Input() controlModel: string = '';

  @Output() controlModelChange = new EventEmitter<any>();
  @Output() changeSelect = new EventEmitter<void>();
  
  internalModel: any = '';

  ngOnChanges() {
    this.internalModel = this.controlModel;
  }

  onModelChange(value: any) {
    this.controlModelChange.emit(value);

    if (this.changeSelect) this.changeSelect.emit();
  }
}
