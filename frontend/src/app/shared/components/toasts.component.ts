import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap">
      <div *ngFor="let toast of toasts" class="toast" [class.toast-success]="toast.type === 'success'" [class.toast-error]="toast.type === 'error'" (click)="dismiss(toast.id)">
        {{ toast.message }}
      </div>
    </div>
  `,
})
export class ToastsComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe((t) => (this.toasts = t));
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }
}
