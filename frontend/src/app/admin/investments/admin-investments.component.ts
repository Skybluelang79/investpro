import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Investment } from '../../core/models';

@Component({
  selector: 'app-admin-investments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">Investments</h1>
      <select class="input filter" [(ngModel)]="status" (change)="load()">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>User</th><th>Plan</th><th>Reference</th><th>Amount</th><th>Current</th><th>Profit</th><th>Status</th><th>Ends</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of investments">
            <td>
              <div>{{ inv.user?.name }}</div>
              <div class="muted small">{{ inv.user?.email }}</div>
            </td>
            <td>{{ inv.plan?.name }}</td>
            <td class="mono small">{{ inv.reference }}</td>
            <td class="mono">{{ api.money(inv.amount) }}</td>
            <td class="mono">{{ api.money(inv.current_value) }}</td>
            <td class="mono percent-up">+{{ api.money(inv.total_profit) }}</td>
            <td><span class="badge" [ngClass]="'badge-' + statusClass(inv.status)">{{ inv.status }}</span></td>
            <td class="small">{{ inv.ends_at ? (inv.ends_at | date: 'mediumDate') : '-' }}</td>
          </tr>
          <tr *ngIf="investments.length === 0"><td colspan="8" class="empty">No investments found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filter { width: 160px; }
  `],
})
export class AdminInvestmentsComponent {
  api = inject(ApiService);

  investments: Investment[] = [];
  status = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: Investment[] }>('/admin/investments', { status: this.status, per_page: 50 }).subscribe((res) => (this.investments = res.data));
  }

  statusClass(status: string): string {
    switch (status) {
      case 'active': return 'info';
      case 'completed': return 'success';
      default: return 'danger';
    }
  }
}
