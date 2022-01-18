// import axios from "axios";

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
  Zacatecas = 2800,
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
  Zacatecas = 2000,
}

export enum NivelCobertura {
  // alphaLight,
  alpha = "Alpha",
  alphaPlus = "Alpha Plus",
}

export enum Coberturas {
  investigacionRpp = "Investigacion RPP",
  seguro = "Seguro",
  firmaDeContrato = "Firma de Contrat",
  investigacionRG = "Investigación RG",
  gestionExtrajudicial = "Gestion Extrajudicial",
  recuperacionInmueble = "Recuperacion de Inmueble",
  recuperacionDeAdeudos = "Recuperacion de Adeudos",
}

type Nivel = {
  nombre: NivelCobertura;
  coberturas: Coberturas[];
};

export class Cotizador {
  //Variables
  renta: number;
  estadoGarantia: EstadoEnGarantia;
  estadoFirma: EstadoFirma;
  nivelCobertura: Nivel | undefined;
  private _perfilRiesgoIncumplimiento: number;
  private _investigacionRg: number;
  private _perfilRiesgoJuicioRecuperacion: number;
  private _perfilRiesgoJuicioAdeudos: number;

  //Constantes
  private _factorInvestigacion: number;
  private _factorSeguro: number;
  private _factorFirma: number;
  private _factorSolvencia: number;
  private _factorIncumplimiento: number;
  private _factorRecuperacion: number;
  private _factorAdeudos: number;
  private _niveles: Nivel[];

  //Costos
  costoInvestigacion: number;
  costoSeguro: number;
  costoFirma: number;
  costoInvestigacionRg: number;
  costoIncumplimiento: number;
  costoRecuperacion: number;
  costoAdeudos: number;

  //Cotizacion
  private _costoDeVentas: number;
  private _utilidad: number;
  precioDeVentas: number;
  precioDeVentasMasIVA: number;
  private _comisionInmobiliaria: number;

  constructor(
    renta: number,
    estadoGarantia: EstadoEnGarantia,
    estadoFirma: EstadoFirma,
    nivelCobertura: NivelCobertura
  ) {
    this.renta = renta;
    this.estadoGarantia = estadoGarantia;
    this.estadoFirma = estadoFirma;

    //TO DO: traer variables de fuente externa
    this._investigacionRg = 21;
    this._perfilRiesgoIncumplimiento = 0.2;
    this._perfilRiesgoJuicioRecuperacion = 0.025;
    this._perfilRiesgoJuicioAdeudos = 0.025;

    //TO DO: traer constantes de fuente externa
    this._factorInvestigacion = 1;
    this._factorSeguro = 0.1308;
    this._factorFirma = 1;
    this._factorSolvencia = 1;
    this._factorIncumplimiento = 180;
    this._factorRecuperacion = 3718.88;
    this._factorAdeudos = 14875.51;

    //TO DO: traer niveles de fuente externa
    this._niveles = [
      {
        nombre: NivelCobertura.alpha,
        coberturas: [
          Coberturas.investigacionRpp,
          Coberturas.firmaDeContrato,
          Coberturas.investigacionRG,
          Coberturas.gestionExtrajudicial,
          Coberturas.recuperacionInmueble,
          Coberturas.recuperacionDeAdeudos,
        ],
      },
      {
        nombre: NivelCobertura.alphaPlus,
        coberturas: [
          Coberturas.investigacionRpp,
          Coberturas.firmaDeContrato,
          Coberturas.investigacionRG,
          Coberturas.gestionExtrajudicial,
          Coberturas.recuperacionInmueble,
          Coberturas.recuperacionDeAdeudos,
          Coberturas.seguro,
        ],
      },
    ];

    this.nivelCobertura = this._niveles.find(
      (niv) => niv.nombre === nivelCobertura
    )
      ? this._niveles.find((niv) => niv.nombre === nivelCobertura)
      : this._niveles[0];

    // axios("https://www.lycklig.com.mx/products/platos-rosa-con-dorado.json")
    //   .then((data) => console.log(data.data))
    //   .catch((err) => console.log(err));

    //setear a 0 costos
    this.costoInvestigacion = 0;
    this.costoSeguro = 0;
    this.costoFirma = 0;
    this.costoInvestigacionRg = 0;
    this.costoIncumplimiento = 0;
    this.costoRecuperacion = 0;
    this.costoAdeudos = 0;

    //setear a 0 cotización
    this._costoDeVentas = 0;
    this._utilidad = 0;
    this.precioDeVentas = 0;
    this.precioDeVentasMasIVA = 0;
    this._comisionInmobiliaria = 0;

    this.calcularCostos();
    this.cotizar();
  }

