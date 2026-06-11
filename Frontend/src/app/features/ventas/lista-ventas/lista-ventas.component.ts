import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VentaService } from '../../../core/services/api-services';
import { Venta } from '../../../core/models/venta.model';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div>
          <h1 class="page-title">💰 Ventas</h1>
          <p class="page-subtitle">{{ ventas().length }} ventas registradas</p>
        </div>
        <a routerLink="/ventas/nueva" class="btn btn-primary">➕ Nueva Venta</a>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>N° Venta</th><th>Fecha</th><th>Cliente</th><th>Comprobante</th><th>Subtotal</th><th>IGV</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              @for (v of ventas(); track v.id) {
                <tr>
                  <td><code class="text-primary-color">{{ v.numeroVenta }}</code></td>
                  <td>{{ v.fechaVenta | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ v.cliente?.nombres }} {{ v.cliente?.apellidos }}</td>
                  <td><span class="badge badge-info">{{ v.tipoComprobante }}</span></td>
                  <td>S/ {{ v.subtotal | number:'1.2-2' }}</td>
                  <td>S/ {{ v.igv | number:'1.2-2' }}</td>
                  <td class="fw-bold">S/ {{ v.total | number:'1.2-2' }}</td>
                  <td>
                    <span [class]="v.estado === 'COMPLETADA' ? 'badge badge-success' : v.estado === 'ANULADA' ? 'badge badge-danger' : 'badge badge-warning'">
                      {{ v.estado }}
                    </span>
                  </td>
                  <td>
                    @if (v.estado !== 'ANULADA') {
                      <button class="btn btn-sm btn-danger" (click)="anular(v.id!)">🚫 Anular</button>
                    }
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="9" class="text-center text-muted" style="padding:32px">Sin ventas registradas</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ListaVentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  ventas = signal<Venta[]>([]);

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.ventaService.getAll().subscribe(vs => this.ventas.set(vs)); }
  anular(id: number): void {
    if (confirm('¿Anular esta venta? Se revertirá el stock.')) {
      this.ventaService.anular(id).subscribe(() => this.cargar());
    }
  }
}
