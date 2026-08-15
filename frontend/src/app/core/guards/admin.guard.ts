import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated && auth.isAdmin) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
