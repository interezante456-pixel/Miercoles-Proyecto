import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { Usuario } from './usuario.model';

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
export type TipoComprobante = 'BOLETA' | 'FACTURA' | 'TICKET';

export interface DetalleVenta {
  id?: number;
  producto: Producto;
  productoId?: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal: number;
}

export interface Venta {
  id?: number;
  numeroVenta?: string;
  tipoComprobante: TipoComprobante;
  estado?: EstadoVenta;
  subtotal?: number;
  igv?: number;
  total?: number;
  observaciones?: string;
  cliente: Cliente;
  clienteId?: number;
  usuario?: Usuario;
  detalles: DetalleVenta[];
  fechaVenta?: string;
}

export interface VentaRequest {
  clienteId: number;
  tipoComprobante: TipoComprobante;
  observaciones?: string;
  detalles: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
  }[];
}
