import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/api-services';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div>
          <h1 class="page-title">📦 Productos</h1>
          <p class="page-subtitle">{{ productos().length }} productos registrados</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nuevo Producto</button>
      </div>

      <!-- Search + Filters -->
      <div class="card mb-16">
        <div class="d-flex gap-8 align-center">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Buscar por nombre o código..."
                   (input)="filtrar($event)" />
          </div>
          <span class="badge badge-warning">⚠️ {{ stockBajo().length }} con stock bajo</span>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filtrados(); track p.id) {
                <tr>
                  <td><code class="text-primary-color">{{ p.codigo }}</code></td>
                  <td><span class="fw-600">{{ p.nombre }}</span></td>
                  <td><span class="badge badge-info">{{ p.categoria?.nombre }}</span></td>
                  <td>S/ {{ p.precioCompra | number:'1.2-2' }}</td>
                  <td>S/ {{ p.precioVenta | number:'1.2-2' }}</td>
                  <td>
                    <span [class]="p.stockActual <= p.stockMinimo ? 'badge badge-danger' : 'badge badge-success'">
                      {{ p.stockActual }} / {{ p.stockMinimo }}
                    </span>
                  </td>
                  <td><span [class]="p.activo ? 'badge badge-success' : 'badge badge-danger'">{{ p.activo ? 'Activo' : 'Inactivo' }}</span></td>
                  <td>
                    <div class="d-flex gap-8">
                      <button class="btn btn-sm btn-outline" (click)="openModal(p)">✏️</button>
                      <button class="btn btn-sm btn-danger" (click)="eliminar(p.id!)">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="8" class="text-center text-muted" style="padding:32px">Sin productos registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
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
                <label class="form-label">Precio Compra *</label>
                <input formControlName="precioCompra" type="number" class="form-control" placeholder="0.00">
              </div>
              <div class="form-group">
                <label class="form-label">Precio Venta *</label>
                <input formControlName="precioVenta" type="number" class="form-control" placeholder="0.00">
              </div>
              <div class="form-group">
                <label class="form-label">Stock Mínimo</label>
                <input formControlName="stockMinimo" type="number" class="form-control" placeholder="5">
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
export class ListaProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  productos = signal<Producto[]>([]);
  filtrados = signal<Producto[]>([]);
  categorias = signal<any[]>([]);
  stockBajo = signal<Producto[]>([]);
  showModal = signal(false);
  editando = signal<Producto | null>(null);

  form = this.fb.group({
    codigo:       ['', Validators.required],
    nombre:       ['', Validators.required],
    descripcion:  [''],
    precioCompra: [0, [Validators.required, Validators.min(0)]],
    precioVenta:  [0, [Validators.required, Validators.min(0)]],
    stockMinimo:  [5],
    categoriaId:  ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargarDatos();
    this.categoriaService.getAll().subscribe(cats => this.categorias.set(cats));
  }

  cargarDatos(): void {
    this.productoService.getAll().subscribe(ps => {
      this.productos.set(ps);
      this.filtrados.set(ps);
    });
    this.productoService.getStockBajo().subscribe(ps => this.stockBajo.set(ps));
  }

  filtrar(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtrados.set(q ? this.productos().filter(p =>
      p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    ) : this.productos());
  }

  openModal(p?: Producto): void {
    this.editando.set(p ?? null);
    if (p) {
      this.form.patchValue({ ...p, categoriaId: p.categoria?.id?.toString() ?? '' });
    } else {
      this.form.reset({ precioCompra: 0, precioVenta: 0, stockMinimo: 5 });
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
}
