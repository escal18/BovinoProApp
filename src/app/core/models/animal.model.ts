export type EstadoAnimal = 'Activo' | 'Vendido' | 'Fallecido' | 'En Tratamiento';
export type GeneroAnimal = 'Macho' | 'Hembra';
export type EtapaDesarrollo = 'Ternera' | 'Becerra' | 'Productora' | 'Seca' | 'Semental'; // <-- Opcional: puedes definir los tipos

export interface Animal {
    id: string;
    areteSiniiga: string;
    nombreOpcional?: string;
    genero: GeneroAnimal;
    raza: string;
    etapaDesarrollo?: EtapaDesarrollo; // <-- Agrega esta propiedad aquí
    fechaNacimiento: Date;
    pesoActualKg: number;
    estado: EstadoAnimal;
    loteUbicacion: string;
    notas?: string;
    madreId?: string;
    padreId?: string;
}