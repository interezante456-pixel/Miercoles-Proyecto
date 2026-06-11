import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../core/services/api-services';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div>
          <h1 class="page-title">📄 Reportes</h1>
          <p class="page-subtitle">Descarga reportes en formato PDF</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card reporte-card">
          <div class="reporte-icon">💰</div>
          <h3>Reporte de Ventas</h3>
          <p>Descarga un reporte completo de todas las ventas registradas en el sistema, incluyendo clientes, totales e IGV.</p>
          <button class="btn btn-primary" [disabled]="loadingVentas()" (click)="descargarVentas()">
            @if (loadingVentas()) { ⏳ Generando... } @else { 📥 Descargar PDF }
          </button>
        </div>

        <div class="card reporte-card">
          <div class="reporte-icon">📦</div>
          <h3>Reporte de Inventario</h3>
          <p>Descarga el estado actual del inventario con todos los productos, stocks actuales, mínimos y alertas de reposición.</p>
          <button class="btn btn-primary" [disabled]="loadingInventario()" (click)="descargarInventario()">
            @if (loadingInventario()) { ⏳ Generando... } @else { 📥 Descargar PDF }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reporte-card { text-align: center; padding: 40px; }
    .reporte-card h3 { font-size: 1.2rem; font-weight: 600; margin: 16px 0 8px; }
    .reporte-card p { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 24px; }
    .reporte-icon { font-size: 3.5rem; }
  `]
})
export class ReportesComponent {
  private reporteService = inject(ReporteService);
  loadingVentas = signal(false);
  loadingInventario = signal(false);

  descargarVentas(): void {
    this.loadingVentas.set(true);
    this.reporteService.descargarReporteVentas().subscribe({
      next: blob => { this.reporteService.descargar(blob, 'reporte-ventas.pdf'); this.loadingVentas.set(false); },
      error: () => this.loadingVentas.set(false)
    });
  }

  descargarInventario(): void {
    this.loadingInventario.set(true);
    this.reporteService.descargarReporteInventario().subscribe({
      next: blob => { this.reporteService.descargar(blob, 'reporte-inventario.pdf'); this.loadingInventario.set(false); },
      error: () => this.loadingInventario.set(false)
    });
  }
}
