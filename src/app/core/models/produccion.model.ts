export type TurnoOrdena = 'Mañana' | 'Tarde';
export type TipoRegistro = 'Individual' | 'Tanque General';

export interface RegistroProduccion {
    id: string;
    tipoRegistro: TipoRegistro;
    animalId?: string;
    loteGrupo?: string;
    fecha: Date;
    turno: TurnoOrdena;
    litrosProducidos: number;
    litrosVendidos?: number; // <-- Nuevo: Litros entregados/vendidos para comparar
    diferencia?: number;     // <-- Nuevo: Diferencia calculada (Producidos vs Vendidos)
    calidadLeche?: string;
    registradoPor: string;
}