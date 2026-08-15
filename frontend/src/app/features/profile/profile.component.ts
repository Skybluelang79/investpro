import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">My Profile</h1>

    <div class="grid-2">
      <div class="card">
        <div class="profile-head mb-2">
          <span class="avatar big"><img *ngIf="user?.avatar" [src]="user!.avatar" alt=""/><span *ngIf="!user?.avatar">{{ initials }}</span></span>
          <div>
            <div class="profile-name">{{ user?.name }}</div>
            <div class="muted small">{{ user?.email }}</div>
          </div>
        </div>

        <form (ngSubmit)="update()">
          <div class="field">
            <label>Full name</label>
            <input class="input" type="text" [(ngModel)]="form.name" name="name" />
          </div>
          <div class="field">
            <label>Email</label>
            <input class="input" type="email" [(ngModel)]="form.email" name="email" />
          </div>
          <div class="field">
            <label>Phone</label>
            <input class="input" type="text" [(ngModel)]="form.phone" name="phone" />
          </div>
          <div class="field">
            <label>Avatar</label>
            <input class="input" type="file" (change)="onAvatar($event)" accept="image/*" />
          </div>
          <button class="btn btn-primary" type="submit" [disabled]="saving">{{ saving ? 'Saving...' : 'Save changes' }}</button>
        </form>
      </div>

      <div>
        <div class="card mb-2">
          <h3 class="section-title mb-2">Account Info</h3>
          <div class="info-row"><span class="muted">Member since</span><span>{{ user?.created_at | date: 'mediumDate' }}</span></div>
          <div class="info-row"><span class="muted">KYC status</span><span [class.percent-up]="user?.kyc?.status === 'approved'">{{ user?.kyc?.status ?? 'not submitted' }}</span></div>
        </div>

        <div class="card mb-2">
          <h3 class="section-title mb-2">Referral rewards</h3>
          <div class="info-row"><span class="muted">Referral code</span><span class="mono">{{ user?.referral_code ?? '-' }}</span></div>
          <div class="info-row"><span class="muted">Referrals</span><span>{{ user?.referrals_count ?? 0 }}</span></div>
          <div class="info-row"><span class="muted">Referral bonus</span><span class="mono">{{ api.money(user?.referral_bonus_total ?? 0) }}</span></div>
          <div class="info-row">
            <span class="muted">Invite link</span>
            <button class="btn btn-outline btn-sm" type="button" (click)="copyReferralCode()" [disabled]="!user?.referral_code">
              {{ copied ? 'Copied!' : 'Copy referral code' }}
            </button>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title mb-2">Change password</h3>
          <form (ngSubmit)="changePassword()">
            <div class="field">
              <label>Current password</label>
              <input class="input" type="password" [(ngModel)]="pw.current" name="current" />
            </div>
            <div class="field">
              <label>New password</label>
              <input class="input" type="password" [(ngModel)]="pw.new" name="new" minlength="8" />
            </div>
            <div class="field">
              <label>Confirm new password</label>
              <input class="input" type="password" [(ngModel)]="pw.confirm" name="confirm" />
            </div>
            <button class="btn btn-outline" type="submit" [disabled]="pwSaving">{{ pwSaving ? 'Updating...' : 'Update password' }}</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
    .profile-head { display: flex; align-items: center; gap: 14px; }
    .avatar.big { width: 56px; height: 56px; font-size: 20px; }
    .profile-name { font-weight: 700; font-size: 17px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--card-border); }
    .info-row:last-child { border-bottom: none; }
  `],
})
export class ProfileComponent {
  api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  user?: User | null;
  form = { name: '', email: '', phone: '' };
  pw = { current: '', new: '', confirm: '' };
  saving = false;
  pwSaving = false;
  avatar?: File;
  copied = false;

  ngOnInit(): void {
    this.user = this.auth.user;
    this.api.get<{ user: User }>('/profile').subscribe((res) => {
      this.user = res.user;
      this.form = { name: res.user.name, email: res.user.email, phone: res.user.phone ?? '' };
    });
  }

  get initials(): string {
    const name = this.user?.name ?? '?';
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  get referralLink(): string {
    return this.user?.referral_code ? `${window.location.origin}/auth/register?referral=${this.user.referral_code}` : '';
  }

  async copyReferralCode(): Promise<void> {
    if (!this.user?.referral_code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.user.referral_code);
      this.copied = true;
      this.toast.success('Referral code copied.');
      setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.toast.error('Unable to copy referral code.');
    }
  }

  onAvatar(event: Event): void {
    this.avatar = (event.target as HTMLInputElement).files?.[0];
  }

  update(): void {
    this.saving = true;
    const form = new FormData();
    form.append('name', this.form.name);
    form.append('email', this.form.email);
    form.append('phone', this.form.phone);
    if (this.avatar) form.append('avatar', this.avatar);

    this.api.upload<{ message: string }>('/profile', form).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.saving = false;
        this.auth.me().subscribe();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message ?? 'Update failed.');
      },
    });
  }

  changePassword(): void {
    if (this.pw.new !== this.pw.confirm) {
      this.toast.error('New passwords do not match.');
      return;
    }
    this.pwSaving = true;
    this.api.put('/profile/password', {
      current_password: this.pw.current,
      password: this.pw.new,
      password_confirmation: this.pw.confirm,
    }).subscribe({
      next: () => {
        this.toast.success('Password updated.');
        this.pwSaving = false;
        this.pw = { current: '', new: '', confirm: '' };
      },
      error: (err) => {
        this.pwSaving = false;
        this.toast.error(err.error?.message ?? 'Password update failed.');
      },
    });
  }
}
