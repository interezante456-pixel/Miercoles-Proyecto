import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProveedorService } from '../../../core/services/api-services';
import { Proveedor } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-lista-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">🏭 Proveedores</h1><p class="page-subtitle">{{ proveedores().length }} proveedores</p></div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nuevo Proveedor</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Razón Social</th><th>RUC</th><th>Email</th><th>Teléfono</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (p of proveedores(); track p.id) {
                <tr>
                  <td class="fw-600">{{ p.razonSocial }}</td>
                  <td>{{ p.ruc }}</td>
                  <td>{{ p.email }}</td>
                  <td>{{ p.telefono }}</td>
                  <td>{{ p.contacto }}</td>
                  <td><span [class]="p.activo ? 'badge badge-success' : 'badge badge-danger'">{{ p.activo ? 'Activo' : 'Inactivo' }}</span></td>
                  <td><div class="d-flex gap-8">
                    <button class="btn btn-sm btn-outline" (click)="openModal(p)">✏️</button>
                    <button class="btn btn-sm btn-danger" (click)="eliminar(p.id!)">🗑️</button>
                  </div></td>
                </tr>
              }
              @empty { <tr><td colspan="7" class="text-center text-muted" style="padding:32px">Sin proveedores</td></tr> }
            </tbody>
          </table>
        </div>
      </div>
    </div>
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <h3 class="modal-title">{{ editando() ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <div class="grid-2">
              <div class="form-group" style="grid-column:1/-1"><label class="form-label">Razón Social *</label><input formControlName="razonSocial" class="form-control"></div>
              <div class="form-group"><label class="form-label">RUC *</label><input formControlName="ruc" class="form-control"></div>
              <div class="form-group"><label class="form-label">Email</label><input formControlName="email" type="email" class="form-control"></div>
              <div class="form-group"><label class="form-label">Teléfono</label><input formControlName="telefono" class="form-control"></div>
              <div class="form-group"><label class="form-label">Contacto</label><input formControlName="contacto" class="form-control"></div>
              <div class="form-group" style="grid-column:1/-1"><label class="form-label">Dirección</label><input formControlName="direccion" class="form-control"></div>
            </div>
            <div class="d-flex gap-8" style="justify-content:flex-end;margin-top:16px">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ editando() ? 'Actualizar' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ListaProveedoresComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private fb = inject(FormBuilder);
  proveedores = signal<Proveedor[]>([]);
  showModal = signal(false);
  editando = signal<Proveedor | null>(null);

  form = this.fb.group({
    razonSocial: ['', Validators.required], ruc: ['', Validators.required],
    email: [''], telefono: [''], contacto: [''], direccion: ['']
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.proveedorService.getAll().subscribe(ps => this.proveedores.set(ps)); }
  openModal(p?: Proveedor): void { this.editando.set(p ?? null); if (p) this.form.patchValue(p as any); else this.form.reset(); this.showModal.set(true); }
  closeModal(e?: MouseEvent): void { if (!e || (e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal.set(false); }
  guardar(): void {
    const p = this.editando();
    const obs = p ? this.proveedorService.update(p.id!, this.form.value as any) : this.proveedorService.create(this.form.value as any);
    obs.subscribe(() => { this.closeModal(); this.cargar(); });
  }
  eliminar(id: number): void { if (confirm('¿Eliminar proveedor?')) this.proveedorService.delete(id).subscribe(() => this.cargar()); }
}
