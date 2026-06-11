import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (requiredRoles.includes(authService.getRol())) {
      return true;
    }
    return router.createUrlTree(['/dashboard']);
  };
};
