import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LayoutComponent } from './shared/layout/layout.component';
import { AdminLayoutComponent } from './shared/layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'investments', loadComponent: () => import('./features/investments/investments.component').then((m) => m.InvestmentsComponent) },
      { path: 'portfolio', loadComponent: () => import('./features/portfolio/portfolio.component').then((m) => m.PortfolioComponent) },
      { path: 'wallet', loadComponent: () => import('./features/wallet/wallet.component').then((m) => m.WalletComponent) },
      { path: 'deposits', loadComponent: () => import('./features/deposits/deposits.component').then((m) => m.DepositsComponent) },
      { path: 'transactions', loadComponent: () => import('./features/transactions/transactions.component').then((m) => m.TransactionsComponent) },
      { path: 'withdrawals', loadComponent: () => import('./features/withdrawals/withdrawals.component').then((m) => m.WithdrawalsComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent) },
      { path: 'kyc', loadComponent: () => import('./features/kyc/kyc.component').then((m) => m.KycComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'plans', loadComponent: () => import('./features/plans/plans.component').then((m) => m.PlansComponent) },
      { path: 'referrals', loadComponent: () => import('./features/referrals/referrals.component').then((m) => m.ReferralsComponent) },
      { path: 'activity', loadComponent: () => import('./features/activity/activity.component').then((m) => m.ActivityComponent) },
      { path: 'security', loadComponent: () => import('./features/security/security.component').then((m) => m.SecurityComponent) },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./admin/users/admin-users.component').then((m) => m.AdminUsersComponent) },
      { path: 'plans', loadComponent: () => import('./admin/plans/admin-plans.component').then((m) => m.AdminPlansComponent) },
      { path: 'investments', loadComponent: () => import('./admin/investments/admin-investments.component').then((m) => m.AdminInvestmentsComponent) },
      { path: 'deposits', loadComponent: () => import('./admin/deposits/admin-deposits.component').then((m) => m.AdminDepositsComponent) },
      { path: 'withdrawals', loadComponent: () => import('./admin/withdrawals/admin-withdrawals.component').then((m) => m.AdminWithdrawalsComponent) },
      { path: 'kyc', loadComponent: () => import('./admin/kyc/admin-kyc.component').then((m) => m.AdminKycComponent) },
      { path: 'reports', loadComponent: () => import('./admin/reports/admin-reports.component').then((m) => m.AdminReportsComponent) },
      { path: 'announcements', loadComponent: () => import('./admin/announcements/admin-announcements.component').then((m) => m.AdminAnnouncementsComponent) },
      { path: 'advertisements', loadComponent: () => import('./admin/advertisements/admin-advertisements.component').then((m) => m.AdminAdvertisementsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
