import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    const authService = inject(AuthService);
    const router = inject(Router);

    if (requiredRoles.includes(authService.getRol())) {
      return true;
    }
    return router.createUrlTree(['/dashboard']);
  };
};
