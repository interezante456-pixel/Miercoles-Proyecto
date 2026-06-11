import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { VentaService, ClienteService } from '../../../core/services/api-services';
import { ProductoService } from '../../../core/services/producto.service';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../../core/models/producto.model';
import { Cliente } from '../../../core/models/cliente.model';
import { Router } from '@angular/router';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div>
          <h1 class="page-title">💰 Nueva Venta</h1>
          <p class="page-subtitle">Registra una nueva venta al cliente</p>
        </div>
        <button class="btn btn-secondary" (click)="router.navigate(['/ventas'])">← Volver</button>
      </div>

      <div class="venta-layout">
        <!-- Panel Izquierdo: Búsqueda y Carrito -->
        <div class="venta-left">
          <!-- Cliente -->
          <div class="card mb-16">
            <h3 class="card-title" style="margin-bottom:16px">👤 Datos del Cliente</h3>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Buscar Cliente</label>
                <input type="text" class="form-control" placeholder="Nombre o documento..."
                       (input)="buscarCliente($event)" />
                @if (clientesFiltrados().length > 0) {
                  <div class="dropdown-list">
                    @for (c of clientesFiltrados(); track c.id) {
                      <div class="dropdown-item" (click)="seleccionarCliente(c)">
                        <strong>{{ c.nombres }} {{ c.apellidos }}</strong>
                        <small>{{ c.tipoDoc }}: {{ c.nroDoc }}</small>
                      </div>
                    }
                  </div>
                }
              </div>
              <div class="form-group">
                @if (clienteSeleccionado()) {
                  <label class="form-label">Cliente Seleccionado</label>
                  <div class="selected-card">
                    <span>{{ clienteSeleccionado()?.nombres }} {{ clienteSeleccionado()?.apellidos }}</span>
                    <small>{{ clienteSeleccionado()?.nroDoc }}</small>
                    <button class="btn btn-sm btn-danger" (click)="clienteSeleccionado.set(null)">✕</button>
                  </div>
                }
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo Comprobante</label>
              <select [(ngModel)]="tipoComprobante" class="form-select" style="width:auto"
                      [ngModelOptions]="{standalone: true}">
                <option value="BOLETA">Boleta</option>
                <option value="FACTURA">Factura</option>
                <option value="TICKET">Ticket</option>
              </select>
            </div>
          </div>

          <!-- Búsqueda Producto -->
          <div class="card mb-16">
            <h3 class="card-title" style="margin-bottom:12px">📦 Agregar Productos</h3>
            <div class="search-bar" style="max-width:100%">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Buscar producto por nombre o código..."
                     (input)="buscarProducto($event)" />
            </div>
            @if (productosFiltrados().length > 0) {
              <div class="productos-grid">
                @for (p of productosFiltrados(); track p.id) {
                  <div class="producto-card" (click)="agregarAlCarrito(p)"
                       [class.sin-stock]="p.stockActual === 0">
                    <div class="producto-nombre">{{ p.nombre }}</div>
                    <div class="producto-info">
                      <span>S/ {{ p.precioVenta | number:'1.2-2' }}</span>
                      <span [class]="p.stockActual > 0 ? 'badge badge-success' : 'badge badge-danger'">Stock: {{ p.stockActual }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Panel Derecho: Carrito -->
        <div class="venta-right">
          <div class="card carrito">
            <h3 class="card-title">🛒 Carrito de Venta</h3>
            @if (carrito().length === 0) {
              <div class="empty-carrito">
                <span>🛒</span>
                <p>Agrega productos al carrito</p>
              </div>
            } @else {
              <div class="carrito-items">
                @for (item of carrito(); track item.producto.id) {
                  <div class="carrito-item">
                    <div class="item-nombre">{{ item.producto.nombre }}</div>
                    <div class="item-controls">
                      <button class="btn btn-sm btn-secondary" (click)="cambiarCantidad(item, -1)">-</button>
                      <span class="item-qty">{{ item.cantidad }}</span>
                      <button class="btn btn-sm btn-secondary" (click)="cambiarCantidad(item, 1)">+</button>
                    </div>
                    <div class="item-precio">S/ {{ item.subtotal | number:'1.2-2' }}</div>
                    <button class="btn btn-sm btn-danger btn-icon" (click)="quitarItem(item)">✕</button>
                  </div>
                }
              </div>

              <!-- Totales -->
              <div class="totales">
                <div class="total-row"><span>Subtotal:</span><span>S/ {{ getSubtotal() | number:'1.2-2' }}</span></div>
                <div class="total-row"><span>IGV (18%):</span><span>S/ {{ getIgv() | number:'1.2-2' }}</span></div>
                <div class="total-row total-final"><span>TOTAL:</span><span>S/ {{ getTotal() | number:'1.2-2' }}</span></div>
              </div>

              @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }

              <button class="btn btn-primary btn-lg w-100"
                      [disabled]="!clienteSeleccionado() || carrito().length === 0 || loading()"
                      (click)="registrarVenta()">
                @if (loading()) { ⏳ Procesando... } @else { ✅ Confirmar Venta }
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .venta-layout { display: grid; grid-template-columns: 1fr 380px; gap: 16px; }
    .mb-16 { margin-bottom: 16px; }

    .dropdown-list { position: absolute; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); z-index: 10; width: 100%; max-height: 200px; overflow-y: auto; margin-top: 4px; }
    .dropdown-item { padding: 10px 14px; cursor: pointer; display: flex; flex-direction: column; gap: 2px; border-bottom: 1px solid var(--border); }
    .dropdown-item:hover { background: var(--bg-hover); }
    .dropdown-item small { color: var(--text-muted); font-size: 0.75rem; }

    .selected-card { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-sm); padding: 10px; display: flex; align-items: center; gap: 8px; }
    .selected-card span { flex: 1; font-weight: 500; font-size: 0.875rem; }
    .selected-card small { color: var(--text-muted); font-size: 0.75rem; }

    .productos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; max-height: 280px; overflow-y: auto; }
    .producto-card { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition); }
    .producto-card:hover:not(.sin-stock) { border-color: var(--primary); background: rgba(99,102,241,0.08); }
    .producto-card.sin-stock { opacity: 0.4; cursor: not-allowed; }
    .producto-nombre { font-weight: 500; font-size: 0.85rem; margin-bottom: 6px; }
    .producto-info { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }

    .carrito { position: sticky; top: 24px; }
    .empty-carrito { text-align: center; padding: 40px; color: var(--text-muted); }
    .empty-carrito span { font-size: 3rem; display: block; margin-bottom: 8px; }

    .carrito-items { max-height: 350px; overflow-y: auto; margin: 16px 0; }
    .carrito-item { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .item-nombre { flex: 1; font-size: 0.85rem; font-weight: 500; }
    .item-controls { display: flex; align-items: center; gap: 4px; }
    .item-qty { min-width: 24px; text-align: center; font-weight: 600; }
    .item-precio { font-weight: 600; color: var(--primary); min-width: 80px; text-align: right; }

    .totales { border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 16px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; color: var(--text-secondary); }
    .total-final { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px; }
  `]
})
export class NuevaVentaComponent implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  router = inject(Router);

  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  clientesFiltrados = signal<Cliente[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  clienteSeleccionado = signal<Cliente | null>(null);
  carrito = signal<ItemCarrito[]>([]);
  loading = signal(false);
  error = signal('');
  tipoComprobante = 'BOLETA';

  ngOnInit(): void {
    this.clienteService.getAll().subscribe(cs => this.clientes.set(cs));
    this.productoService.getAll().subscribe(ps => this.productos.set(ps));
  }

  buscarCliente(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.clientesFiltrados.set(q.length > 1 ? this.clientes().filter(c =>
      c.nombres.toLowerCase().includes(q) || c.nroDoc.includes(q)
    ).slice(0, 5) : []);
  }

  seleccionarCliente(c: Cliente): void {
    this.clienteSeleccionado.set(c);
    this.clientesFiltrados.set([]);
  }

  buscarProducto(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.productosFiltrados.set(q.length > 1 ? this.productos().filter(p =>
      p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    ).slice(0, 6) : []);
  }

  agregarAlCarrito(p: Producto): void {
    if (p.stockActual === 0) return;
    const items = [...this.carrito()];
    const idx = items.findIndex(i => i.producto.id === p.id);
    if (idx >= 0) {
      if (items[idx].cantidad < p.stockActual) {
        items[idx].cantidad++;
        items[idx].subtotal = items[idx].cantidad * items[idx].precioUnitario;
      }
    } else {
      items.push({ producto: p, cantidad: 1, precioUnitario: p.precioVenta, descuento: 0, subtotal: p.precioVenta });
    }
    this.carrito.set(items);
  }

  cambiarCantidad(item: ItemCarrito, delta: number): void {
    const items = [...this.carrito()];
    const idx = items.findIndex(i => i.producto.id === item.producto.id);
    const nuevaCant = items[idx].cantidad + delta;
    if (nuevaCant <= 0) { items.splice(idx, 1); }
    else if (nuevaCant <= item.producto.stockActual) {
      items[idx].cantidad = nuevaCant;
      items[idx].subtotal = nuevaCant * items[idx].precioUnitario;
    }
    this.carrito.set(items);
  }

  quitarItem(item: ItemCarrito): void {
    this.carrito.update(c => c.filter(i => i.producto.id !== item.producto.id));
  }

  getSubtotal(): number { return this.carrito().reduce((s, i) => s + i.subtotal, 0); }
  getIgv(): number { return this.getSubtotal() * 0.18; }
  getTotal(): number { return this.getSubtotal() + this.getIgv(); }

  registrarVenta(): void {
    if (!this.clienteSeleccionado()) return;
    this.loading.set(true);
    this.error.set('');
    const payload = {
      clienteId: this.clienteSeleccionado()!.id!,
      tipoComprobante: this.tipoComprobante,
      detalles: this.carrito().map(i => ({
        productoId: i.producto.id!, cantidad: i.cantidad,
        precioUnitario: i.precioUnitario, descuento: 0
      }))
    };
    this.ventaService.registrar(payload as any).subscribe({
      next: () => this.router.navigate(['/ventas']),
      error: (err) => { this.error.set(err?.error?.error ?? 'Error al registrar la venta'); this.loading.set(false); }
    });
  }
}
