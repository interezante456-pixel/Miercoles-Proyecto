import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/usuarios/lista-usuarios/lista-usuarios.component').then(m => m.ListaUsuariosComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/productos/lista-productos/lista-productos.component').then(m => m.ListaProductosComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categorias/lista-categorias/lista-categorias.component').then(m => m.ListaCategoriasComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/lista-clientes/lista-clientes.component').then(m => m.ListaClientesComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./features/proveedores/lista-proveedores/lista-proveedores.component').then(m => m.ListaProveedoresComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./features/ventas/lista-ventas/lista-ventas.component').then(m => m.ListaVentasComponent)
      },
      {
        path: 'ventas/nueva',
        canActivate: [roleGuard(['ADMIN', 'VENDEDOR'])],
        loadComponent: () => import('./features/ventas/nueva-venta/nueva-venta.component').then(m => m.NuevaVentaComponent)
      },
      {
        path: 'compras',
        loadComponent: () => import('./features/compras/lista-compras/lista-compras.component').then(m => m.ListaComprasComponent)
      },
      {
        path: 'compras/nueva',
        canActivate: [roleGuard(['ADMIN', 'ALMACENERO'])],
        loadComponent: () => import('./features/compras/nueva-compra/nueva-compra.component').then(m => m.NuevaCompraComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/inventario/movimientos/movimientos.component').then(m => m.MovimientosComponent)
      },
      {
        path: 'reportes',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
