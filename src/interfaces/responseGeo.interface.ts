import { EventoSalidas } from "./eventoGeo-salidas.interface";
import { eventoGeo } from "./eventoGeo.interface";

export interface responseGeo {
  msg: string;
  nombre: string;
  salidas: eventoGeo[];
  entradas: {
    horasalidaminima: string;
    horasalidamaxima: string;
    materias: EventoSalidas[];
  };
}
