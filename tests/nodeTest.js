const cliente = require("../dist/cjs/index");
variableEstadoCepomex = "Ciudad de México";

const cotizacion = new cliente.Cotizador(
  3000,
  cliente.EstadoEnGarantia[variableEstadoCepomex],
  cliente.EstadoFirma[variableEstadoCepomex],
  cliente.NivelCobertura.alpha
);

console.log(cotizacion.precioDeVentasMasIVA);
