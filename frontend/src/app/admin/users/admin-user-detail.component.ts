import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-page" *ngIf="user">
      <div class="header-row">
        <button class="back-btn" (click)="goBack()">&#8592; Back to Users</button>
        <div class="actions">
          <button class="btn" [class.deactivate]="user.is_active" (click)="toggleActive()">
            {{ user.is_active ? 'Deactivate' : 'Activate' }}
          </button>
        </div>
      </div>

      <div class="profile-card">
        <div class="avatar">{{ user.name?.charAt(0) }}</div>
        <div class="info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
          <span class="badge" [class.active]="user.is_active">{{ user.is_active ? 'Active' : 'Inactive' }}</span>
          <span class="badge kyc" [class]="kycStatusClass">{{ kycLabel }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Wallet Balance</span>
          <span class="stat-value">\${{ (summary?.wallet_balance || 0) | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Deposited</span>
          <span class="stat-value">\${{ (summary?.total_deposited || 0) | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Withdrawn</span>
          <span class="stat-value">\${{ (summary?.total_withdrawn || 0) | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active Investments</span>
          <span class="stat-value">{{ summary?.active_investments || 0 }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Invested</span>
          <span class="stat-value">\${{ (summary?.total_invested || 0) | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Profit Earned</span>
          <span class="stat-value">\${{ (summary?.total_profit_earned || 0) | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Referral Bonus</span>
          <span class="stat-value">\${{ (summary?.total_referral_bonus || 0) | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Referrals</span>
          <span class="stat-value">{{ summary?.referrals_count || 0 }}</span>
        </div>
      </div>

      <div class="tabs">
        <button *ngFor="let tab of tabs" [class.active]="activeTab === tab" (click)="activeTab = tab" class="tab-btn">{{ tab }}</button>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'Investments'">
        <table class="data-table" *ngIf="user.investments?.length; else noData">
          <thead><tr><th>Reference</th><th>Plan</th><th>Amount</th><th>Profit</th><th>Status</th><th>Ends</th></tr></thead>
          <tbody>
            <tr *ngFor="let inv of user.investments">
              <td>{{ inv.reference }}</td>
              <td>{{ inv.plan?.name }}</td>
              <td>\${{ inv.amount | number:'1.2-2' }}</td>
              <td>\${{ inv.total_profit | number:'1.2-2' }}</td>
              <td><span class="badge" [class]="inv.status">{{ inv.status }}</span></td>
              <td>{{ inv.ends_at | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'Deposits'">
        <table class="data-table" *ngIf="user.deposits?.length; else noData">
          <thead><tr><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let dep of user.deposits">
              <td>{{ dep.reference }}</td>
              <td>\${{ dep.amount | number:'1.2-2' }}</td>
              <td>{{ dep.method }}</td>
              <td><span class="badge" [class]="dep.status">{{ dep.status }}</span></td>
              <td>{{ dep.created_at | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'Withdrawals'">
        <table class="data-table" *ngIf="user.withdrawals?.length; else noData">
          <thead><tr><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let wd of user.withdrawals">
              <td>{{ wd.reference }}</td>
              <td>\${{ wd.amount | number:'1.2-2' }}</td>
              <td>{{ wd.method }}</td>
              <td><span class="badge" [class]="wd.status">{{ wd.status }}</span></td>
              <td>{{ wd.created_at | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'Referrals'">
        <table class="data-table" *ngIf="user.referrals?.length; else noData">
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
          <tbody>
            <tr *ngFor="let ref of user.referrals">
              <td>{{ ref.name }}</td>
              <td>{{ ref.email }}</td>
              <td>{{ ref.created_at | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noData><p class="empty">No records found.</p></ng-template>
    </div>
    <div *ngIf="loading" class="loading">Loading user data...</div>
  `,
  styles: [`
    .detail-page { max-width: 1100px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .back-btn { background: none; border: 1px solid var(--card-border); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; background: var(--primary); color: #fff; }
    .btn.deactivate { background: #ef4444; }
    .profile-card { display: flex; align-items: center; gap: 20px; padding: 24px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; margin-bottom: 24px; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; }
    .info h2 { margin: 0 0 4px; } .info p { margin: 0 0 8px; color: var(--text-muted); font-size: 13px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #e5e7eb; color: #374151; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .badge.approved, .badge.completed { background: #d1fae5; color: #065f46; }
    .badge.rejected, .badge.failed { background: #fee2e2; color: #991b1b; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; }
    .stat-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--card-border); padding-bottom: 8px; }
    .tab-btn { padding: 8px 16px; border: none; background: none; cursor: pointer; font-weight: 600; border-radius: 8px 8px 0 0; color: var(--text-muted); }
    .tab-btn.active { color: var(--primary); border-bottom: 2px solid var(--primary); }
    .data-table { width: 100%; border-collapse: collapse; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; overflow: hidden; }
    .data-table th, .data-table td { padding: 10px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid var(--card-border); }
    .data-table th { background: var(--bg-soft); font-weight: 600; color: var(--text-muted); }
    .empty { text-align: center; padding: 40px; color: var(--text-muted); }
    .loading { text-align: center; padding: 60px; color: var(--text-muted); }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class AdminUserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  user: any = null;
  summary: any = null;
  loading = true;
  activeTab = 'Investments';
  tabs = ['Investments', 'Deposits', 'Withdrawals', 'Referrals'];

  get kycStatusClass(): string {
    return this.user?.kyc?.status || 'pending';
  }

  get kycLabel(): string {
    const s = this.user?.kyc?.status;
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'No KYC';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadUser(id);
  }

  loadUser(id: string): void {
    this.loading = true;
    this.api.get<any>(`/admin/users/${id}`).subscribe({
      next: (res) => { this.user = res.user; this.loading = false; this.loadSummary(id); },
      error: () => { this.toast.error('Failed to load user.'); this.loading = false; },
    });
  }

  loadSummary(id: string): void {
    this.api.get<any>(`/admin/users/${id}/summary`).subscribe({
      next: (res) => this.summary = res,
    });
  }

  toggleActive(): void {
    this.api.post<any>(`/admin/users/${this.user.id}/toggle-active`, {}).subscribe({
      next: (res) => { this.user = res.user; this.toast.success(res.message); },
      error: () => this.toast.error('Failed to update user status.'),
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
