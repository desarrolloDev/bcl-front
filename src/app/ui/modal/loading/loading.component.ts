import { Component, HostBinding, Inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { 
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent
} from '@angular/material/dialog';

@Component({
  selector: 'app-loading',
  imports: [
    MatDialogContent,
    MatProgressSpinnerModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  constructor(
    public dialogRef: MatDialogRef<LoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  diameter: number = 50;
  
  @HostBinding('style.--spinner-color')
  color: string = '#1D1D1B';
}
