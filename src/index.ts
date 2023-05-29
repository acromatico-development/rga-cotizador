// import axios from "axios";

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
  "Zacatecas" = 575,
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
  "Zacatecas" = 5000,
}

export enum NivelCobertura {
  lite = "Lite",
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

type CpData = {
  ciudad: string;
  estado: string;
  municipio: string;
  colonias: [string];
  codigoPostal: string;
};

// TO DO: Bu
const permitedCities = [
  "Cancún",
  "Ciudad de México",
  "Cuernavaca",
  "Guadalajara",
  "Zapopan",
  "Tonalá",
  "Tlajomulco de Zúñiga",
  "El Salto",
  "Ixtlahuacán de los Membrillos",
  "Juanacatlán",
  "Zapotlanejo",
  "Acatlán de Juárez",
  "Tlaquepaque",
  "Mérida",
  "Monterrey",
  "San Nicolás de los Garza",
  "Ciudad Apodaca",
  "García",
  "Ciudad General Escobedo",
  "Guadalupe",
  "Ciudad Santa Catarina",
  "San Pedro Garza García",
  "Pachuca de Soto",
  "Heroica Puebla de Zaragoza",
  "Santiago de Querétaro",
];

export class Cotizador {
  //Variables
  renta: number;
  cp: string;
  estadoGarantia: EstadoEnGarantia;
  estadoFirma: EstadoFirma;
  nivelCobertura: Nivel | undefined;
  resolved: Promise<void>;
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
    cp: string,
    estadoFirma: EstadoFirma,
    nivelCobertura: NivelCobertura
  ) {
    this.renta = renta;

    this.resolved = new Promise<void>(async (resolve) => {
      const cpData: CpData = await this.getCpData(cp);

      console.log("cp", cpData);

      const permitido = permitedCities.find((city) => city === cpData.ciudad);

      if (!permitido) {
        const edomex = cpData.estado === "México";
        if (!edomex) {
          console.log("No se encontró la ciudad");
          throw new Error("No se encontró la ciudad");
        }
      }

      this.estadoGarantia = EstadoEnGarantia[cpData.estado]
        ? EstadoEnGarantia[cpData.estado]
        : EstadoEnGarantia["Ciudad de México"];

      this.estadoFirma = estadoFirma
        ? estadoFirma
        : EstadoFirma["Ciudad de México"];

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
        {
          nombre: NivelCobertura.lite,
          coberturas: [
            Coberturas.investigacionRG,
            Coberturas.gestionExtrajudicial,
            Coberturas.recuperacionInmueble,
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

      console.log("Terminando");
      resolve();
    });
  }

  private async getCpData(cp: string) {
    const ciudad = await fetch(
      `https://acromatico-cp.uc.r.appspot.com/api/cp/${cp}`,
      {
        headers: {
          "X-Acromatico-JWT-Token":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2wiOiJBZG1pbiIsImlkIjoiMTIzNDU2In0.lU5p4VREH8qVitzPaNmteGGmtpJA8PwiSNrHkhhJC1o",
        },
      }
    );

    const ciudadData = await ciudad.json();

    return ciudadData;
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

    resultado = resultado - 821.86;

    return resultado;
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

    let precioVentasTemp = this._utilidad + this._costoDeVentas;

    // Minimo de precio de venta ed de $3500 ya con IVA
    if (precioVentasTemp * 1.16 < 3500) {
      precioVentasTemp = 3500 / 1.16;
    }

    this.precioDeVentas = Math.floor(precioVentasTemp * 100) / 100;
    this.precioDeVentasMasIVA =
      Math.floor(this.precioDeVentas * 1.16 * 100) / 100;
    this.precioDeVentasMasIVA = Math.ceil(this.precioDeVentasMasIVA / 10) * 10;
    this.precioDeVentas =
      Math.floor((this.precioDeVentasMasIVA / 1.16) * 100) / 100;
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
