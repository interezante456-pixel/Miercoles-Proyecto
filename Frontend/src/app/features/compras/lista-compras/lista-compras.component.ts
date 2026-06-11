import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompraService } from '../../../core/services/api-services';
import { Compra } from '../../../core/models/compra.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-compras',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div><h1 class="page-title">🛒 Órdenes de Compra</h1><p class="page-subtitle">{{ compras().length }} órdenes registradas</p></div>
        <a routerLink="/compras/nueva" class="btn btn-primary">➕ Nueva Compra</a>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>N° Compra</th><th>Fecha</th><th>Proveedor</th><th>Total</th><th>Estado</th><th>F. Esperada</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (c of compras(); track c.id) {
                <tr>
                  <td><code class="text-primary-color">{{ c.numeroCompra }}</code></td>
                  <td>{{ c.fechaCompra | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="fw-600">{{ c.proveedor?.razonSocial }}</td>
                  <td class="fw-bold">S/ {{ c.total | number:'1.2-2' }}</td>
                  <td>
                    <span [class]="c.estado === 'RECIBIDA' ? 'badge badge-success' : c.estado === 'PENDIENTE' ? 'badge badge-warning' : c.estado === 'ANULADA' ? 'badge badge-danger' : 'badge badge-info'">
                      {{ c.estado }}
                    </span>
                  </td>
                  <td>{{ c.fechaEsperada | date:'dd/MM/yyyy' }}</td>
                  <td>
                    @if (c.estado === 'PENDIENTE') {
                      <button class="btn btn-sm btn-success" (click)="recibir(c.id!)">✅ Recibir</button>
                    }
                  </td>
                </tr>
              }
              @empty { <tr><td colspan="7" class="text-center text-muted" style="padding:32px">Sin órdenes de compra</td></tr> }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ListaComprasComponent implements OnInit {
  private compraService = inject(CompraService);
  compras = signal<Compra[]>([]);

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.compraService.getAll().subscribe(cs => this.compras.set(cs)); }
  recibir(id: number): void {
    if (confirm('¿Marcar compra como recibida? Se aumentará el stock.')) {
      this.compraService.recibir(id).subscribe(() => this.cargar());
    }
  }
}
