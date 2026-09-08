export type TipoRegistro = 'Individual' | 'Tanque General';

export interface RegistroProduccion {
    id?: string;
    tipoRegistro: TipoRegistro;
    animalId?: string;
    loteGrupo?: string;
    fecha: string;
    litrosProducidos: number;
    litrosVendidos?: number; 
    diferencia?: number;     
    calidadLeche?: string;
    registradoPor: string;
}