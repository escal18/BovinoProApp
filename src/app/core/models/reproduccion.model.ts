export type EstadoGestacion = 'Inseminada' | 'Preñada' | 'Vacía' | 'Aborto';

export interface EventoReproduccion {
    id: string;
    hembraId: string;               // Arete SINIIGA de la hembra
    nombreHembra?: string;          // Alias opcional (ej. La Pinta)
    fechaInseminacion?: Date;
    toroIdOpcional?: string;        // Semental o código de pajilla
    estado: EstadoGestacion;
    fechaProbableParto?: Date;
    fechaPartoReal?: Date;
    complicaciones?: string;
    criasGeneradasIds?: string[];
}