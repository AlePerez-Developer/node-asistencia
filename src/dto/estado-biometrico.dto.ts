export class estado_biometrico {
  estado: string;

  private constructor(estado: string) {
    this.estado = estado;
  }

  public static create(estado: number) {
    const _estado = estado_biometrico.getEstadoLiteral(estado);
    return new estado_biometrico(_estado);
  }

  private static getEstadoLiteral(estado: number) {
    return estado === 1 ? "Conectado" : "Desconectado";
  }
}
