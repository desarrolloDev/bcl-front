import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../interfaces/menu.interface';

const state = ['visible', 'hidden', 'collapsed'] as const;
type State = (typeof state)[number];

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  constructor() { }

  menuItems = signal<MenuItem[]>([]);
  collapased = signal(true);
  state = signal<State>('visible');

}
