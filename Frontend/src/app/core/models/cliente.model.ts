export type TipoDocumento = 'DNI' | 'RUC' | 'PASAPORTE' | 'CE';

export interface Cliente {
  id?: number;
  nombres: string;
  apellidos: string;
  tipoDoc: TipoDocumento;
  nroDoc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
  createdAt?: string;
}

export interface Proveedor {
  id?: number;
  razonSocial: string;
  ruc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  contacto?: string;
  activo?: boolean;
  createdAt?: string;
}
