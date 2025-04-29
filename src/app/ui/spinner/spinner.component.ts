import { Component, Input, HostBinding } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() diameter: number = 0;
  
  @HostBinding('style.--spinner-color')
  color: string = '#1D1D1B';
}
