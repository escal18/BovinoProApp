export type EstadoGestacion = 'Inseminada' | 'Preñada' | 'Vacía' | 'Aborto';

export interface EventoReproduccion {
    id: string;
    hembraId: string;
    fechaInseminacion?: Date;
    toroIdOpcional?: string;
    estado: EstadoGestacion;
    fechaProbableParto?: Date;
    fechaPartoReal?: Date;
    complicaciones?: string;
    criasGeneradasIds?: string[];
}