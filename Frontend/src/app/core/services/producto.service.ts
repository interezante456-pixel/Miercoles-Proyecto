import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly API = 'http://localhost:8080/api/productos';
  private http = inject(HttpClient);

  getAll(): Observable<Producto[]>                { return this.http.get<Producto[]>(this.API); }
  getById(id: number): Observable<Producto>       { return this.http.get<Producto>(`${this.API}/${id}`); }
  buscar(q: string): Observable<Producto[]>       { return this.http.get<Producto[]>(`${this.API}/buscar?q=${q}`); }
  getStockBajo(): Observable<Producto[]>          { return this.http.get<Producto[]>(`${this.API}/stock-bajo`); }
  create(p: Partial<Producto>): Observable<Producto>  { return this.http.post<Producto>(this.API, p); }
  update(id: number, p: Partial<Producto>): Observable<Producto> { return this.http.put<Producto>(`${this.API}/${id}`, p); }
  delete(id: number): Observable<void>            { return this.http.delete<void>(`${this.API}/${id}`); }
}
