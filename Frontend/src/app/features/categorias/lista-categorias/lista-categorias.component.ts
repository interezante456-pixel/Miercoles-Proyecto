import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from '../../../core/services/api-services';
import { Categoria } from '../../../core/models/producto.model';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">🏷️ Categorías</h1></div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nueva Categoría</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (c of categorias(); track c.id) {
                <tr>
                  <td class="fw-600">{{ c.nombre }}</td>
                  <td class="text-muted">{{ c.descripcion }}</td>
                  <td><span [class]="c.activo ? 'badge badge-success' : 'badge badge-danger'">{{ c.activo ? 'Activa' : 'Inactiva' }}</span></td>
                  <td><div class="d-flex gap-8">
                    <button class="btn btn-sm btn-outline" (click)="openModal(c)">✏️</button>
                    <button class="btn btn-sm btn-danger" (click)="eliminar(c.id!)">🗑️</button>
                  </div></td>
                </tr>
              }
              @empty { <tr><td colspan="4" class="text-center text-muted" style="padding:32px">Sin categorías</td></tr> }
            </tbody>
          </table>
        </div>
      </div>
    </div>
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal" style="max-width:400px">
          <h3 class="modal-title">{{ editando() ? '✏️ Editar Categoría' : '➕ Nueva Categoría' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <div class="form-group"><label class="form-label">Nombre *</label><input formControlName="nombre" class="form-control"></div>
            <div class="form-group"><label class="form-label">Descripción</label><textarea formControlName="descripcion" class="form-control" rows="3"></textarea></div>
            <div class="d-flex gap-8" style="justify-content:flex-end;margin-top:16px">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ editando() ? 'Actualizar' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`textarea { resize: vertical; }`]
})
export class ListaCategoriasComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);
  categorias = signal<Categoria[]>([]);
  showModal = signal(false);
  editando = signal<Categoria | null>(null);

  form = this.fb.group({
    nombre: ['', Validators.required], descripcion: ['']
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.categoriaService.getAll().subscribe(cs => this.categorias.set(cs)); }
  openModal(c?: Categoria): void { this.editando.set(c ?? null); if (c) this.form.patchValue(c); else this.form.reset(); this.showModal.set(true); }
  closeModal(e?: MouseEvent): void { if (!e || (e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal.set(false); }
  guardar(): void {
    const c = this.editando();
    const obs = c ? this.categoriaService.update(c.id!, this.form.value as any) : this.categoriaService.create(this.form.value as any);
    obs.subscribe(() => { this.closeModal(); this.cargar(); });
  }
  eliminar(id: number): void { if (confirm('¿Eliminar categoría?')) this.categoriaService.delete(id).subscribe(() => this.cargar()); }
}
