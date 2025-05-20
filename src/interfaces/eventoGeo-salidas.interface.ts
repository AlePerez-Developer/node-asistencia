import { eventoGeo } from "./eventoGeo.interface";

export interface EventoSalidas extends eventoGeo {
  horasalidaminima: string;
  horasalidamaxima: string;
}
