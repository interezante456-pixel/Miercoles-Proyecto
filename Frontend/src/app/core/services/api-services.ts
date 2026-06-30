import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { Proveedor } from '../models/cliente.model';
import { Categoria } from '../models/producto.model';
import { Venta, VentaRequest } from '../models/venta.model';
import { Compra } from '../models/compra.model';
import { Inventario } from '../models/compra.model';
import { Usuario } from '../models/usuario.model';

import { API_URL } from '../config/api.config';

const BASE = API_URL;

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  getAll = (): Observable<Cliente[]> => this.http.get<Cliente[]>(`${BASE}/clientes`);
  buscar = (q: string): Observable<Cliente[]> => this.http.get<Cliente[]>(`${BASE}/clientes/buscar?q=${q}`);
  getById = (id: number): Observable<Cliente> => this.http.get<Cliente>(`${BASE}/clientes/${id}`);
  create = (c: Partial<Cliente>): Observable<Cliente> => this.http.post<Cliente>(`${BASE}/clientes`, c);
  update = (id: number, c: Partial<Cliente>): Observable<Cliente> => this.http.put<Cliente>(`${BASE}/clientes/${id}`, c);
  delete = (id: number): Observable<void> => this.http.delete<void>(`${BASE}/clientes/${id}`);
}

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private http = inject(HttpClient);
  getAll = (): Observable<Proveedor[]> => this.http.get<Proveedor[]>(`${BASE}/proveedores`);
  buscar = (q: string): Observable<Proveedor[]> => this.http.get<Proveedor[]>(`${BASE}/proveedores/buscar?q=${q}`);
  getById = (id: number): Observable<Proveedor> => this.http.get<Proveedor>(`${BASE}/proveedores/${id}`);
  create = (p: Partial<Proveedor>): Observable<Proveedor> => this.http.post<Proveedor>(`${BASE}/proveedores`, p);
  update = (id: number, p: Partial<Proveedor>): Observable<Proveedor> => this.http.put<Proveedor>(`${BASE}/proveedores/${id}`, p);
  delete = (id: number): Observable<void> => this.http.delete<void>(`${BASE}/proveedores/${id}`);
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  getAll = (): Observable<Categoria[]> => this.http.get<Categoria[]>(`${BASE}/categorias`);
  create = (c: Partial<Categoria>): Observable<Categoria> => this.http.post<Categoria>(`${BASE}/categorias`, c);
  update = (id: number, c: Partial<Categoria>): Observable<Categoria> => this.http.put<Categoria>(`${BASE}/categorias/${id}`, c);
  delete = (id: number): Observable<void> => this.http.delete<void>(`${BASE}/categorias/${id}`);
}

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);
  getAll = (): Observable<Venta[]> => this.http.get<Venta[]>(`${BASE}/ventas`);
  getById = (id: number): Observable<Venta> => this.http.get<Venta>(`${BASE}/ventas/${id}`);
  registrar = (v: VentaRequest): Observable<Venta> => this.http.post<Venta>(`${BASE}/ventas`, v);
  anular = (id: number): Observable<Venta> => this.http.patch<Venta>(`${BASE}/ventas/${id}/anular`, {});
}

@Injectable({ providedIn: 'root' })
export class CompraService {
  private http = inject(HttpClient);
  getAll = (): Observable<Compra[]> => this.http.get<Compra[]>(`${BASE}/compras`);
  getById = (id: number): Observable<Compra> => this.http.get<Compra>(`${BASE}/compras/${id}`);
  crear = (c: any): Observable<Compra> => this.http.post<Compra>(`${BASE}/compras`, c);
  recibir = (id: number): Observable<Compra> => this.http.patch<Compra>(`${BASE}/compras/${id}/recibir`, {});
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  getAll = (): Observable<Inventario[]> => this.http.get<Inventario[]>(`${BASE}/inventario`);
  porProducto = (id: number): Observable<Inventario[]> => this.http.get<Inventario[]>(`${BASE}/inventario/producto/${id}`);
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  getAll = (): Observable<Usuario[]> => this.http.get<Usuario[]>(`${BASE}/usuarios`);
  getById = (id: number): Observable<Usuario> => this.http.get<Usuario>(`${BASE}/usuarios/${id}`);
  create = (u: any): Observable<Usuario> => this.http.post<Usuario>(`${BASE}/usuarios`, u);
  update = (id: number, u: any): Observable<Usuario> => this.http.put<Usuario>(`${BASE}/usuarios/${id}`, u);
  delete = (id: number): Observable<void> => this.http.delete<void>(`${BASE}/usuarios/${id}`);
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  descargarReporteVentas(): Observable<Blob> {
    return this.http.get(`${BASE}/reportes/ventas`, { responseType: 'blob' });
  }
  descargarReporteInventario(): Observable<Blob> {
    return this.http.get(`${BASE}/reportes/inventario`, { responseType: 'blob' });
  }
  descargar(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  getStats = (): Observable<any> => this.http.get<any>(`${BASE}/dashboard/stats`);
}
