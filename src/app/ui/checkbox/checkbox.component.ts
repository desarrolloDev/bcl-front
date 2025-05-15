import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent {
  @Input() label: string | undefined;

  @Input() typeControl: string = 'form'; // 'model'
  @Input() control = new FormControl<boolean>(false);
  @Input() controlModel: boolean = false;

  @Output() controlModelChange = new EventEmitter<any>();

  @Output() changeSelect = new EventEmitter<void>();

  onModelChange(value: any) {
    this.controlModelChange.emit(value);

    if (this.changeSelect) this.changeSelect.emit();
  }
}
