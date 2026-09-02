export type TurnoOrdena = 'Mañana' | 'Tarde' | 'Noche';

export interface RegistroProduccion {
    id: string;
    animalId: string;
    fecha: Date;
    turno: TurnoOrdena;
    litrosProducidos: number;
    calidadLeche?: string;
    registradoPor: string;
}