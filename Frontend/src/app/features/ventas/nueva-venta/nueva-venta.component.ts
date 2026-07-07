import { Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { VentaService, ClienteService } from '../../../core/services/api-services';
import { ProductoService } from '../../../core/services/producto.service';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../../core/models/producto.model';
import { Cliente } from '../../../core/models/cliente.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
          <h1 class="page-title">💰 Módulo de Ventas POS</h1>
          <p class="page-subtitle">Facturación rápida, escaneo de códigos de barra y atajos de teclado</p>
        </div>
        <button class="btn btn-secondary" (click)="router.navigate(['/ventas'])">← Volver</button>
      </div>

      <div class="venta-layout">
        <!-- Panel Izquierdo: Cliente y Catálogo -->
        <div class="venta-left">
          
          <!-- Datos de Cliente -->
          <div class="card-pos mb-16">
            <div class="card-pos-header">
              <h3 class="card-pos-title">👤 Datos del Cliente</h3>
              <span class="badge" [class.badge-info]="tipoComprobante !== 'FACTURA'" [class.badge-warning]="tipoComprobante === 'FACTURA'">
                🧾 {{ tipoComprobante }}
              </span>
            </div>
            
            <div class="form-group mb-16">
              <label class="form-label">Tipo de Comprobante</label>
              <select [(ngModel)]="tipoComprobante" (change)="onComprobanteChange()" class="form-select" style="width:auto"
                      [ngModelOptions]="{standalone: true}">
                <option value="BOLETA">Boleta de Venta</option>
                <option value="FACTURA">Factura Electrónica</option>
                <option value="TICKET">Ticket de Venta</option>
              </select>
            </div>

            @if (clienteSeleccionado()) {
              <div class="form-group animate-fadein">
                <label class="form-label">Cliente Seleccionado</label>
                <div class="selected-card" style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <strong style="display:block; color:var(--text-primary);">{{ clienteSeleccionado()?.nombres }} {{ clienteSeleccionado()?.apellidos }}</strong>
                    <small style="color:var(--text-secondary);">{{ clienteSeleccionado()?.tipoDoc }}: {{ clienteSeleccionado()?.nroDoc }}</small>
                  </div>
                  <button class="btn btn-sm btn-danger btn-icon" (click)="deseleccionarCliente()" title="Cambiar Cliente">✕</button>
                </div>
              </div>
            } @else {
              <!-- Buscador Unificado -->
              <div class="form-group" style="position: relative;">
                <label class="form-label">
                  @if (tipoComprobante === 'FACTURA') {
                    Buscar Cliente por Razón Social o RUC <span class="text-muted">(Atajo: F4)</span>
                  } @else {
                    Buscar o Registrar Cliente (Opcional) <span class="text-muted">(Atajo: F4)</span>
                  }
                </label>
                <div style="position: relative;">
                  <input #clienteInput type="text" [(ngModel)]="busquedaCliente" (input)="buscarCliente($event)" class="form-control"
                         [placeholder]="tipoComprobante === 'FACTURA' ? 'Buscar Razón Social o RUC...' : 'Escribe nombre, DNI o deja vacío para Público General...'"
                         [ngModelOptions]="{standalone: true}">
                  <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--text-muted);">[F4]</span>
                </div>
                
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

              <!-- Formulario manual para Factura o Ticket si no se seleccionó cliente -->
              @if (tipoComprobante === 'FACTURA') {
                <div class="grid-2 animate-fadein mb-16" style="margin-top: 12px; border-top: 1px solid var(--border); padding-top: 12px;">
                  <div style="grid-column: span 2; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                    O registrar una nueva Factura:
                  </div>
                  <div class="form-group">
                    <label class="form-label">RUC (11 dígitos) *</label>
                    <input type="text" [ngModel]="rapidoRuc" (input)="onRucInput($event)" maxlength="11" class="form-control" placeholder="20123456789">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Razón Social *</label>
                    <input type="text" [(ngModel)]="rapidoRazonSocial" [ngModelOptions]="{standalone: true}" class="form-control" placeholder="Mi Empresa S.A.C.">
                  </div>
                  <div class="form-group" style="grid-column: span 2">
                    <label class="form-label">Dirección Fiscal</label>
                    <input type="text" [(ngModel)]="rapidoDireccion" [ngModelOptions]="{standalone: true}" class="form-control" placeholder="Av. Principal 123">
                  </div>
                </div>
              } @else if (tipoComprobante === 'TICKET') {
                <div class="grid-2 animate-fadein mb-16" style="margin-top: 12px; border-top: 1px solid var(--border); padding-top: 12px;">
                  <div class="form-group" style="grid-column: span 2">
                    <label class="form-label">DNI / RUC (Opcional)</label>
                    <input type="text" [ngModel]="rapidoDni" (input)="onDniInput($event)" maxlength="11" class="form-control" placeholder="Documento de identidad">
                  </div>
                </div>
              }
            }
          </div>

          <!-- Búsqueda y Grid de Productos -->
          <div class="card-pos mb-16">
            <div class="card-pos-header">
              <h3 class="card-pos-title">📦 Agregar Productos</h3>
              <div class="scanner-badge">
                <div class="pulse-dot"></div>
                <span>Lector Activo</span>
              </div>
            </div>
            
            <div class="search-bar" style="max-width:100%; position: relative;">
              <span class="search-icon">🔍</span>
              <input #buscarInput type="text" placeholder="Escanea código de barras o escribe para buscar... (F2)"
                     (input)="buscarProducto($event)" style="padding-right: 48px;" />
              <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">[F2]</span>
            </div>
            
            @if (productosFiltrados().length > 0) {
              <div class="productos-grid">
                @for (p of productosFiltrados(); track p.id) {
                  <div class="producto-card" (click)="agregarAlCarrito(p)"
                       [class.sin-stock]="p.stockActual === 0">
                    <div class="producto-nombre">{{ p.nombre }}</div>
                    <div class="producto-info">
                      <span class="producto-precio">S/ {{ p.precioVenta | number:'1.2-2' }}</span>
                      <span class="badge-stock" [class.badge-stock-high]="p.stockActual > 5" [class.badge-stock-low]="p.stockActual <= 5">
                        Stock: {{ p.stockActual }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Panel Derecho: Carrito y Caja -->
        <div class="venta-right">
          <div class="card-pos carrito">
            <div class="card-pos-header">
              <h3 class="card-pos-title">🛒 Carrito de Compra</h3>
              <span class="cart-count">{{ getTotalCantidad() }} ítems</span>
            </div>

            @if (carrito().length === 0) {
              <div class="empty-carrito" style="padding: 60px 20px;">
                <span style="font-size: 3.5rem; display: block; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">🛒</span>
                <p style="font-weight: 500; color: var(--text-secondary);">El carrito está vacío</p>
                <small style="color: var(--text-muted); display: block; margin-top: 4px;">Escanea productos o utiliza el buscador para agregarlos.</small>
              </div>
            } @else {
              <div class="carrito-items">
                @for (item of carrito(); track item.producto.id) {
                  <div class="carrito-item">
                    <div>
                      <div class="item-nombre">{{ item.producto.nombre }}</div>
                      <small style="color: var(--text-muted); font-size: 0.75rem;">S/ {{ item.precioUnitario | number:'1.2-2' }} c/u</small>
                    </div>
                    <div class="item-controls">
                      <button class="btn-qty" (click)="cambiarCantidad(item, -1)">-</button>
                      <span class="item-qty">{{ item.cantidad }}</span>
                      <button class="btn-qty" (click)="cambiarCantidad(item, 1)">+</button>
                    </div>
                    <div class="item-precio">S/ {{ item.subtotal | number:'1.2-2' }}</div>
                    <button class="btn-remove" (click)="quitarItem(item)" title="Quitar ítem">✕</button>
                  </div>
                }
              </div>

              <!-- Sección de Método de Pago y Vuelto -->
              <div class="seccion-pago">
                <div class="pago-title">Método de Pago</div>
                <div class="pago-chips">
                  <button type="button" class="chip-pago" [class.active]="metodoPago === 'EFECTIVO'" (click)="metodoPago = 'EFECTIVO'; montoRecibido = 0;">
                    💵 Efectivo
                  </button>
                  <button type="button" class="chip-pago" [class.active]="metodoPago === 'TARJETA'" (click)="metodoPago = 'TARJETA'; montoRecibido = 0;">
                    💳 Tarjeta
                  </button>
                  <button type="button" class="chip-pago" [class.active]="metodoPago === 'YAPE_PLIN'" (click)="metodoPago = 'YAPE_PLIN'; montoRecibido = 0;">
                    📱 Yape/Plin
                  </button>
                </div>

                @if (metodoPago === 'EFECTIVO') {
                  <div class="efectivo-box animate-fadein">
                    <div>
                      <label class="form-label" style="font-size: 0.75rem; margin-bottom: 4px;">Paga con S/</label>
                      <input type="number" [(ngModel)]="montoRecibido" class="form-control" style="font-size: 1rem; font-weight: 700;" placeholder="0.00" min="0">
                    </div>
                    <div class="vuelto-box">
                      <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Vuelto</span>
                      <span class="vuelto-monto">S/ {{ getVuelto() | number:'1.2-2' }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Totales -->
              <div class="totales">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>S/ {{ getSubtotal() | number:'1.2-2' }}</span>
                </div>
                <div class="total-row">
                  <span>IGV (18%):</span>
                  <span>S/ {{ getIgv() | number:'1.2-2' }}</span>
                </div>
                <div class="total-row total-final">
                  <span>TOTAL:</span>
                  <span>S/ {{ getTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              @if (error()) { 
                <div class="alert alert-danger" style="margin-bottom: 12px; font-size: 0.8rem; padding: 10px 12px; border-radius: 6px;">
                  ⚠️ {{ error() }}
                </div> 
              }

              <button class="btn btn-primary btn-lg w-100"
                      [disabled]="!puedeRegistrarVenta()"
                      (click)="registrarVenta()"
                      style="font-size: 1rem; padding: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
                @if (loading()) { ⏳ Procesando... } @else { ✅ Confirmar Venta [F9] }
              </button>

              <!-- Guía de Atajos de Teclado -->
              <div class="shortcut-guide">
                <span><span class="key-cap">F2</span> Buscar Prod.</span>
                <span><span class="key-cap">F4</span> Buscar Clie.</span>
                <span><span class="key-cap">F9</span> Guardar Venta</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .venta-layout { display: grid; grid-template-columns: 1fr 400px; gap: 20px; }
    .mb-16 { margin-bottom: 16px; }

    /* Card styling */
    .card-pos {
      background: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      transition: all 0.3s ease;
      padding: 20px;
    }
    
    .card-pos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .card-pos-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Scanner Pulse */
    .scanner-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 4px 8px;
      border-radius: 12px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    
    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 1.6s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    /* Product card improvements */
    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
      max-height: 380px;
      overflow-y: auto;
      padding-right: 4px;
    }
    
    .producto-card {
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .producto-card:hover:not(.sin-stock) {
      transform: translateY(-2px);
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.05);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    }

    .producto-card.sin-stock {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .producto-nombre {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .producto-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .producto-precio {
      font-weight: 700;
      color: #10b981;
      font-size: 1rem;
    }

    .badge-stock {
      font-size: 0.7rem;
      padding: 3px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .badge-stock-high {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .badge-stock-low {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    /* Cart details */
    .carrito {
      position: sticky;
      top: 24px;
    }
    
    .cart-count {
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .carrito-items {
      max-height: 280px;
      overflow-y: auto;
      margin: 12px 0;
      padding-right: 4px;
    }

    .carrito-item {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 12px;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }

    .item-nombre {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-qty {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-qty:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .item-qty {
      font-size: 0.85rem;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .item-precio {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.85rem;
      min-width: 65px;
      text-align: right;
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .btn-remove:hover {
      opacity: 1;
    }

    /* Payment section styling */
    .seccion-pago {
      border-top: 1px solid var(--border);
      padding-top: 16px;
      margin-top: 12px;
    }

    .pago-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pago-chips {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }

    .chip-pago {
      padding: 8px 4px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .chip-pago.active {
      background: rgba(99,102,241,0.15);
      border-color: var(--primary);
      color: var(--primary);
    }

    .efectivo-box {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      animation: slideDown 0.25s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .vuelto-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
    }

    .vuelto-monto {
      font-size: 1.2rem;
      font-weight: 800;
      color: #10b981;
    }

    /* Totales section */
    .totales {
      border-top: 1px solid var(--border);
      padding-top: 12px;
      margin-bottom: 16px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .total-final {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
      border-top: 1px solid var(--border);
      padding-top: 10px;
      margin-top: 6px;
    }

    /* Shortcut guide */
    .shortcut-guide {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--text-muted);
      border-top: 1px dashed var(--border);
      padding-top: 8px;
      margin-top: 12px;
    }

    .key-cap {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 4px;
      padding: 1px 4px;
      font-weight: 700;
      color: var(--text-primary);
      margin-right: 2px;
    }

    .dropdown-list {
      position: absolute;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      z-index: 10;
      width: 100%;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .dropdown-item {
      padding: 10px 14px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-bottom: 1px solid var(--border);
    }
    .dropdown-item:hover {
      background: var(--bg-hover);
    }
    .dropdown-item small {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
  `]
})
export class NuevaVentaComponent implements OnInit, AfterViewInit, OnDestroy {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  router = inject(Router);

  clientes = signal<Cliente[]>([]);
  // We no longer keep a massive list of all products in memory
  // productos = signal<Producto[]>([]);
  clientesFiltrados = signal<Cliente[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  clienteSeleccionado = signal<Cliente | null>(null);
  carrito = signal<ItemCarrito[]>([]);
  loading = signal(false);
  error = signal('');
  tipoComprobante = 'BOLETA';

  // Unified client picker and rapid registration state
  busquedaCliente = '';
  rapidoRuc = '';
  rapidoRazonSocial = '';
  rapidoDireccion = '';
  rapidoDni = '';

  // Payment State
  metodoPago = 'EFECTIVO';
  montoRecibido = 0;

  @ViewChild('buscarInput') buscarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('clienteInput') clienteInput!: ElementRef<HTMLInputElement>;

  private searchSubject = new Subject<string>();
  private searchSub: any;

  ngOnInit(): void {
    this.clienteService.getAll().subscribe(cs => this.clientes.set(cs));
    // No longer loading all products on init to improve performance
    // this.productoService.getAllList().subscribe(ps => this.productos.set(ps));

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => {
      if (q.length > 1) {
        this.productoService.buscar(q).subscribe(ps => {
          // If there's an exact barcode match and we just scanned it, auto-add it? 
          // We handle that in buscarProducto for immediate barcodes if possible, but backend handles general search.
          const exacto = ps.find(p => p.codigoBarras && p.codigoBarras.trim().toLowerCase() === q);
          if (exacto) {
             if (exacto.stockActual === 0) {
               this.error.set(`El producto "${exacto.nombre}" no tiene stock.`);
               this.buscarInput.nativeElement.value = '';
               this.productosFiltrados.set([]);
             } else {
               this.error.set('');
               this.agregarAlCarrito(exacto);
               this.buscarInput.nativeElement.value = '';
               this.productosFiltrados.set([]);
             }
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

  ngAfterViewInit(): void {
    this.focusBuscar();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      this.focusBuscar();
    } else if (event.key === 'F4') {
      event.preventDefault();
      this.focusCliente();
    } else if (event.key === 'F9') {
      event.preventDefault();
      if (this.puedeRegistrarVenta()) {
        this.registrarVenta();
      }
    } else if (event.key === 'Escape') {
      this.productosFiltrados.set([]);
      this.clientesFiltrados.set([]);
    }
  }

  focusBuscar(): void {
    if (this.buscarInput) {
      setTimeout(() => {
        this.buscarInput.nativeElement.focus();
        this.buscarInput.nativeElement.select();
      }, 50);
    }
  }

  focusCliente(): void {
    if (this.clienteInput) {
      setTimeout(() => {
        this.clienteInput.nativeElement.focus();
        this.clienteInput.nativeElement.select();
      }, 50);
    }
  }

  getVuelto(): number {
    if (this.metodoPago !== 'EFECTIVO' || !this.montoRecibido) return 0;
    const total = this.getTotal();
    const vuelto = this.montoRecibido - total;
    return vuelto > 0 ? vuelto : 0;
  }

  getTotalCantidad(): number {
    return this.carrito().reduce((sum, item) => sum + item.cantidad, 0);
  }

  buscarCliente(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.busquedaCliente = (event.target as HTMLInputElement).value;
    
    this.clientesFiltrados.set(q.length > 1 ? this.clientes().filter(c => {
      const matchText = c.nombres.toLowerCase().includes(q) || c.nroDoc.includes(q);
      if (this.tipoComprobante === 'FACTURA') {
        return matchText && c.tipoDoc === 'RUC';
      }
      return matchText;
    }).slice(0, 5) : []);
  }

  seleccionarCliente(c: Cliente): void {
    this.clienteSeleccionado.set(c);
    this.busquedaCliente = '';
    this.clientesFiltrados.set([]);
  }

  buscarProducto(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const q = inputElement.value.trim().toLowerCase();
    
    // We emit to the Subject instead of filtering in-memory
    this.searchSubject.next(q);
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

  onComprobanteChange(): void {
    this.busquedaCliente = '';
    this.rapidoRuc = '';
    this.rapidoRazonSocial = '';
    this.rapidoDireccion = '';
    this.rapidoDni = '';
    this.clientesFiltrados.set([]);
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado.set(null);
    this.onComprobanteChange();
  }

  onRucInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim();
    this.rapidoRuc = val;
    if (val.length === 11) {
      const match = this.clientes().find(c => c.nroDoc === val && c.tipoDoc === 'RUC');
      if (match) {
        this.clienteSeleccionado.set(match);
        this.rapidoRazonSocial = match.nombres;
        this.rapidoDireccion = match.direccion || '';
        this.busquedaCliente = '';
        this.clientesFiltrados.set([]);
      }
    }
  }

  onDniInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim();
    this.rapidoDni = val;
    if (val.length === 8 || val.length === 11) {
      const match = this.clientes().find(c => c.nroDoc === val);
      if (match) {
        this.clienteSeleccionado.set(match);
        this.busquedaCliente = '';
        this.clientesFiltrados.set([]);
      }
    }
  }

  puedeRegistrarVenta(): boolean {
    if (this.carrito().length === 0 || this.loading()) return false;
    if (this.clienteSeleccionado()) return true;

    if (this.tipoComprobante === 'BOLETA' || this.tipoComprobante === 'TICKET') {
      return true;
    }
    if (this.tipoComprobante === 'FACTURA') {
      return this.rapidoRuc.trim().length === 11 && this.rapidoRazonSocial.trim().length > 0;
    }
    return false;
  }

  registrarVenta(): void {
    if (!this.puedeRegistrarVenta()) return;
    this.loading.set(true);
    this.error.set('');

    const detallePago = `Método de Pago: ${this.metodoPago}${
      this.metodoPago === 'EFECTIVO' 
        ? ` (Recibido: S/ ${this.montoRecibido.toFixed(2)}, Vuelto: S/ ${this.getVuelto().toFixed(2)})` 
        : ''
    }`;

    if (this.clienteSeleccionado()) {
      this.completarVenta(this.clienteSeleccionado()!.id!, detallePago);
    } else {
      let nroDoc = '';
      let tipoDoc = 'DNI';
      let nombres = '';
      let apellidos = 'General';
      let direccion = '';

      if (this.tipoComprobante === 'BOLETA') {
        const nombreIngresado = this.busquedaCliente.trim();
        if (nombreIngresado.length === 0) {
          const gen = this.clientes().find(c => c.nroDoc === 'VAR-GENERIC');
          if (gen) {
            this.completarVenta(gen.id!, detallePago);
            return;
          }
          nombres = 'Público';
          apellidos = 'General';
          tipoDoc = 'DNI';
          nroDoc = 'VAR-GENERIC';
        } else {
          nombres = nombreIngresado;
          apellidos = 'General';
          tipoDoc = 'DNI';
          nroDoc = 'VAR-' + Date.now();
        }
      } else if (this.tipoComprobante === 'TICKET') {
        const nombreIngresado = this.busquedaCliente.trim();
        const dniIngresado = this.rapidoDni.trim();
        if (nombreIngresado.length === 0 && dniIngresado.length === 0) {
          const gen = this.clientes().find(c => c.nroDoc === 'TICK-GENERIC');
          if (gen) {
            this.completarVenta(gen.id!, detallePago);
            return;
          }
          nombres = 'Público';
          apellidos = 'General';
          tipoDoc = 'DNI';
          nroDoc = 'TICK-GENERIC';
        } else {
          nombres = nombreIngresado || 'Público General';
          apellidos = 'Público';
          tipoDoc = dniIngresado.length === 11 ? 'RUC' : 'DNI';
          nroDoc = dniIngresado || 'TICK-' + Date.now();
        }
      } else if (this.tipoComprobante === 'FACTURA') {
        nombres = this.rapidoRazonSocial.trim();
        apellidos = 'S.A.C.';
        tipoDoc = 'RUC';
        nroDoc = this.rapidoRuc.trim();
        direccion = this.rapidoDireccion.trim();
      }

      const existente = this.clientes().find(c => c.nroDoc === nroDoc);
      if (existente) {
        this.completarVenta(existente.id!, detallePago);
      } else {
        const nuevoCliente = {
          nombres,
          apellidos,
          tipoDoc,
          nroDoc,
          direccion,
          activo: true
        };
        this.clienteService.create(nuevoCliente as any).subscribe({
          next: (c) => {
            this.clientes.update(list => [...list, c]);
            this.completarVenta(c.id!, detallePago);
          },
          error: (err) => {
            this.error.set(err?.error?.error || 'Error al registrar el cliente');
            this.loading.set(false);
          }
        });
      }
    }
  }

  completarVenta(clienteId: number, observacionesPago: string): void {
    const payload = {
      clienteId: clienteId,
      tipoComprobante: this.tipoComprobante,
      observaciones: observacionesPago,
      detalles: this.carrito().map(i => ({
        productoId: i.producto.id!,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        descuento: 0
      }))
    };
    this.ventaService.registrar(payload as any).subscribe({
      next: () => this.router.navigate(['/ventas']),
      error: (err) => {
        this.error.set(err?.error?.error || 'Error al registrar la venta');
        this.loading.set(false);
      }
    });
  }
}
