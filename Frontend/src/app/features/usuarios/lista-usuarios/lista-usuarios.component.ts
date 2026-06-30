import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/api-services';
import { Usuario } from '../../../core/models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/config/api.config';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">👥 Usuarios</h1><p class="page-subtitle">{{ usuarios().length }} usuarios registrados</p></div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nuevo Usuario</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Username</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr>
                  <td class="fw-600">{{ u.nombre }} {{ u.apellido }}</td>
                  <td><code class="text-primary-color">{{ u.username }}</code></td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span [class]="u.rol?.nombre === 'ADMIN' ? 'badge badge-primary' : u.rol?.nombre === 'VENDEDOR' ? 'badge badge-success' : 'badge badge-info'">
                      {{ u.rol?.nombre }}
                    </span>
                  </td>
                  <td><span [class]="u.activo ? 'badge badge-success' : 'badge badge-danger'">{{ u.activo ? 'Activo' : 'Inactivo' }}</span></td>
                  <td><div class="d-flex gap-8">
                    <button class="btn btn-sm btn-outline" (click)="openModal(u)">✏️</button>
                    <button class="btn btn-sm btn-danger" (click)="eliminar(u.id!)">🗑️</button>
                  </div></td>
                </tr>
              }
              @empty { <tr><td colspan="6" class="text-center text-muted" style="padding:32px">Sin usuarios</td></tr> }
            </tbody>
          </table>
        </div>
      </div>
    </div>
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <h3 class="modal-title">{{ editando() ? '✏️ Editar Usuario' : '➕ Nuevo Usuario' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Nombre *</label><input formControlName="nombre" class="form-control"></div>
              <div class="form-group"><label class="form-label">Apellido *</label><input formControlName="apellido" class="form-control"></div>
              <div class="form-group"><label class="form-label">Username *</label><input formControlName="username" class="form-control" [readonly]="!!editando()"></div>
              <div class="form-group"><label class="form-label">Email *</label><input formControlName="email" type="email" class="form-control"></div>
              <div class="form-group"><label class="form-label">{{ editando() ? 'Nueva Contraseña' : 'Contraseña *' }}</label><input formControlName="password" type="password" class="form-control"></div>
              <div class="form-group"><label class="form-label">Rol *</label>
                <select formControlName="rolId" class="form-select">
                  @for (r of roles(); track r.id) { <option [value]="r.id">{{ r.nombre }}</option> }
                </select>
              </div>
              <div class="form-group"><label class="form-label">Teléfono</label><input formControlName="telefono" class="form-control"></div>
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
export class ListaUsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  usuarios = signal<Usuario[]>([]);
  roles = signal<any[]>([]);
  showModal = signal(false);
  editando = signal<Usuario | null>(null);

  form = this.fb.group({
    nombre: ['', Validators.required], apellido: ['', Validators.required],
    username: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
    password: [''], telefono: [''], rolId: ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargar();
    this.http.get<any[]>(`${API_URL}/roles`).subscribe(rs => this.roles.set(rs));
  }
  cargar(): void { this.usuarioService.getAll().subscribe(us => this.usuarios.set(us)); }
  openModal(u?: Usuario): void {
    this.editando.set(u ?? null);
    if (u) this.form.patchValue({ ...u as any, rolId: u.rol?.id?.toString() ?? '', password: '' });
    else this.form.reset();
    if (!u) this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    else this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }
  closeModal(e?: MouseEvent): void { if (!e || (e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal.set(false); }
  guardar(): void {
    const u = this.editando();
    const obs = u ? this.usuarioService.update(u.id!, this.form.value) : this.usuarioService.create(this.form.value);
    obs.subscribe(() => { this.closeModal(); this.cargar(); });
  }
  eliminar(id: number): void { if (confirm('¿Eliminar usuario?')) this.usuarioService.delete(id).subscribe(() => this.cargar()); }
}
