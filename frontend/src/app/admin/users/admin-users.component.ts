import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">User Management</h1>

    <div class="card mb-2">
      <div class="admin-controls">
        <input type="text" class="form-control" placeholder="Search users..." [(ngModel)]="searchTerm" (input)="loadUsers()" />
        <button class="btn btn-sm btn-outline" (click)="loadUsers()">Search</button>
        <select class="form-control" [(ngModel)]="filterRole">
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>KYC</th>
            <th>Balance</th>
            <th>Invested</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUsers">
            <td>
              <div class="cell-user">
                <span class="avatar">{{ initials(u.name) }}</span>
                <div>
                  <div>{{ u.name }}</div>
                </div>
              </div>
            </td>
            <td class="muted small">{{ u.email }}</td>
            <td class="muted small">{{ u.phone || '-' }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + kycClass(u.kyc?.status)">{{ u.kyc?.status ?? 'pending' }}</span>
            </td>
            <td class="mono">{{ api.money(u.wallet?.balance ?? 0) }}</td>
            <td class="mono">{{ api.money(u.total_invested ?? 0) }}</td>
            <td>
              <span class="badge" [ngClass]="u.is_active ? 'badge-success' : 'badge-danger'">{{ u.is_active ? 'Active' : 'Inactive' }}</span>
            </td>
            <td>
              <button class="btn btn-xs btn-outline" (click)="viewUser(u.id)">View</button>
              <button class="btn btn-xs btn-outline" (click)="toggleStatus(u)">{{ u.is_active ? 'Deactivate' : 'Activate' }}</button>
            </td>
          </tr>
          <tr *ngIf="filteredUsers.length === 0"><td colspan="8" class="empty">No users found.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .admin-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .form-control { max-width: 260px; }
    .cell-user { display: flex; align-items: center; gap: 10px; }
  `],
})
export class AdminUsersComponent {
  api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  users: User[] = [];
  searchTerm = '';
  filterRole = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.load();
  }

  load(): void {
    this.api.get<{ data: User[] }>('/admin/users', { search: this.searchTerm }).subscribe((res) => (this.users = res.data));
  }

  get filteredUsers(): User[] {
    if (!this.filterRole) return this.users;
    const isActive = this.filterRole === 'active';
    return this.users.filter((u) => u.is_active === isActive);
  }

  viewUser(id: number): void {
    this.router.navigate(['/admin/users', id]);
  }

  toggleStatus(u: User): void {
    this.toggle(u);
  }

  toggle(u: User): void {
    this.api.post<{ message: string }>(`/admin/users/${u.id}/toggle-active`).subscribe({
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
