import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private idleTimeout: any;
  private readonly idleTimeMs = 15 * 60 * 1000; // 30 minutos
  private onIdleSubject = new Subject<void>();
  public onIdle$ = this.onIdleSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  startWatching() {
    this.resetTimer();
    this.clearListeners();
    this.addListeners();
  }

  stopWatching() {
    this.clearListeners();
    clearTimeout(this.idleTimeout);
  }

  private addListeners() {
    window.addEventListener('mousemove', this.resetTimerBound, true);
    window.addEventListener('keydown', this.resetTimerBound, true);
    window.addEventListener('scroll', this.resetTimerBound, true);
    window.addEventListener('touchstart', this.resetTimerBound, true);
  }

  private clearListeners() {
    window.removeEventListener('mousemove', this.resetTimerBound, true);
    window.removeEventListener('keydown', this.resetTimerBound, true);
    window.removeEventListener('scroll', this.resetTimerBound, true);
    window.removeEventListener('touchstart', this.resetTimerBound, true);
  }

  private resetTimerBound = this.resetTimer.bind(this);

  private resetTimer() {
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        this.onIdleSubject.next();
      });
    }, this.idleTimeMs);
  }
}
