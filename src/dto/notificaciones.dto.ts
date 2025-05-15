export interface NotificacionDTO {
  title: string;
  body: string;
  userIds: string[];
  salida: string;
  type: string;
  startDate: string;
  endDate: string;
  LugarId: string;
  link: string;
  image: string;
  data: {
    biometrico: boolean;
  };
}
