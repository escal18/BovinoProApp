export type TipoEventoSalud = 'Vacuna' | 'Desparasitante' | 'Enfermedad' | 'Revisión Rutina';

export interface EventoSalud {
    id?: string;                  // <-- Opcional para que Firebase lo asigne
    animalId: string;             // <-- El ID larguísimo que genera Firebase (ej. 'Kjasd8932j')
    areteSiniiga: string;         // <-- El Arete físico (ej. '01 2345 6789')
    nombreAnimal?: string;        
    tipo: TipoEventoSalud;
    fecha: string;                // <-- String para que sea compatible con <input type="date">
    diagnostico?: string;
    tratamientoAplicado: string;
    dosis?: string;
    veterinarioEncargado: string;
    proximaRevision?: string;     // <-- String por la misma razón
}