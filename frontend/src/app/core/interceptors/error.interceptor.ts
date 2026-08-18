import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.clearSession();
        router.navigate(['/auth/login']);
        toast.error('Session expired. Please log in again.');
      } else if (error.status === 403) {
        toast.error(error.error?.message || 'You do not have permission to perform this action.');
      } else if (error.status === 422) {
        const msg = error.error?.message || 'Validation error. Please check your input.';
        toast.error(msg);
      } else if (error.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.');
      }

      return throwError(() => error);
    }),
  );
};
