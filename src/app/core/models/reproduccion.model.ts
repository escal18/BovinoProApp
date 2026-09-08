export type TipoEventoReproduccion = 'Celo' | 'Monta / Inseminación' | 'Diagnóstico de Gestación' | 'Secado' | 'Parto';

export interface EventoReproduccion {
    id?: string;
    animalId: string;
    areteSiniiga: string;
    nombreAnimal?: string;
    tipo: TipoEventoReproduccion;
    fecha: string;
    
    toroInvolucrado?: string;
    resultadoTacto?: 'Positivo (Gestante)' | 'Negativo (Vacía)' | 'Dudoso';
    fechaProbableParto?: string;
    criasNacidas?: number;       
    generoCria?: 'Macho' | 'Hembra' | 'Mixto'; // <-- Quitamos el acento aquí
    
    observaciones?: string;
    veterinarioEncargado?: string;
}