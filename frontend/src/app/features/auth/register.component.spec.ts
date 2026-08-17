import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render name input field', () => {
    const nameInput = fixture.nativeElement.querySelector('input[name="name"]');
    expect(nameInput).toBeTruthy();
  });

  it('should render email input field', () => {
    const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
    expect(emailInput).toBeTruthy();
    expect(emailInput.getAttribute('type')).toBe('email');
  });

  it('should render password input field', () => {
    const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('should render confirm password input field', () => {
    const confirmInput = fixture.nativeElement.querySelector('input[name="password_confirmation"]');
    expect(confirmInput).toBeTruthy();
    expect(confirmInput.getAttribute('type')).toBe('password');
  });

  it('should show error when passwords do not match', () => {
    component.model.password = 'password123';
    component.model.password_confirmation = 'different';
    component.onSubmit();
    expect(component.error).toBe('Passwords do not match.');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should call auth.register when passwords match', () => {
    authServiceSpy.register.and.returnValue(of({
      token: 'abc',
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'user' as const, is_active: true },
    }));

    component.model = {
      name: 'Test User',
      email: 'test@test.com',
      phone: '',
      password: 'password123',
      password_confirmation: 'password123',
      referral_code: '',
    };
    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();
  });

  it('should set loading to true during registration', () => {
    authServiceSpy.register.and.returnValue(of({
      token: 'abc',
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'user' as const, is_active: true },
    }));

    component.model = {
      name: 'Test User',
      email: 'test@test.com',
      phone: '',
      password: 'password123',
      password_confirmation: 'password123',
      referral_code: '',
    };
    component.onSubmit();

    expect(component.loading).toBeTrue();
  });

  it('should show error on registration failure', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: { message: 'Email already taken' } }))
    );

    component.model = {
      name: 'Test User',
      email: 'taken@test.com',
      phone: '',
      password: 'password123',
      password_confirmation: 'password123',
      referral_code: '',
    };
    component.onSubmit();

    expect(component.error).toBe('Email already taken');
    expect(component.loading).toBeFalse();
  });

  it('should display loading text when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.textContent).toContain('Creating account...');
  });
});
