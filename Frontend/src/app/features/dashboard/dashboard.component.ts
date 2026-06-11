import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/api-services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fadein">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Resumen general del sistema</p>
        </div>
        <div class="d-flex gap-8">
          <a routerLink="/ventas/nueva" class="btn btn-primary">➕ Nueva Venta</a>
          <a routerLink="/compras/nueva" class="btn btn-outline">🛒 Nueva Compra</a>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-lg"></div>
          <p>Cargando estadísticas...</p>
        </div>
      } @else {
        <!-- KPI Grid -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon success">💰</div>
            <div>
              <div class="kpi-label">Ventas Hoy</div>
              <div class="kpi-value">S/ {{ stats()?.ventasHoy | number:'1.2-2' }}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon primary">📊</div>
            <div>
              <div class="kpi-label">Total Ventas</div>
              <div class="kpi-value">{{ stats()?.totalVentas }}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon accent">📦</div>
            <div>
              <div class="kpi-label">Productos</div>
              <div class="kpi-value">{{ stats()?.totalProductos }}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon info">🤝</div>
            <div>
              <div class="kpi-label">Clientes</div>
              <div class="kpi-value">{{ stats()?.totalClientes }}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon warning">🛒</div>
            <div>
              <div class="kpi-label">Compras Pendientes</div>
              <div class="kpi-value">{{ stats()?.comprasPendientes }}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon danger">⚠️</div>
            <div>
              <div class="kpi-label">Alertas Stock</div>
              <div class="kpi-value">{{ stats()?.alertasStock }}</div>
            </div>
          </div>
        </div>

        <!-- Ventas por Mes + Stock Bajo -->
        <div class="grid-2">
          <!-- Gráfico de Ventas -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📈 Ventas por Mes ({{ currentYear }})</span>
            </div>
            <div class="chart-area">
              @if (stats()?.ventasPorMes) {
                <div class="bar-chart">
                  @for (mes of getMeses(); track mes.num) {
                    <div class="bar-col">
                      <div class="bar-label-top">{{ mes.valor > 0 ? (mes.valor | number:'1.0-0') : '' }}</div>
                      <div class="bar" [style.height.%]="getBarHeight(mes.valor)"
                           [class.has-value]="mes.valor > 0"
                           [title]="'S/ ' + mes.valor"></div>
                      <div class="bar-label">{{ mes.label }}</div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Stock Bajo -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">⚠️ Productos con Stock Bajo</span>
              <a routerLink="/inventario" class="btn btn-sm btn-outline">Ver todo</a>
            </div>
            @if (stats()?.productosStockBajo?.length === 0) {
              <div class="empty-state">✅ Todos los productos tienen stock suficiente</div>
            } @else {
              <div class="stock-list">
                @for (p of stats()?.productosStockBajo; track p.id) {
                  <div class="stock-item">
                    <div class="stock-info">
                      <span class="stock-name">{{ p.nombre }}</span>
                      <div class="stock-bars">
                        <div class="stock-progress">
                          <div class="stock-fill"
                               [style.width.%]="(p.stockActual / p.stockMinimo) * 100"
                               [class.critical]="p.stockActual === 0"></div>
                        </div>
                      </div>
                    </div>
                    <div class="stock-numbers">
                      <span class="badge badge-danger">{{ p.stockActual }} / {{ p.stockMinimo }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Accesos rápidos -->
        <div class="card mt-16">
          <div class="card-header">
            <span class="card-title">⚡ Accesos Rápidos</span>
          </div>
          <div class="quick-actions">
            <a routerLink="/ventas/nueva"    class="quick-btn">💰 Nueva Venta</a>
            <a routerLink="/clientes"        class="quick-btn">🤝 Clientes</a>
            <a routerLink="/productos"       class="quick-btn">📦 Productos</a>
            <a routerLink="/compras/nueva"   class="quick-btn">🛒 Nueva Compra</a>
            <a routerLink="/inventario"      class="quick-btn">🗄️ Inventario</a>
            <a routerLink="/reportes"        class="quick-btn">📄 Reportes PDF</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; color: var(--text-secondary); }
    .spinner-lg { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Bar Chart */
    .chart-area { padding: 8px 0; }
    .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 160px; padding-bottom: 24px; position: relative; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; position: relative; }
    .bar-label-top { font-size: 0.6rem; color: var(--text-muted); height: 16px; white-space: nowrap; }
    .bar { width: 100%; background: var(--bg-hover); border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 2px; }
    .bar.has-value { background: linear-gradient(to top, var(--primary), var(--accent)); }
    .bar-label { font-size: 0.65rem; color: var(--text-muted); position: absolute; bottom: 0; }

    /* Stock */
    .stock-list { display: flex; flex-direction: column; gap: 12px; }
    .stock-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .stock-info { flex: 1; }
    .stock-name { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); }
    .stock-progress { height: 6px; background: var(--bg-hover); border-radius: 3px; margin-top: 4px; }
    .stock-fill { height: 100%; background: var(--warning); border-radius: 3px; transition: width 0.5s ease; max-width: 100%; }
    .stock-fill.critical { background: var(--danger); }
    .empty-state { text-align: center; padding: 24px; color: var(--success); font-size: 0.9rem; }

    /* Quick actions */
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .quick-btn {
      display: flex; align-items: center; gap: 8px; padding: 14px 16px;
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius); color: var(--text-secondary);
      text-decoration: none; font-size: 0.875rem; font-weight: 500;
      transition: var(--transition);
    }
    .quick-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(99,102,241,0.08); transform: translateY(-1px); }

    .mt-16 { margin-top: 16px; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  stats = signal<any>(null);
  currentYear = new Date().getFullYear();

  private mesesNombre = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: data => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getMeses(): { num: number; label: string; valor: number }[] {
    const ventasMes = this.stats()?.ventasPorMes ?? {};
    return this.mesesNombre.map((label, i) => ({
      num: i + 1, label, valor: Number(ventasMes[i + 1] ?? 0)
    }));
  }

  getBarHeight(valor: number): number {
    const max = Math.max(...this.getMeses().map(m => m.valor), 1);
    return Math.max((valor / max) * 85, 0);
  }
}
