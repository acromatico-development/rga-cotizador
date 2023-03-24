const cliente = require("../dist/cjs/index");
variableEstadoCepomex = "Ciudad de México";
variableEstadoFirma = "Baja California Sur";
variableEstadoGarantia = "Coahuila de Zaragoza";

const cotizacion = new cliente.Cotizador(
  15900,
  cliente.EstadoEnGarantia[variableEstadoCepomex],
  cliente.EstadoFirma[variableEstadoCepomex],
  cliente.NivelCobertura.alpha
);
console.log("🚀 ~ file: nodeTest.js:10 ~ cotizacion:", cotizacion.precioDeVentasMasIVA)
console.log("🚀 ~ file: nodeTest.js:10 ~ cotizacionSinIva:", cotizacion.precioDeVentas);

const cotizacionSinFiador = new cliente.Cotizador(
  15900,
  undefined,
  cliente.EstadoFirma[variableEstadoFirma],
  cliente.NivelCobertura.alpha
);
console.log("🚀 ~ file: nodeTest.js:17 ~ cotizacionSinFiadorEstadoFirmaBaja:", cotizacionSinFiador.precioDeVentasMasIVA)

const cotizacionObligado = new cliente.Cotizador(
  15900,
  undefined,
  cliente.EstadoFirma[variableEstadoCepomex],
  cliente.NivelCobertura.alpha
);
console.log("🚀 ~ file: nodeTest.js:25 ~ cotizacionObligado:", cotizacionObligado.precioDeVentasMasIVA)

const cotizacionGarantiaSinFirma = new cliente.Cotizador(
  15900,
  cliente.EstadoEnGarantia[variableEstadoGarantia],
  undefined,
  cliente.NivelCobertura.alpha
);
console.log("🚀 ~ file: nodeTest.js:41 ~ cotizacionGarantiaSinFirma:", cotizacionGarantiaSinFirma.precioDeVentasMasIVA)

const cotizacionGarantia = new cliente.Cotizador(
  15900,
  cliente.EstadoEnGarantia[variableEstadoGarantia],
  cliente.EstadoFirma[variableEstadoFirma],
  cliente.NivelCobertura.alpha
);
console.log("🚀 ~ file: nodeTest.js:33 ~ cotizacionGarantiaConFiadorConFirma:", cotizacionGarantia.precioDeVentasMasIVA)


const cotizacionGarantiaSinFiadorSinFirma = new cliente.Cotizador(
  15900,
  undefined,
  undefined,
  cliente.NivelCobertura.alpha
);
console.log("🚀 ~ file: nodeTest.js:41 ~ cotizacionGarantiaSinFiadorSinFirma:", cotizacionGarantiaSinFiadorSinFirma.precioDeVentasMasIVA)


