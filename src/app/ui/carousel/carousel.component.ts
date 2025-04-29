import { Component, Input, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [
    NgbCarouselModule,
    CommonModule
  ],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() images: any;

  private bootstrapLink!: HTMLLinkElement;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.bootstrapLink = this.renderer.createElement('link');
    this.bootstrapLink.rel = 'stylesheet';
    this.bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    this.renderer.appendChild(document.head, this.bootstrapLink);
  }

  ngOnDestroy() {
    if (this.bootstrapLink) {
      this.renderer.removeChild(document.head, this.bootstrapLink);
    }
  }
}
