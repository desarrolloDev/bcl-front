import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../../ui/tabs/tabs.component';
import { TabComponent } from '../../ui/tab/tab.component';
import { BodyLoginComponent } from './body-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    TabComponent,
    TabsComponent,
    BodyLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None 
})
export class LoginComponent {
}
