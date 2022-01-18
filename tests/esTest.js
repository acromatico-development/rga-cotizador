import { Cotizador, EstadoEnGarantia, EstadoFirma, NivelCobertura } from "../dist/index.js";

const cotizacion = new Cotizador(20000, EstadoEnGarantia.CiudadDeMexico, EstadoFirma.CiudadDeMexico, NivelCobertura.alpha);

console.log(cotizacion.precioDeVentasMasIVA)