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
  styleUrl: './admin-layout.component.css'
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

