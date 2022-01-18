const cliente = require("../dist/cjs/index");

const cotizacion = new cliente.Cotizador(
  20000,
  cliente.EstadoEnGarantia.CiudadDeMexico,
  cliente.EstadoFirma.CiudadDeMexico,
  cliente.NivelCobertura.alpha
);

console.log(cotizacion.precioDeVentasMasIVA);
