import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Investment, InvestmentPlan } from '../../core/models';

@Component({
  selector: 'app-admin-investments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Investment Monitoring</h1>

    <div class="card mb-2">
      <div class="admin-controls">
        <input type="text" class="form-control" placeholder="Search reference..." [(ngModel)]="searchRef" />
        <select class="form-control" [(ngModel)]="selectedPlan">
          <option value="">All Plans</option>
          <option *ngFor="let plan of plans" [value]="plan.id">{{ plan.name }}</option>
        </select>
        <select class="form-control" [(ngModel)]="selectedStatus">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>User</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Current Value</th>
            <th>Profit</th>
            <th>Status</th>
            <th>Ends</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let inv of investments">
            <td class="mono small">{{ inv.reference }}</td>
            <td>
              <div>{{ inv.user?.name }}</div>
              <div class="muted small">{{ inv.user?.email }}</div>
            </td>
            <td>{{ inv.plan?.name }}</td>
            <td class="mono">{{ api.money(inv.amount) }}</td>
            <td class="mono">{{ api.money(inv.current_value) }}</td>
            <td class="mono percent-up">+{{ api.money(inv.total_profit) }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + inv.status">{{ inv.status }}</span>
            </td>
            <td class="small">{{ inv.ends_at ? (inv.ends_at | date: 'mediumDate') : '-' }}</td>
            <td>
              <button class="btn btn-xs btn-outline" (click)="viewDetails(inv)">Details</button>
              <button class="btn btn-xs btn-outline" (click)="editProfit(inv)">Edit</button>
            </td>
          </tr>
          <tr *ngIf="investments.length === 0"><td colspan="9" class="empty">No investments found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-size: 20px; font-weight: 800; }
    .filter { width: 160px; }
    .admin-controls { display: flex; gap: 10px; flex-wrap: wrap; }
  `],
})
export class AdminInvestmentsComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  investments: Investment[] = [];
  plans: InvestmentPlan[] = [];
  searchRef = '';
  selectedPlan = '';
  selectedStatus = '';

  ngOnInit(): void {
    this.load();
    this.api.get<{ plans: InvestmentPlan[] }>('/admin/plans').subscribe((res) => (this.plans = res.plans));
  }

  load(): void {
    this.api.get<{ data: Investment[] }>('/admin/investments', { status: this.selectedStatus, per_page: 50 }).subscribe((res) => (this.investments = res.data));
  }

  viewDetails(inv: Investment): void {
    this.toast.success('Investment reference: ' + inv.reference);
  }

  editProfit(_inv: Investment): void {
    // TODO: implement profit edit dialog
  }

  statusClass(status: string): string {
    switch (status) {
      case 'active': return 'info';
      case 'completed': return 'success';
      default: return 'danger';
    }
  }
}
