import { isDevMode } from '@angular/core';

export const API_URL = isDevMode()
  ? 'http://localhost:8080/api'
  : 'https://tienda-backend-interezante456.onrender.com/api';
