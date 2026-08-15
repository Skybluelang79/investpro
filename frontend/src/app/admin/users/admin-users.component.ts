import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head mb-2">
      <h1 class="page-title">Users</h1>
      <input class="input search" type="text" placeholder="Search name or email" [(ngModel)]="search" (input)="load()" />
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>User</th><th>Balance</th><th>Bonus</th><th>Referrals</th><th>KYC</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>
              <div class="cell-user">
                <span class="avatar">{{ initials(u.name) }}</span>
                <div>
                  <div>{{ u.name }}</div>
                  <div class="muted small">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="mono">{{ api.money(u.wallet?.balance) }}</td>
            <td class="mono">{{ api.money(u.referral_bonus_total ?? 0) }}</td>
            <td>{{ u.referrals_count ?? 0 }}</td>
            <td><span class="badge" [ngClass]="'badge-' + kycClass(u.kyc?.status)">{{ u.kyc?.status ?? 'none' }}</span></td>
            <td><span class="badge" [ngClass]="u.is_active ? 'badge-success' : 'badge-danger'">{{ u.is_active ? 'active' : 'banned' }}</span></td>
            <td class="small">{{ u.created_at | date: 'mediumDate' }}</td>
            <td>
              <button class="btn btn-outline btn-sm" (click)="toggle(u)">
                {{ u.is_active ? 'Suspend' : 'Restore' }}
              </button>
            </td>
          </tr>
          <tr *ngIf="users.length === 0"><td colspan="8" class="empty">No users found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .page-title { font-size: 20px; font-weight: 800; }
    .search { max-width: 260px; }
    .cell-user { display: flex; align-items: center; gap: 10px; }
  `],
})
export class AdminUsersComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);

  users: User[] = [];
  search = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: User[] }>('/admin/users', { search: this.search }).subscribe((res) => (this.users = res.data));
  }

  toggle(u: User): void {
    this.api.post(`/admin/users/${u.id}/toggle-active`).subscribe({
      next: (res: { message: string }) => {
        this.toast.success(res.message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed.'),
    });
  }

  initials(name: string): string {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  kycClass(status?: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'pending';
      default: return 'muted';
    }
  }
}
