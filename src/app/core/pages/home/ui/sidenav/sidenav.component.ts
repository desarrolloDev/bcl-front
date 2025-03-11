import { SidenavService } from '@/app/core/services/sidenav.service';
import { IconComponent } from '@/app/shared/ui/icon/icon.component';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    IconComponen
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  host: {
    class: 'app-sidenav',
    '[class.app-sidenav--collapsed]': 'sidenavService.state() === "collapsed"',
    '[class.app-sidenav--hidden]': 'sidenavService.state() === "hidden"',
    '[class.app-sidenav--visible]': 'sidenavService.state() === "visible"',
  },
  encapsulation: ViewEncapsulation.None,
})
export class SidenavComponent {
  sidenavService = inject(SidenavService);

  sidenavWidth = computed(() => {
    const state = this.sidenavService.state();
    if (state === 'collapsed') return '65px'
    else if (state === 'visible') return '250px'
    return '0px'
  });
}