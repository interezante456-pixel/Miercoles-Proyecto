import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CompraService, ProveedorService } from '../../../core/services/api-services';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { Proveedor } from '../../../core/models/cliente.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface ItemCompra {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-nueva-compra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">🛒 Nueva Orden de Compra</h1></div>
        <button class="btn btn-secondary" (click)="router.navigate(['/compras'])">← Volver</button>
      </div>
      <div class="venta-layout">
        <div class="venta-left">
          <div class="card mb-16">
            <h3 class="card-title" style="margin-bottom:16px">🏭 Proveedor</h3>
            <div class="form-group">
              <label class="form-label">Seleccionar Proveedor *</label>
              <select [(ngModel)]="proveedorId" class="form-select">
                <option value="">Seleccionar...</option>
                @for (p of proveedores(); track p.id) { <option [value]="p.id">{{ p.razonSocial }} ({{ p.ruc }})</option> }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Esperada</label>
              <input type="date" [(ngModel)]="fechaEsperada" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea [(ngModel)]="observaciones" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="card mb-16">
            <h3 class="card-title" style="margin-bottom:12px">📦 Agregar Productos</h3>
            <div class="search-bar" style="max-width:100%">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Buscar producto..." (input)="buscarProducto($event)" />
            </div>
            @if (productosFiltrados().length > 0) {
              <div class="productos-grid" style="margin-top:12px">
                @for (p of productosFiltrados(); track p.id) {
                  <div class="producto-card" (click)="agregar(p)">
                    <div class="producto-nombre">{{ p.nombre }}</div>
                    <div class="producto-info"><span>P. Compra: S/ {{ p.precioCompra | number:'1.2-2' }}</span><span class="badge badge-info">Stock: {{ p.stockActual }}</span></div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
        <div class="venta-right">
          <div class="card carrito">
            <h3 class="card-title">📋 Detalle de Compra</h3>
            @if (items().length === 0) {
              <div class="empty-carrito"><span>📦</span><p>Agrega productos</p></div>
            } @else {
              <div class="carrito-items">
                @for (item of items(); track item.producto.id) {
                  <div class="carrito-item">
                    <div class="item-nombre">{{ item.producto.nombre }}</div>
                    <div class="item-controls">
                      <button class="btn btn-sm btn-secondary" (click)="cambiar(item,-1)">-</button>
                      <span class="item-qty">{{ item.cantidad }}</span>
                      <button class="btn btn-sm btn-secondary" (click)="cambiar(item,1)">+</button>
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">S/ {{ item.precioUnitario }}</div>
                    <div class="item-precio">S/ {{ item.subtotal | number:'1.2-2' }}</div>
                    <button class="btn btn-sm btn-danger btn-icon" (click)="quitar(item)">✕</button>
                  </div>
                }
              </div>
              <div class="totales">
                <div class="total-row"><span>Subtotal:</span><span>S/ {{ getSubtotal() | number:'1.2-2' }}</span></div>
                <div class="total-row"><span>IGV (18%):</span><span>S/ {{ getIgv() | number:'1.2-2' }}</span></div>
                <div class="total-row total-final"><span>TOTAL:</span><span>S/ {{ getTotal() | number:'1.2-2' }}</span></div>
              </div>
              @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }
              <button class="btn btn-primary btn-lg w-100" [disabled]="!proveedorId || loading()" (click)="guardar()">
                @if (loading()) { ⏳ Guardando... } @else { ✅ Crear Orden de Compra }
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.venta-layout { display: grid; grid-template-columns: 1fr 380px; gap: 16px; } .mb-16 { margin-bottom: 16px; } .productos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 280px; overflow-y: auto; } .producto-card { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition); } .producto-card:hover { border-color: var(--primary); } .producto-nombre { font-weight: 500; font-size: 0.85rem; margin-bottom: 6px; } .producto-info { display: flex; justify-content: space-between; font-size: 0.8rem; } .carrito { position: sticky; top: 24px; } .empty-carrito { text-align: center; padding: 40px; color: var(--text-muted); } .empty-carrito span { font-size: 3rem; display: block; margin-bottom: 8px; } .carrito-items { max-height: 350px; overflow-y: auto; margin: 16px 0; } .carrito-item { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border); } .item-nombre { flex: 1; font-size: 0.85rem; font-weight: 500; } .item-controls { display: flex; align-items: center; gap: 4px; } .item-qty { min-width: 24px; text-align: center; font-weight: 600; } .item-precio { font-weight: 600; color: var(--primary); min-width: 80px; text-align: right; } .totales { border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 16px; } .total-row { display: flex; justify-content: space-between; padding: 4px 0; color: var(--text-secondary); } .total-final { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px; } textarea { resize: vertical; }`]
})
export class NuevaCompraComponent implements OnInit, OnDestroy {
  private compraService = inject(CompraService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  router = inject(Router);

  proveedores = signal<Proveedor[]>([]);
  // We no longer keep a massive list of all products in memory
  // productos = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  items = signal<ItemCompra[]>([]);
  proveedorId = '';
  fechaEsperada = '';
  observaciones = '';
  loading = signal(false);
  error = signal('');

  private searchSubject = new Subject<string>();
  private searchSub: any;

  ngOnInit(): void {
    this.proveedorService.getAll().subscribe(ps => this.proveedores.set(ps));
    // No longer loading all products on init to improve performance
    // this.productoService.getAllList().subscribe(ps => this.productos.set(ps));

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => {
      if (q.length > 1) {
        this.productoService.buscar(q).subscribe(ps => {
          const exacto = ps.find(p => p.codigoBarras && p.codigoBarras.trim().toLowerCase() === q);
          if (exacto) {
            this.error.set('');
            this.agregar(exacto);
            const inputElement = document.querySelector('input[placeholder="Buscar por código, nombre o barras..."]') as HTMLInputElement;
            if (inputElement) inputElement.value = '';
            this.productosFiltrados.set([]);
          } else {
            this.productosFiltrados.set(ps.slice(0, 8));
          }
        });
      } else {
        this.productosFiltrados.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  buscarProducto(e: Event): void {
    const inputElement = e.target as HTMLInputElement;
    const q = inputElement.value.trim().toLowerCase();
    
    // We emit to the Subject instead of filtering in-memory
    this.searchSubject.next(q);
  }

  agregar(p: Producto): void {
    const its = [...this.items()];
    const idx = its.findIndex(i => i.producto.id === p.id);
    if (idx >= 0) { its[idx].cantidad++; its[idx].subtotal = its[idx].cantidad * its[idx].precioUnitario; }
    else its.push({ producto: p, cantidad: 1, precioUnitario: p.precioCompra, subtotal: p.precioCompra });
    this.items.set(its);
  }

  cambiar(item: ItemCompra, delta: number): void {
    const its = [...this.items()];
    const idx = its.findIndex(i => i.producto.id === item.producto.id);
    const nc = its[idx].cantidad + delta;
    if (nc <= 0) its.splice(idx, 1);
    else { its[idx].cantidad = nc; its[idx].subtotal = nc * its[idx].precioUnitario; }
    this.items.set(its);
  }

  quitar(item: ItemCompra): void { this.items.update(its => its.filter(i => i.producto.id !== item.producto.id)); }

  getSubtotal(): number { return this.items().reduce((s, i) => s + i.subtotal, 0); }
  getIgv(): number { return this.getSubtotal() * 0.18; }
  getTotal(): number { return this.getSubtotal() + this.getIgv(); }

  guardar(): void {
    this.loading.set(true);
    this.error.set('');
    const payload = {
      proveedorId: Number(this.proveedorId),
      observaciones: this.observaciones,
      fechaEsperada: this.fechaEsperada || null,
      detalles: this.items().map(i => ({ productoId: i.producto.id!, cantidad: i.cantidad, precioUnitario: i.precioUnitario }))
    };
    this.compraService.crear(payload).subscribe({
      next: () => this.router.navigate(['/compras']),
      error: err => { this.error.set(err?.error?.error ?? 'Error al crear la compra'); this.loading.set(false); }
    });
  }
}
