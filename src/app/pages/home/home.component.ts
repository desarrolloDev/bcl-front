import { Component } from '@angular/core';
import { CarouselComponent } from '../../ui/carousel/carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  arrayImage: any = [
    'assets/BANNER_01_home.jpeg',
    'assets/BANNER_02_home.jpeg',
    'assets/BANNER_03_home.jpeg'
  ];

  arrayPrecios: any = [
    'assets/PRECIOS-01.jpeg',
    'assets/PRECIOS-02.jpeg',
    'assets/PRECIOS-03.jpg'
  ];
}
