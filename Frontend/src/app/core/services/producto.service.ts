import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { API_URL } from '../config/api.config';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly API = `${API_URL}/productos`;
  private http = inject(HttpClient);

  /** Listado paginado con búsqueda opcional */
  getAll(page: number = 0, size: number = 25, q?: string): Observable<PageResponse<Producto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }
    return this.http.get<PageResponse<Producto>>(this.API, { params });
  }

  getById(id: number): Observable<Producto>       { return this.http.get<Producto>(`${this.API}/${id}`); }
  buscar(q: string): Observable<Producto[]>        { return this.http.get<Producto[]>(`${this.API}/buscar?q=${q}`); }
  getStockBajoCount(): Observable<{ count: number }> { return this.http.get<{ count: number }>(`${this.API}/stock-bajo`); }
  create(p: Partial<Producto>): Observable<Producto>  { return this.http.post<Producto>(this.API, p); }
  update(id: number, p: Partial<Producto>): Observable<Producto> { return this.http.put<Producto>(`${this.API}/${id}`, p); }
  delete(id: number): Observable<void>             { return this.http.delete<void>(`${this.API}/${id}`); }
  importar(payload: Partial<Producto>[]): Observable<Producto[]> { return this.http.post<Producto[]>(`${this.API}/importar`, payload); }
}
