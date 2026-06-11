import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/api-services';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">🤝 Clientes</h1><p class="page-subtitle">{{ clientes().length }} clientes registrados</p></div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nuevo Cliente</button>
      </div>
      <div class="card mb-16">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar cliente..." (input)="filtrar($event)" />
        </div>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Teléfono</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (c of filtrados(); track c.id) {
                <tr>
                  <td class="fw-600">{{ c.nombres }} {{ c.apellidos }}</td>
                  <td><span class="badge badge-info">{{ c.tipoDoc }}</span> {{ c.nroDoc }}</td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.telefono }}</td>
                  <td><span [class]="c.activo ? 'badge badge-success' : 'badge badge-danger'">{{ c.activo ? 'Activo' : 'Inactivo' }}</span></td>
                  <td><div class="d-flex gap-8">
                    <button class="btn btn-sm btn-outline" (click)="openModal(c)">✏️</button>
                    <button class="btn btn-sm btn-danger" (click)="eliminar(c.id!)">🗑️</button>
                  </div></td>
                </tr>
              }
              @empty { <tr><td colspan="6" class="text-center text-muted" style="padding:32px">Sin clientes registrados</td></tr> }
            </tbody>
          </table>
        </div>
      </div>
    </div>
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <h3 class="modal-title">{{ editando() ? '✏️ Editar Cliente' : '➕ Nuevo Cliente' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Nombres *</label><input formControlName="nombres" class="form-control"></div>
              <div class="form-group"><label class="form-label">Apellidos *</label><input formControlName="apellidos" class="form-control"></div>
              <div class="form-group"><label class="form-label">Tipo Doc *</label>
                <select formControlName="tipoDoc" class="form-select">
                  <option value="DNI">DNI</option><option value="RUC">RUC</option><option value="PASAPORTE">Pasaporte</option><option value="CE">CE</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">N° Documento *</label><input formControlName="nroDoc" class="form-control"></div>
              <div class="form-group"><label class="form-label">Email</label><input formControlName="email" type="email" class="form-control"></div>
              <div class="form-group"><label class="form-label">Teléfono</label><input formControlName="telefono" class="form-control"></div>
            </div>
            <div class="form-group"><label class="form-label">Dirección</label><input formControlName="direccion" class="form-control"></div>
            <div class="d-flex gap-8" style="justify-content:flex-end;margin-top:16px">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid">{{ editando() ? 'Actualizar' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`.mb-16 { margin-bottom: 16px; }`]
})
export class ListaClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);
  clientes = signal<Cliente[]>([]);
  filtrados = signal<Cliente[]>([]);
  showModal = signal(false);
  editando = signal<Cliente | null>(null);

  form = this.fb.group({
    nombres: ['', Validators.required], apellidos: ['', Validators.required],
    tipoDoc: ['DNI', Validators.required], nroDoc: ['', Validators.required],
    email: [''], telefono: [''], direccion: ['']
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.clienteService.getAll().subscribe(cs => { this.clientes.set(cs); this.filtrados.set(cs); }); }
  filtrar(e: Event): void {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtrados.set(q ? this.clientes().filter(c => c.nombres.toLowerCase().includes(q) || c.nroDoc.includes(q)) : this.clientes());
  }
  openModal(c?: Cliente): void { this.editando.set(c ?? null); if (c) this.form.patchValue(c as any); else this.form.reset({ tipoDoc: 'DNI' }); this.showModal.set(true); }
  closeModal(e?: MouseEvent): void { if (!e || (e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal.set(false); }
  guardar(): void {
    const p = this.editando();
    const obs = p ? this.clienteService.update(p.id!, this.form.value as any) : this.clienteService.create(this.form.value as any);
    obs.subscribe(() => { this.closeModal(); this.cargar(); });
  }
  eliminar(id: number): void { if (confirm('¿Eliminar cliente?')) this.clienteService.delete(id).subscribe(() => this.cargar()); }
}
