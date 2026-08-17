import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should render the sign in button', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Sign in');
  });

  it('should not submit if email is empty', () => {
    component.email = '';
    component.password = 'password123';
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should not submit if password is empty', () => {
    component.email = 'test@test.com';
    component.password = '';
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call auth.login on valid submit', () => {
    const mockResponse = {
      token: 'abc',
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'user' as const, is_active: true },
    };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.email = 'test@test.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', 'password123');
  });

  it('should show error toast on login failure', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );

    component.email = 'test@test.com';
    component.password = 'wrong';
    component.onSubmit();

    expect(toastServiceSpy.error).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should set loading to true during login', () => {
    authServiceSpy.login.and.returnValue(of({
      token: 'abc',
      user: { id: 1, name: 'Test', email: 'test@test.com', role: 'user' as const, is_active: true },
    }));

    component.email = 'test@test.com';
    component.password = 'password123';
    component.onSubmit();

    expect(component.loading).toBeTrue();
  });

  it('should display loading text when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.textContent).toContain('Signing in...');
  });
});
