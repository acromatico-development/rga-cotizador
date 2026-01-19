import { Cotizador, EstadoEnGarantia, EstadoFirma, NivelCobertura } from "../dist/index.js";

const cotizacion = new Cotizador(10000, EstadoEnGarantia["Ciudad de México"], EstadoFirma["Ciudad de México"], NivelCobertura.alpha);

console.log(cotizacion.precioDeVentasMasIVA)