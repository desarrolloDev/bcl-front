import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'custom-button',
  standalone: true,
  imports: [
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() width: string | undefined;
  @Input() label: string | undefined;
  @Input() type: 'raised' | 'flat' | 'stroked' | 'basic' | 'icon' = 'basic';
  @Input() buttonType: 'submit' | 'button' = 'button';
  @Input() backgroundColor: string = '';
  @Input() borderColor: string = '';
  @Input() fontColor: string = '#FFFFFF';
  @Input() icon: string | undefined;
  @Input() disabled: boolean = false;
  @Output() onClickEvent = new EventEmitter<void>();

  onClick() {
    this.onClickEvent.emit();
  }
}
