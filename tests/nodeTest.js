const cliente = require("../dist/cjs/index");
variableEstadoCepomex = "Ciudad de México";
variableEstadoFirma = "Baja California Sur";
variableEstadoGarantia = "Coahuila de Zaragoza";

(async function testCepomex() {
  const cotizacion = new cliente.Cotizador(
    15900,
    "45850",
    cliente.EstadoFirma[variableEstadoCepomex],
    cliente.NivelCobertura.alpha
  );
  
  await cotizacion.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:10 ~ cotizacion:",
    cotizacion.precioDeVentasMasIVA
  );
  console.log(
    "🚀 ~ file: nodeTest.js:10 ~ cotizacionSinIva:",
    cotizacion.precioDeVentas
  );
  
  const cotizacionSinFiador = new cliente.Cotizador(
    15900,
    "45850",
    cliente.EstadoFirma[variableEstadoFirma],
    cliente.NivelCobertura.alpha
  );
  
  await cotizacionSinFiador.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:17 ~ cotizacionSinFiadorEstadoFirmaBaja:",
    cotizacionSinFiador.precioDeVentasMasIVA
  );
  
  const cotizacionObligado = new cliente.Cotizador(
    15900,
    "45850",
    cliente.EstadoFirma[variableEstadoCepomex],
    cliente.NivelCobertura.alpha
  );
  
  await cotizacionObligado.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:25 ~ cotizacionObligado:",
    cotizacionObligado.precioDeVentasMasIVA
  );
  
  const cotizacionGarantiaSinFirma = new cliente.Cotizador(
    15900,
    "45850",
    cliente.EstadoFirma[variableEstadoCepomex],
    cliente.NivelCobertura.alpha
  );
  
  await cotizacionGarantiaSinFirma.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:41 ~ cotizacionGarantiaSinFirma:",
    cotizacionGarantiaSinFirma.precioDeVentasMasIVA
  );
  
  const cotizacionGarantia = new cliente.Cotizador(
    15900,
    "03100",
    cliente.EstadoFirma[variableEstadoFirma],
    cliente.NivelCobertura.alpha
  );
  
  await cotizacionGarantia.resolved;
  console.log(
    "🚀 ~ file: nodeTest.js:33 ~ cotizacionGarantiaConFiadorConFirma:",
    cotizacionGarantia.precioDeVentasMasIVA
  );
  
  const cotizacionGarantiaSinFiadorSinFirma = new cliente.Cotizador(
    15900,
    "03920",
    cliente.EstadoFirma[variableEstadoCepomex],
    cliente.NivelCobertura.alpha
  );
  
  await cotizacionGarantiaSinFiadorSinFirma.resolved;
  console.log(
    "🚀 ~ file: nodeTest.js:41 ~ cotizacionGarantiaSinFiadorSinFirma:",
    cotizacionGarantiaSinFiadorSinFirma.precioDeVentasMasIVA
  );
})();
