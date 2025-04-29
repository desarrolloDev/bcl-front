import { Component, ContentChildren, AfterContentInit, QueryList, Input } from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, TabComponent],
  template: `
    <ul class="tab-titles w-full">
      <li *ngFor="let tab of tabs; let i = index"
          (click)="selectTab(i)"
          [class.active]="tab.active" class="1/2"
          [ngStyle]="{ 'width': width, 'border-radius': borderR }">
        {{ tab.tabTitle }}
      </li>
    </ul>

    <ng-content></ng-content>
  `,
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
  @Input() width: string = '180px';
  @Input() borderR: string = '';
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  ngAfterContentInit() {
    this.selectTab(0);
  }

  selectTab(index: number) {
    this.tabs.forEach((tab, i) => {
      tab.active = i === index;
    });
  }
}
