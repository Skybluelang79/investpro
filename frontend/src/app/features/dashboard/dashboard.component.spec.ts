import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'money'], {
      money: jasmine.createSpy('money').and.callFake((v: number) => `$${v}`),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have api property set to ApiService', () => {
    expect(component.api).toBe(apiServiceSpy);
  });

  it('should call api.get for dashboard data on init', () => {
    apiServiceSpy.get.and.returnValue({
      subscribe: jasmine.createSpy('subscribe'),
    } as any);

    fixture.detectChanges();

    expect(apiServiceSpy.get).toHaveBeenCalledWith('/dashboard');
  });

  it('should start with undefined data', () => {
    apiServiceSpy.get.and.returnValue({
      subscribe: jasmine.createSpy('subscribe'),
    } as any);

    fixture.detectChanges();

    expect(component.data).toBeUndefined();
  });

  it('should close share modal', () => {
    component.shareModalOpen = true;
    component.closeShareModal();
    expect(component.shareModalOpen).toBeFalse();
  });

  it('should open share modal with referral link', () => {
    component.data = {
      referral_code: 'REF123',
      total_balance: 1000,
      monthly_growth: 5,
      active_invested: 500,
      total_profit: 100,
      bonus_balance: 50,
      referral_bonus_earned: 25,
      referrals_count: 3,
      referral_chart: [],
      recent_transactions: [],
      active_investments: [],
      chart: [],
      wallet: { id: 1, user_id: 1, balance: 1000, bonus: 50 },
      total_invested: 500,
      pending_withdrawals: 0,
      completed_returns: 0,
      monthly_income: 0,
    } as any;

    component.openShareModal();

    expect(component.shareModalOpen).toBeTrue();
    expect(component.referralLink).toContain('REF123');
  });
});
