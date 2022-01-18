export enum EstadoEnGarantia {
    Aguascalientes = 1900,
    BajaCalifornia = 3200,
    BajaCaliforniaSur = 3200,
    Campeche = 3200,
    Chiapas = 3200,
    Chihuahua = 3200,
    CiudadDeMexico = 420,
    CoahuilaDeZaragoza = 3200,
    Colima = 3200,
    Durango = 3200,
    Guanajuato = 1800,
    Guerrero = 2800,
    Hidalgo = 1300,
    Jalisco = 3200,
    Mexico = 1100,
    MichoacanDeOcampo = 1800,
    Morelos = 1100,
    Nayarit = 1000,
    NuevoLeon = 3200,
    Oaxaca = 2800,
    Puebla = 1800,
    Queretaro = 1300,
    QuintanaRoo = 3200,
    SanLuisPotosi = 2200,
    Sinaloa = 3200,
    Sonora = 3200,
    Tabasco = 3200,
    Tamaulipas = 3200,
    Tlaxcala = 1300,
    VeracruzDeIgnacioDeLaLlave = 3200,
    Yucatan = 3200,
    Zacatecas = 2800
}
export enum EstadoFirma {
    Aguascalientes = 2000,
    BajaCalifornia = 4000,
    BajaCaliforniaSur = 2000,
    Campeche = 2000,
    Chiapas = 2000,
    Chihuahua = 2000,
    CiudadDeMexico = 300,
    CoahuilaDeZaragoza = 2000,
    Colima = 2000,
    Durango = 2000,
    Guanajuato = 2000,
    Guerrero = 2000,
    Hidalgo = 1300,
    Jalisco = 2000,
    Mexico = 2000,
    MichoacanDeOcampo = 2000,
    Morelos = 2000,
    Nayarit = 2000,
    NuevoLeon = 2000,
    Oaxaca = 2000,
    Puebla = 2000,
    Queretaro = 2000,
    QuintanaRoo = 2000,
    SanLuisPotosi = 2000,
    Sinaloa = 2000,
    Sonora = 2000,
    Tabasco = 2000,
    Tamaulipas = 2000,
    Tlaxcala = 2000,
    VeracruzDeIgnacioDeLaLlave = 2000,
    Yucatan = 2000,
    Zacatecas = 2000
}
export enum NivelCobertura {
    alpha = "Alpha",
    alphaPlus = "Alpha Plus"
}
export enum Coberturas {
    investigacionRpp = "Investigacion RPP",
    seguro = "Seguro",
    firmaDeContrato = "Firma de Contrat",
    investigacionRG = "Investigaci\u00F3n RG",
    gestionExtrajudicial = "Gestion Extrajudicial",
    recuperacionInmueble = "Recuperacion de Inmueble",
    recuperacionDeAdeudos = "Recuperacion de Adeudos"
}
type Nivel = {
    nombre: NivelCobertura;
    coberturas: Coberturas[];
};
export class Cotizador {
    renta: number;
    estadoGarantia: EstadoEnGarantia;
    estadoFirma: EstadoFirma;
    nivelCobertura: Nivel | undefined;
    costoInvestigacion: number;
    costoSeguro: number;
    costoFirma: number;
    costoInvestigacionRg: number;
    costoIncumplimiento: number;
    costoRecuperacion: number;
    costoAdeudos: number;
    precioDeVentas: number;
    precioDeVentasMasIVA: number;
    constructor(renta: number, estadoGarantia: EstadoEnGarantia, estadoFirma: EstadoFirma, nivelCobertura: NivelCobertura);
    calcularCostos(): void;
    cotizar(): number;
    cambiarRenta(renta: number): number;
    cambiarEstadoGarantia(estado: EstadoEnGarantia): number;
    cambiarEstadoFirma(estado: EstadoFirma): number;
    cambiarNivel(nivel: NivelCobertura): number;
}

//# sourceMappingURL=index.d.ts.map
