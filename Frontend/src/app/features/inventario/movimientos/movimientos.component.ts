import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../../core/services/api-services';
import { Inventario } from '../../../core/models/compra.model';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">🗄️ Inventario</h1><p class="page-subtitle">Historial de movimientos de stock</p></div>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock Ant.</th><th>Stock Nuevo</th><th>Motivo</th><th>Referencia</th><th>Usuario</th></tr></thead>
            <tbody>
              @for (m of movimientos(); track m.id) {
                <tr>
                  <td>{{ m.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="fw-600">{{ m.producto?.nombre }}</td>
                  <td>
                    <span [class]="m.tipo === 'ENTRADA' ? 'badge badge-success' : m.tipo === 'SALIDA' ? 'badge badge-danger' : 'badge badge-warning'">
                      {{ m.tipo === 'ENTRADA' ? '📈' : m.tipo === 'SALIDA' ? '📉' : '🔄' }} {{ m.tipo }}
                    </span>
                  </td>
                  <td class="fw-bold">{{ m.tipo === 'SALIDA' ? '-' : '+' }}{{ m.cantidad }}</td>
                  <td>{{ m.stockAnterior }}</td>
                  <td><span [class]="m.stockNuevo <= 5 ? 'text-danger fw-bold' : ''">{{ m.stockNuevo }}</span></td>
                  <td>{{ m.motivo }}</td>
                  <td><span class="badge badge-info">{{ m.referenciaTipo }}</span></td>
                  <td>{{ m.usuario?.nombre }}</td>
                </tr>
              }
              @empty { <tr><td colspan="9" class="text-center text-muted" style="padding:32px">Sin movimientos registrados</td></tr> }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MovimientosComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  movimientos = signal<Inventario[]>([]);
  ngOnInit(): void { this.inventarioService.getAll().subscribe(ms => this.movimientos.set(ms.reverse())); }
}
