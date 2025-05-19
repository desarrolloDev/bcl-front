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
          [ngStyle]="tab.active ? {
            'width': width,
            'border-radius': borderR,
            'background': bgActive,
            'color': colorActive,
            'border-width': '1px',
            'border-style': 'solid',
            'border-color': borderColor
          }
          : {
            'width': width,
            'border-radius': borderR,
            'background': bg,
            'color': color,
            'border-width': '1px',
            'border-style': 'solid',
            'border-color': borderColorActive
          }"
        >
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

  @Input() bg: string = '#FAFAFA';
  @Input() color: string = '#A0A0A0';
  @Input() borderColor: string = '#FAFAFA';

  @Input() bgActive: string = '#DABC62';
  @Input() colorActive: string = '#000000';
  @Input() borderColorActive: string = '#FAFAFA';

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