  private calculoUtilidad(renta: number): number {
    let resultado: number;

    if (renta <= 350 / 0.05) {
      resultado = 0.0428826023 * renta + 2412;
    } else if (renta <= 8205.162) {
      resultado = -0.0128826023 * renta + 2762;
    } else if (renta <= 90000) {
      resultado = 0.3295 * renta;
    } else {
      resultado = 0.23308 * renta + 8684;
    }

    if (renta <= 350 / 0.05) {
      resultado += 350;
    } else if (renta <= 2000 / 0.05) {
      resultado += 0.05 * renta;
    } else {
      resultado += 2000;
    }

    return resultado - 821.86;
  }

  calcularCostos() {
    this.costoInvestigacion = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.investigacionRpp
    )
      ? this._factorInvestigacion * this.estadoGarantia
      : 0;
    this.costoSeguro = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.seguro
    )
      ? this._factorSeguro * this.renta
      : 0;
    this.costoFirma = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.firmaDeContrato
    )
      ? this._factorFirma * this.estadoFirma
      : 0;
    this.costoInvestigacionRg = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.investigacionRG
    )
      ? this._factorSolvencia * this._investigacionRg
      : 0;
    this.costoIncumplimiento = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.gestionExtrajudicial
    )
      ? this._factorIncumplimiento * this._perfilRiesgoIncumplimiento
      : 0;
    this.costoRecuperacion = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.recuperacionInmueble
    )
      ? this._factorRecuperacion * this._perfilRiesgoJuicioRecuperacion
      : 0;
    this.costoAdeudos = this.nivelCobertura?.coberturas.find(
      (cober) => cober === Coberturas.recuperacionDeAdeudos
    )
      ? this._factorAdeudos * this._perfilRiesgoJuicioAdeudos
      : 0;
  }

  cotizar(): number {
    this._costoDeVentas =
      this.costoInvestigacion +
      this.costoSeguro +
      this.costoFirma +
      this.costoInvestigacionRg +
      this.costoIncumplimiento +
      this.costoRecuperacion +
      this.costoAdeudos;

    this._utilidad = this.calculoUtilidad(this.renta);

    this.precioDeVentas =
      Math.floor((this._utilidad + this._costoDeVentas) * 100) / 100;
    this.precioDeVentasMasIVA =
      Math.floor(this.precioDeVentas * 1.16 * 100) / 100;
    this._comisionInmobiliaria =
      Math.floor(this.precioDeVentasMasIVA * 0.1 * 100) / 100;

    return this.precioDeVentasMasIVA;
  }

  cambiarRenta(renta: number): number {
    this.renta = renta;

    this.calcularCostos();

    return this.cotizar();
  }

  cambiarEstadoGarantia(estado: EstadoEnGarantia): number {
    this.estadoGarantia = estado;

    this.calcularCostos();

    return this.cotizar();
  }

  cambiarEstadoFirma(estado: EstadoFirma): number {
    this.estadoFirma = estado;

    this.calcularCostos();

    return this.cotizar();
  }

  cambiarNivel(nivel: NivelCobertura): number {
    this.nivelCobertura = this._niveles.find((niv) => niv.nombre === nivel)
      ? this._niveles.find((niv) => niv.nombre === nivel)
      : this._niveles[0];

    this.calcularCostos();

    return this.cotizar();
  }
}
