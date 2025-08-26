import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
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
    ReactiveFormsModule, 
    MatCheckbox
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent {
  @Input() label: string | undefined;

  @Input() typeControl: string = 'form'; // 'model'
  @Input() control = new FormControl<boolean>(false); // para form
  @Input() controlModel: boolean = false; // para model

  @Input() isDisabled: boolean = false;

  @Output() controlModelChange = new EventEmitter<boolean>();

  @Output() changeSelect = new EventEmitter<void>();

  onModelChange(value: boolean, checkbox: MatCheckbox) {
    this.controlModelChange.emit(value);

    if (this.changeSelect) this.changeSelect.emit();
  }
}
