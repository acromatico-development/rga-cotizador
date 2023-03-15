const cliente = require("../dist/cjs/index");
variableEstadoCepomex = "Ciudad de México";

const cotizacion = new cliente.Cotizador(
  15900,
  cliente.EstadoEnGarantia[variableEstadoCepomex],
  cliente.EstadoFirma[variableEstadoCepomex],
  cliente.NivelCobertura.alpha
);

console.log(cotizacion.precioDeVentasMasIVA);
console.log(cotizacion.precioDeVentas);
