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
    '../../../../assets/images/BANNER_01_home.jpeg',
    '../../../../assets/images/BANNER_02_home.jpeg',
    '../../../../assets/images/BANNER_03_home.jpeg'
  ];
}
