export type TipoEventoSalud = 'Vacuna' | 'Desparasitante' | 'Enfermedad' | 'Revisión Rutina';

export interface EventoSalud {
    id: string;
    animalId: string;
    tipo: TipoEventoSalud;
    fecha: Date;
    diagnostico?: string;
    tratamientoAplicado: string;
    dosis?: string;
    veterinarioEncargado: string;
    proximaRevision?: Date;
}