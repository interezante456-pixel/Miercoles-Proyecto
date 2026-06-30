import { isDevMode } from '@angular/core';

export const API_URL = isDevMode()
  ? 'http://localhost:8080/api'
  : 'https://tienda-backend-9mau.onrender.com/api';
