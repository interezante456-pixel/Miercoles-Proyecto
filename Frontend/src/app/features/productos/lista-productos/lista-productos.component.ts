import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/api-services';
import { Producto } from '../../../core/models/producto.model';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div>
          <h1 class="page-title">📦 Productos</h1>
          <p class="page-subtitle">{{ totalProductos() }} productos registrados</p>
        </div>
        @if (esAdminOAlmacenero()) {
          <div class="d-flex gap-8">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept=".xlsx, .xls" style="display: none">
            <button class="btn btn-outline" (click)="fileInput.click()">📥 Importar Excel</button>
            <button class="btn btn-primary" (click)="openModal()">➕ Nuevo Producto</button>
          </div>
        }
      </div>

      <!-- Search + Filters -->
      <div class="card mb-16">
        <div class="d-flex gap-8 align-center">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Buscar por nombre o código..."
                   [value]="searchQuery()"
                   (input)="onSearchInput($event)" />
          </div>
          <span class="badge badge-warning">⚠️ {{ stockBajoCount() }} con stock bajo</span>
        </div>
      </div>

      <!-- Loading indicator -->
      @if (loading()) {
        <div class="card" style="padding: 32px; text-align: center;">
          <span class="text-muted">⏳ Cargando productos...</span>
        </div>
      }

      <!-- Table -->
      @if (!loading()) {
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Código / Barras</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Stock</th>
                <th>Estado</th>
                @if (esAdminOAlmacenero()) {
                  <th>Acciones</th>
                }
              </tr>
            </thead>
            <tbody>
               @for (p of productos(); track p.id) {
                 <tr>
                   <td>
                     <code class="text-primary-color">{{ p.codigo }}</code>
                     @if (p.codigoBarras) {
                       <div class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">🏷️ {{ p.codigoBarras }}</div>
                     }
                   </td>
                   <td><span class="fw-600">{{ p.nombre }}</span></td>
                   <td><span class="badge badge-info">{{ p.categoria?.nombre }}</span></td>
                   <td>{{ p.moneda || 'PEN' }} {{ p.precioCompra | number:'1.2-2' }}</td>
                   <td>{{ p.moneda || 'PEN' }} {{ p.precioVenta | number:'1.2-2' }}</td>
                   <td>
                     <span [class]="p.stockActual <= p.stockMinimo ? 'badge badge-danger' : 'badge badge-success'">
                       {{ p.stockActual }}
                     </span>
                     <div class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">{{ p.unidadMedida || 'UNIDADES' }}</div>
                   </td>
                   <td><span [class]="p.activo ? 'badge badge-success' : 'badge badge-danger'">{{ p.activo ? 'Activo' : 'Inactivo' }}</span></td>
                   @if (esAdminOAlmacenero()) {
                     <td>
                       <div class="d-flex gap-8">
                         <button class="btn btn-sm btn-outline" (click)="openModal(p)">✏️</button>
                         @if (esAdmin()) {
                           <button class="btn btn-sm btn-danger" (click)="eliminar(p.id!)">🗑️</button>
                         }
                       </div>
                     </td>
                   }
                 </tr>
               }
               @empty {
                 <tr><td colspan="8" class="text-center text-muted" style="padding:32px">Sin productos registrados</td></tr>
               }
             </tbody>
           </table>
         </div>
         
         <!-- Paginación del Servidor -->
         <div class="pagination-container d-flex justify-between align-center" style="margin-top: 16px; padding: 12px 16px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;">
           <div class="pagination-info text-muted" style="font-size: 0.875rem;">
             Mostrando <strong>{{ getInicio() }}</strong> a <strong>{{ getFin() }}</strong> de <strong>{{ totalProductos() }}</strong> productos
           </div>
           
           <div class="d-flex align-center gap-16" style="flex-wrap: wrap;">
             <div class="form-group d-flex align-center gap-8" style="margin-bottom: 0;">
               <span class="text-muted" style="font-size: 0.875rem;">Filas por página:</span>
               <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)" class="form-select" style="width: auto; padding: 4px 8px; font-size: 0.875rem;">
                 <option [value]="25">25</option>
                 <option [value]="50">50</option>
                 <option [value]="100">100</option>
               </select>
             </div>
             
             <div class="pagination-buttons d-flex gap-4">
               <button type="button" class="btn btn-sm btn-outline" [disabled]="currentPage() === 0" (click)="goToPage(0)">«</button>
               <button type="button" class="btn btn-sm btn-outline" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">‹</button>
               
               @for (p of getVisiblePages(); track $index) {
                 @if (p === -1) {
                   <span class="text-muted" style="padding: 0 8px; align-self: center;">...</span>
                 } @else {
                   <button type="button" class="btn btn-sm" [class.btn-primary]="currentPage() === p" [class.btn-outline]="currentPage() !== p" (click)="goToPage(p)">
                     {{ p + 1 }}
                   </button>
                 }
               }
               
               <button type="button" class="btn btn-sm btn-outline" [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">›</button>
               <button type="button" class="btn btn-sm btn-outline" [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(totalPages() - 1)">»</button>
             </div>
           </div>
         </div>
      </div>
      }
    </div>

    <!-- MODAL -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <h3 class="modal-title">{{ editando() ? '✏️ Editar Producto' : '➕ Nuevo Producto' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Código *</label>
                <input formControlName="codigo" class="form-control" placeholder="PROD-001" [readonly]="editando()">
              </div>
              <div class="form-group">
                <label class="form-label">Código de Barras</label>
                <input formControlName="codigoBarras" class="form-control" placeholder="7750123456789">
              </div>
              <div class="form-group" style="grid-column: span 2">
                <label class="form-label">Nombre *</label>
                <input formControlName="nombre" class="form-control" placeholder="Nombre del producto">
              </div>
              <div class="form-group">
                <label class="form-label">Categoría *</label>
                <select formControlName="categoriaId" class="form-select">
                  <option value="">Seleccionar...</option>
                  @for (c of categorias(); track c.id) {
                    <option [value]="c.id">{{ c.nombre }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Unidad de Medida</label>
                <input formControlName="unidadMedida" class="form-control" placeholder="UNIDADES, KG, PAQUETE">
              </div>
              <div class="form-group">
                <label class="form-label">Moneda</label>
                <select formControlName="moneda" class="form-select">
                  <option value="PEN">PEN (S/)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Stock Actual *</label>
                <input formControlName="stockActual" type="number" class="form-control" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">Stock Mínimo *</label>
                <input formControlName="stockMinimo" type="number" class="form-control" placeholder="5">
              </div>
              <div class="form-group">
                <label class="form-label">Precio Compra *</label>
                <input formControlName="precioCompra" type="number" class="form-control" placeholder="0.00">
              </div>
              <div class="form-group">
                <label class="form-label">Precio Venta *</label>
                <input formControlName="precioVenta" type="number" class="form-control" placeholder="0.00">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea formControlName="descripcion" class="form-control" rows="2" placeholder="Descripción opcional..."></textarea>
            </div>
            <div class="d-flex gap-8" style="justify-content:flex-end; margin-top:16px">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ editando() ? 'Actualizar' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`.mb-16 { margin-bottom: 16px; } code { font-size: 0.8rem; } textarea { resize: vertical; }`]
})
export class ListaProductosComponent implements OnInit, OnDestroy {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  esAdmin(): boolean {
    return this.authService.getRol() === 'ADMIN';
  }

  esAdminOAlmacenero(): boolean {
    const rol = this.authService.getRol();
    return rol === 'ADMIN' || rol === 'ALMACENERO';
  }

  // Datos de la página actual (solo 25-100 productos, no 10K+)
  productos = signal<Producto[]>([]);
  totalProductos = signal(0);
  totalPages = signal(1);
  categorias = signal<any[]>([]);
  stockBajoCount = signal(0);
  showModal = signal(false);
  editando = signal<Producto | null>(null);
  loading = signal(false);

  // Paginación del servidor (0-indexed)
  currentPage = signal(0);
  pageSize = signal(25);
  searchQuery = signal('');

  // Debounce para búsqueda
  private searchSubject = new Subject<string>();
  private searchSub: any;

  getInicio(): number {
    return this.totalProductos() === 0 ? 0 : this.currentPage() * this.pageSize() + 1;
  }

  getFin(): number {
    return Math.min((this.currentPage() + 1) * this.pageSize(), this.totalProductos());
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (current > 2) pages.push(-1);
      
      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (current < total - 3) pages.push(-1);
      pages.push(total - 1);
    }
    return pages;
  }

  form = this.fb.group({
    codigo:       ['', Validators.required],
    nombre:       ['', Validators.required],
    descripcion:  [''],
    precioCompra: [0, [Validators.required, Validators.min(0)]],
    precioVenta:  [0, [Validators.required, Validators.min(0)]],
    stockActual:  [0, [Validators.required, Validators.min(0)]],
    stockMinimo:  [5, [Validators.required, Validators.min(0)]],
    categoriaId:  ['', Validators.required],
    codigoBarras: [''],
    unidadMedida: ['UNIDADES'],
    moneda:       ['PEN']
  });

  ngOnInit(): void {
    this.cargarDatos();
    this.categoriaService.getAll().subscribe(cats => this.categorias.set(cats));
    this.productoService.getStockBajoCount().subscribe(res => this.stockBajoCount.set(res.count));

    // Configurar búsqueda con debounce de 400ms
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(q => {
      this.searchQuery.set(q);
      this.currentPage.set(0);
      this.cargarDatos();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.productoService.getAll(this.currentPage(), this.pageSize(), this.searchQuery() || undefined).subscribe({
      next: (page) => {
        this.productos.set(page.content);
        this.totalProductos.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchSubject.next(q);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.cargarDatos();
    }
  }

  onPageSizeChange(size: any): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.cargarDatos();
  }

  openModal(p?: Producto): void {
    this.editando.set(p ?? null);
    if (p) {
      this.form.patchValue({ ...p, categoriaId: p.categoria?.id?.toString() ?? '' });
    } else {
      this.form.reset({ precioCompra: 0, precioVenta: 0, stockMinimo: 5, unidadMedida: 'UNIDADES', moneda: 'PEN' });
    }
    this.showModal.set(true);
  }

  closeModal(event?: MouseEvent): void {
    if (!event || (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal.set(false);
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const payload = { ...val, categoriaId: Number(val.categoriaId) };
    const p = this.editando();
    const obs = p
      ? this.productoService.update(p.id!, payload as any)
      : this.productoService.create(payload as any);
    obs.subscribe(() => { this.closeModal(); this.cargarDatos(); });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.productoService.delete(id).subscribe(() => this.cargarDatos());
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (rawRows.length === 0) {
          alert('El archivo Excel está vacío.');
          return;
        }

        const mappedProducts = rawRows.map(row => {
          const findVal = (prefixes: string[]): any => {
            const foundKey = Object.keys(row).find(k => 
              prefixes.some(p => k.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(p.toLowerCase().replace(/[^a-z0-9]/g, '')))
            );
            return foundKey ? row[foundKey] : null;
          };

          const codigo = findVal(['codigo', 'cod']);
          const descripcion = findVal(['descripcion', 'desc', 'nombre', 'producto']);
          const categoria = findVal(['categoria', 'cat']);
          const barcodes = findVal(['codigodebarras', 'barras', 'barcode', 'ean']);
          const unidad = findVal(['unidad', 'unidadmedida', 'medida', 'um']);
          const moneda = findVal(['moneda', 'curr']);
          const precio = findVal(['preciounitario', 'precio', 'unitario', 'pventa']);

          const parsedPrecio = precio ? Number(precio) : 0;

          return {
            codigo: codigo ? String(codigo).trim() : '',
            nombre: descripcion ? String(descripcion).trim() : 'Sin Nombre',
            descripcion: `Importado desde Excel. Código Barras: ${barcodes || 'N/A'}`,
            precioCompra: parsedPrecio,
            precioVenta: parsedPrecio,
            stockActual: 0,
            stockMinimo: 5,
            categoriaNombre: categoria ? String(categoria).trim() : 'Abarrotes',
            codigoBarras: barcodes ? String(barcodes).trim() : null,
            unidadMedida: unidad ? String(unidad).trim() : 'UNIDADES',
            moneda: moneda ? String(moneda).trim().toUpperCase() : 'PEN',
            activo: true
          };
        }).filter(p => p.codigo !== '');

        if (mappedProducts.length === 0) {
          alert('No se encontraron filas con el campo CÓDIGO válido.');
          return;
        }

        if (confirm(`Se encontraron ${mappedProducts.length} productos listos para importar. ¿Deseas continuar?`)) {
          this.productoService.importar(mappedProducts as any).subscribe({
            next: (res) => {
              alert(`¡Importación exitosa! Se procesaron ${res.length} productos.`);
              this.cargarDatos();
              input.value = '';
            },
            error: (err) => {
              alert('Error al realizar la importación: ' + (err?.error?.error || err?.message || 'Error desconocido'));
              input.value = '';
            }
          });
        } else {
          input.value = '';
        }
      } catch (err: any) {
        alert('Error al leer el archivo Excel: ' + err.message);
        input.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  }
}
