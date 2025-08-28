import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-back',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './button-back.component.html',
  styleUrl: './button-back.component.scss'
})
export class ButtonBackComponent {
  @Input() text: string = '';

  constructor(
      private router: Router
    ) {}

  home() {
    this.router.navigate(['/dashboard'])
  }
}