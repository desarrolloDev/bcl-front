import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() color: string = '#DABC62';
  @Input() bg: string = '#FFFFFF';
  @Input() borderColor: string = '#FFFFFF';
  @Input() name: string = '';
  @Input() maxlength: number | null = null;
  @Input() textSize: string = '12px';
  @Input() heightSelect: string = '38';

  @Input() typeControl: string = 'form'; // 'model'
  @Input() control = new FormControl<string | number>('', []);
  @Input() controlModel: string = '';

  @Output() controlModelChange = new EventEmitter<any>();

  internalModel: any = '';

  showPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnChanges() {
    this.internalModel = this.controlModel;
  }

  onModelChange(value: any) {
    this.controlModelChange.emit(value);
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // inputValue.replace(/[^A-ZÑ0-9\s]/gi, '').toUpperCase().slice(0, 15);
    if (this.maxlength && value.length > this.maxlength) {
      value = value.slice(0, this.maxlength);
      input.value = value;
    }
  }
}
