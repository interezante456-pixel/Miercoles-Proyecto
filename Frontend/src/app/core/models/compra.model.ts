import { Producto } from './producto.model';
import { Proveedor } from './cliente.model';
import { Usuario } from './usuario.model';

export type EstadoCompra = 'PENDIENTE' | 'RECIBIDA' | 'PARCIAL' | 'ANULADA';

export interface DetalleCompra {
  id?: number;
  producto: Producto;
  productoId?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Compra {
  id?: number;
  numeroCompra?: string;
  estado?: EstadoCompra;
  subtotal?: number;
  igv?: number;
  total?: number;
  observaciones?: string;
  proveedor: Proveedor;
  proveedorId?: number;
  usuario?: Usuario;
  detalles: DetalleCompra[];
  fechaCompra?: string;
  fechaEsperada?: string;
}

export interface Inventario {
  id?: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo?: string;
  referenciaId?: number;
  referenciaTipo?: string;
  producto: Producto;
  usuario: Usuario;
  fecha: string;
}
