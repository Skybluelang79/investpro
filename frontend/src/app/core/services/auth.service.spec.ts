import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    localStorage.clear();
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isAuthenticated as false initially', () => {
    expect(service.isAuthenticated).toBeFalse();
  });

  it('should have user as null initially', () => {
    expect(service.user).toBeNull();
  });

  it('should have token as null initially', () => {
    expect(service.token).toBeNull();
  });

  it('should have isAdmin as false when no user', () => {
    expect(service.isAdmin).toBeFalse();
  });

  it('should return user observable', () => {
    let currentUser: any = undefined;
    service.user$.subscribe((u) => (currentUser = u));
    expect(currentUser).toBeNull();
  });

  it('should clear session on logout', () => {
    localStorage.setItem('investpro_token', 'test-token');
    localStorage.setItem('investpro_user', JSON.stringify({ id: 1, name: 'Test' }));

    service.clearSession();

    expect(localStorage.getItem('investpro_token')).toBeNull();
    expect(localStorage.getItem('investpro_user')).toBeNull();
  });

  it('should load user from localStorage if present', () => {
    const mockUser = { id: 1, name: 'Test', email: 'test@test.com', role: 'user', is_active: true };
    localStorage.setItem('investpro_user', JSON.stringify(mockUser));
    localStorage.setItem('investpro_token', 'some-token');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    });

    const freshService = TestBed.inject(AuthService);
    expect(freshService.user).toEqual(mockUser as any);
  });
});
