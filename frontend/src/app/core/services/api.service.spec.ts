import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get with the correct URL', () => {
    service.get('/test').subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/v1/test');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should call post with the correct URL and body', () => {
    service.post('/test', { key: 'value' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/v1/test');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ key: 'value' });
    req.flush({});
  });

  it('should call put with the correct URL and body', () => {
    service.put('/test', { key: 'updated' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/v1/test');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ key: 'updated' });
    req.flush({});
  });

  it('should call delete with the correct URL', () => {
    service.delete('/test').subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/v1/test');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should pass query params on get', () => {
    service.get('/test', { page: 1, search: 'hello' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8000/api/v1/test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('search')).toBe('hello');
    req.flush({});
  });

  it('should filter out null/undefined params', () => {
    service.get('/test', { page: 1, search: undefined, sort: null }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8000/api/v1/test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('search')).toBeFalse();
    expect(req.request.params.has('sort')).toBeFalse();
    req.flush({});
  });

  it('should format money values', () => {
    expect(service.money(1234.56)).toContain('1,234.56');
    expect(service.money(0)).toContain('0.00');
    expect(service.money(null)).toContain('0.00');
    expect(service.money(undefined)).toContain('0.00');
  });
});
