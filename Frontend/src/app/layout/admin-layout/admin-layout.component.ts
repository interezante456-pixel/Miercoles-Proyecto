import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="layout-wrapper">
      <!-- OVERLAY BACKDROP FOR MOBILE -->
      @if (mobileOpen()) {
        <div class="sidebar-backdrop" (click)="closeMobileSidebar()"></div>
      }

      <!-- SIDEBAR -->
      <aside class="sidebar" [class.collapsed]="collapsed()" [class.mobile-open]="mobileOpen()">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">🏪</div>
            @if (!collapsed()) {
              <div class="logo-text">
                <span class="logo-name">Tiendas Mi Cholo S.A.C.</span>
                <span class="logo-version">v1.0</span>
              </div>
            }
          </div>
          <button class="collapse-btn" (click)="toggleCollapse()">
            {{ collapsed() ? '›' : '‹' }}
          </button>
        </div>

        <div class="user-info" [class.collapsed]="collapsed()">
          <div class="avatar">{{ getInitials() }}</div>
          @if (!collapsed()) {
            <div class="user-details">
              <span class="user-name">{{ user()?.nombre }} {{ user()?.apellido }}</span>
              <span class="user-role badge badge-primary">{{ user()?.rol }}</span>
            </div>
          }
        </div>

        <nav class="sidebar-nav">
          @for (item of getNavItems(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active"
               class="nav-item" [title]="item.label" (click)="closeMobileSidebar()">
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="logout()" [title]="'Cerrar Sesión'">
            <span class="nav-icon">🚪</span>
            @if (!collapsed()) { <span class="nav-label">Cerrar Sesión</span> }
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-content">
        <!-- TOPBAR -->
        <header class="topbar">
          <div class="topbar-left" style="display: flex; align-items: center;">
            <button class="mobile-toggle" (click)="toggleMobileSidebar()">☰</button>
            <h1 class="page-section">Panel de Administración</h1>
          </div>
          <div class="topbar-right">
            <div class="time">{{ currentTime() }}</div>
            <div class="user-badge">
              <div class="avatar-sm">{{ getInitials() }}</div>
              <span>{{ user()?.nombre }}</span>
            </div>
          </div>
        </header>

        <div class="page-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-w);
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease, left 0.3s ease;
      overflow: hidden;
      flex-shrink: 0;
      height: 100vh;
    }
    .sidebar.collapsed { width: var(--sidebar-collapsed); }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 14px;
      border-bottom: 1px solid var(--border);
      min-height: var(--header-h);
    }

    .logo { display: flex; align-items: center; gap: 10px; overflow: hidden; }
    .logo-icon { font-size: 1.6rem; flex-shrink: 0; }
    .logo-text { display: flex; flex-direction: column; }
    .logo-name { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
    .logo-version { font-size: 0.7rem; color: var(--text-muted); }

    .collapse-btn {
      background: var(--bg-hover);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      width: 26px; height: 26px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: var(--transition);
    }
    .collapse-btn:hover { background: var(--primary); color: white; }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }
    .user-info.collapsed { justify-content: center; }

    .avatar {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; color: white;
      flex-shrink: 0;
    }
    .avatar-sm {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.75rem; color: white;
    }

    .user-details { display: flex; flex-direction: column; overflow: hidden; }
    .user-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.65rem; }

    .sidebar-nav { flex: 1; padding: 10px 8px; overflow-y: auto; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      text-decoration: none;
      transition: var(--transition);
      margin-bottom: 2px;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      white-space: nowrap;
    }
    .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
    .nav-item.active { background: rgba(99,102,241,0.15); color: var(--primary); font-weight: 600; }
    .nav-item.active .nav-icon { filter: none; }

    .nav-icon { font-size: 1.1rem; flex-shrink: 0; width: 24px; text-align: center; }
    .nav-label { flex: 1; }
    .nav-badge {
      background: var(--danger);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 100px;
    }

    .sidebar-footer { padding: 10px 8px; border-top: 1px solid var(--border); }
    .logout-btn { color: var(--danger); }
    .logout-btn:hover { background: rgba(239,68,68,0.1); }

    /* TOPBAR */
    .topbar {
      height: var(--header-h);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
    }
    .page-section { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .time { font-size: 0.8rem; color: var(--text-muted); font-variant-numeric: tabular-nums; }
    .user-badge { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 1.5rem;
      cursor: pointer;
      margin-right: 12px;
    }
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  collapsed = signal(false);
  mobileOpen = signal(false);
  user = signal(this.authService.getCurrentUser());
  currentTime = signal('');

  private timer: any;

  constructor() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  private updateTime() {
    this.currentTime.set(new Date().toLocaleTimeString('es-PE'));
  }

  ngOnDestroy() { clearInterval(this.timer); }

  toggleCollapse() { this.collapsed.update(v => !v); }

  toggleMobileSidebar() { this.mobileOpen.update(v => !v); }

  closeMobileSidebar() { this.mobileOpen.set(false); }

  getInitials(): string {
    const u = this.user();
    if (!u) return 'U';
    return (u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '');
  }

  logout() { this.authService.logout(); }

  private allNavItems: NavItem[] = [
    { label: 'Dashboard',  icon: '📊', route: '/dashboard' },
    { label: 'Usuarios',   icon: '👥', route: '/usuarios',    roles: ['ADMIN'] },
    { label: 'Productos',  icon: '📦', route: '/productos' },
    { label: 'Categorías', icon: '🏷️', route: '/categorias',   roles: ['ADMIN', 'ALMACENERO'] },
    { label: 'Clientes',   icon: '🤝', route: '/clientes' },
    { label: 'Proveedores',icon: '🏭', route: '/proveedores',  roles: ['ADMIN', 'ALMACENERO'] },
    { label: 'Ventas',     icon: '💰', route: '/ventas' },
    { label: 'Compras',    icon: '🛒', route: '/compras',      roles: ['ADMIN', 'ALMACENERO'] },
    { label: 'Inventario', icon: '🗄️', route: '/inventario' },
    { label: 'Reportes',   icon: '📄', route: '/reportes',    roles: ['ADMIN'] },
  ];

  getNavItems(): NavItem[] {
    const rol = this.authService.getRol();
    return this.allNavItems.filter(item =>
      !item.roles || item.roles.includes(rol)
    );
  }
}

