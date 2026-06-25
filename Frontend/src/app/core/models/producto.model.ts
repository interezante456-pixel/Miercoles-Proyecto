export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: string;
}

export interface Almacen {
  id?: number;
  nombre: string;
  ubicacion?: string;
  responsable?: string;
  activo?: boolean;
}

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  imagenUrl?: string;
  codigoBarras?: string;
  unidadMedida?: string;
  moneda?: string;
  activo?: boolean;
  categoria: Categoria;
  categoriaId?: number;
  almacen?: Almacen;
  almacenId?: number;
  createdAt?: string;
}
