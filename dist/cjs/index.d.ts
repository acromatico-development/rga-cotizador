export enum EstadoEnGarantia {
    "Aguascalientes" = 500,
    "Baja California" = 3350,
    "Baja California Sur" = 3350,
    "Campeche" = 575,
    "Chiapas" = 500,
    "Chihuahua" = 500,
    "Ciudad de México" = 500,
    "Coahuila de Zaragoza" = 500,
    "Colima" = 500,
    "Durango" = 575,
    "Guanajuato" = 500,
    "Guerrero" = 2050,
    "Hidalgo" = 1050,
    "Jalisco" = 690,
    "México" = 500,
    "Michoacán de Ocampo" = 1950,
    "Morelos" = 500,
    "Nayarit" = 500,
    "Nuevo León" = 575,
    "Oaxaca" = 575,
    "Puebla" = 1800,
    "Querétaro" = 500,
    "Quintana Roo" = 1200,
    "San Luis Potosí" = 2200,
    "Sinaloa" = 3200,
    "Sonora" = 3000,
    "Tabasco" = 575,
    "Tamaulipas" = 575,
    "Tlaxcala" = 1450,
    "Veracruz de Ignacio de la Llave" = 3200,
    "Yucatán" = 3350,
    "Zacatecas" = 575
}
export enum EstadoFirma {
    "Aguascalientes" = 5000,
    "Baja California" = 5000,
    "Baja California Sur" = 5000,
    "Campeche" = 5000,
    "Chiapas" = 5000,
    "Chihuahua" = 5000,
    "Ciudad de México" = 300,
    "Coahuila de Zaragoza" = 5000,
    "Colima" = 5000,
    "Durango" = 5000,
    "Guanajuato" = 5000,
    "Guerrero" = 5000,
    "Hidalgo" = 5000,
    "Jalisco" = 5000,
    "México" = 350,
    "Michoacán de Ocampo" = 5000,
    "Morelos" = 5000,
    "Nayarit" = 5000,
    "Nuevo León" = 5000,
    "Oaxaca" = 5000,
    "Puebla" = 500,
    "Querétaro" = 5000,
    "Quintana Roo" = 5000,
    "San Luis Potosí" = 5000,
    "Sinaloa" = 5000,
    "Sonora" = 5000,
    "Tabasco" = 5000,
    "Tamaulipas" = 5000,
    "Tlaxcala" = 5000,
    "Veracruz de Ignacio de la Llave" = 5000,
    "Yucatán" = 5000,
    "Zacatecas" = 5000
}
export enum NivelCobertura {
    lite = "Lite",
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
    cp: string;
    estadoGarantia: EstadoEnGarantia;
    estadoFirma: EstadoFirma;
    nivelCobertura: Nivel | undefined;
    resolved: Promise<void>;
    costoInvestigacion: number;
    costoSeguro: number;
    costoFirma: number;
    costoInvestigacionRg: number;
    costoIncumplimiento: number;
    costoRecuperacion: number;
    costoAdeudos: number;
    precioDeVentas: number;
    precioDeVentasMasIVA: number;
    constructor(renta: number, cp: string, estadoFirma: EstadoFirma, nivelCobertura: NivelCobertura);
    calcularCostos(): void;
    cotizar(): number;
    cambiarRenta(renta: number): number;
    cambiarEstadoGarantia(estado: EstadoEnGarantia): number;
    cambiarEstadoFirma(estado: EstadoFirma): number;
    cambiarNivel(nivel: NivelCobertura): number;
}

//# sourceMappingURL=index.d.ts.map
