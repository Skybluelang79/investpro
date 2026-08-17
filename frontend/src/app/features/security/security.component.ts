import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Security Settings</h1>

    <div class="grid-2">
      <div>
        <div class="card mb-2">
          <h3 class="section-title mb-2">Two-Factor Authentication</h3>
          <p class="muted small mb-2" *ngIf="!user?.two_factor_enabled">Add an extra layer of security to your account by enabling two-factor authentication.</p>
          <p class="muted small mb-2" *ngIf="user?.two_factor_enabled">Two-factor authentication is currently <strong class="percent-up">enabled</strong>.</p>

          <div *ngIf="!enabling2fa && !user?.two_factor_enabled">
            <button class="btn btn-primary" (click)="startEnable2fa()">Enable 2FA</button>
          </div>

          <div *ngIf="enabling2fa" class="mt-1">
            <p class="small mb-1">Scan this QR code with your authenticator app:</p>
            <div class="qr-box mb-2" *ngIf="qrUrl">
              <img [src]="qrUrl" alt="2FA QR Code" class="qr-img" />
            </div>
            <div class="field" *ngIf="secret">
              <label>Manual entry key</label>
              <input class="input mono" type="text" [value]="secret" readonly />
            </div>
            <div class="field">
              <label>Verification code</label>
              <input class="input mono" type="text" [(ngModel)]="verifyCode" name="verifyCode" placeholder="Enter 6-digit code" maxlength="6" />
            </div>
            <div class="btn-row">
              <button class="btn btn-outline" type="button" (click)="cancelEnable()">Cancel</button>
              <button class="btn btn-primary" type="button" (click)="confirmEnable()" [disabled]="!verifyCode || saving2fa">
                {{ saving2fa ? 'Verifying...' : 'Verify & Enable' }}
              </button>
            </div>
          </div>

          <div *ngIf="user?.two_factor_enabled && !disabling2fa">
            <button class="btn btn-danger" (click)="disabling2fa = true">Disable 2FA</button>
          </div>

          <div *ngIf="disabling2fa" class="mt-1">
            <div class="field">
              <label>Enter code to confirm</label>
              <input class="input mono" type="text" [(ngModel)]="disableCode" name="disableCode" placeholder="Enter 6-digit code" maxlength="6" />
            </div>
            <div class="btn-row">
              <button class="btn btn-outline" type="button" (click)="disabling2fa = false">Cancel</button>
              <button class="btn btn-danger" type="button" (click)="disable2fa()" [disabled]="!disableCode || saving2fa">
                {{ saving2fa ? 'Disabling...' : 'Disable 2FA' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <h3 class="section-title mb-2">Change Password</h3>
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
            <button class="btn btn-primary" type="submit" [disabled]="pwSaving">{{ pwSaving ? 'Updating...' : 'Update password' }}</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 20px; font-weight: 800; }
    .section-title { font-size: 15px; font-weight: 700; }
    .qr-box { display: flex; justify-content: center; padding: 16px; background: var(--bg); border-radius: 10px; }
    .qr-img { width: 180px; height: 180px; }
    .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .btn-danger { background: var(--danger, #e53e3e); color: #fff; }
  `],
})
export class SecurityComponent {
  api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  user?: User | null;
  enabling2fa = false;
  disabling2fa = false;
  qrUrl = '';
  secret = '';
  verifyCode = '';
  disableCode = '';
  saving2fa = false;

  pw = { current: '', new: '', confirm: '' };
  pwSaving = false;

  ngOnInit(): void {
    this.user = this.auth.user;
    this.api.get<{ user: User }>('/me').subscribe((res) => (this.user = res.user));
  }

  startEnable2fa(): void {
    this.api.get<{ qr_url: string; secret: string }>('/2fa/secret').subscribe({
      next: (res) => {
        this.qrUrl = res.qr_url;
        this.secret = res.secret;
        this.enabling2fa = true;
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to initialize 2FA.');
      },
    });
  }

  cancelEnable(): void {
    this.enabling2fa = false;
    this.qrUrl = '';
    this.secret = '';
    this.verifyCode = '';
  }

  confirmEnable(): void {
    this.saving2fa = true;
    this.api.post<{ message: string }>('/2fa/enable', { code: this.verifyCode }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.enabling2fa = false;
        this.verifyCode = '';
        this.saving2fa = false;
        this.user = { ...this.user!, two_factor_enabled: true } as User;
        this.auth.me().subscribe();
      },
      error: (err) => {
        this.saving2fa = false;
        this.toast.error(err.error?.message ?? 'Invalid verification code.');
      },
    });
  }

  disable2fa(): void {
    this.saving2fa = true;
    this.api.post<{ message: string }>('/2fa/disable', { code: this.disableCode }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.disabling2fa = false;
        this.disableCode = '';
        this.saving2fa = false;
        this.user = { ...this.user!, two_factor_enabled: false } as User;
        this.auth.me().subscribe();
      },
      error: (err) => {
        this.saving2fa = false;
        this.toast.error(err.error?.message ?? 'Invalid verification code.');
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
