const cliente = require("../dist/cjs/index");
const variableEstadoCepomex = "Ciudad de México";
const variableEstadoFirma = "Baja California Sur";
const variableEstadoGarantia = "Coahuila de Zaragoza";

const renta = 10000;
const cobertura = cliente.NivelCobertura.lite;

(async function testCepomex() {
  const cotizacion = new cliente.Cotizador(
    renta,
    "56600",
    cliente.EstadoEnGarantia[variableEstadoGarantia],
    cobertura
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
    renta,
    "56600",
    cliente.EstadoFirma[variableEstadoFirma],
    cobertura
  );
  
  await cotizacionSinFiador.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:17 ~ cotizacionSinFiadorEstadoFirmaBaja:",
    cotizacionSinFiador.precioDeVentasMasIVA
  );
  
  const cotizacionObligado = new cliente.Cotizador(
    renta,
    "56600",
    cliente.EstadoFirma[variableEstadoCepomex],
    cobertura
  );
  
  await cotizacionObligado.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:25 ~ cotizacionObligado:",
    cotizacionObligado.precioDeVentasMasIVA
  );
  
  const cotizacionGarantiaSinFirma = new cliente.Cotizador(
    renta,
    "56600",
    cliente.EstadoFirma[variableEstadoCepomex],
    cobertura
  );
  
  await cotizacionGarantiaSinFirma.resolved;
  
  console.log(
    "🚀 ~ file: nodeTest.js:41 ~ cotizacionGarantiaSinFirma:",
    cotizacionGarantiaSinFirma.precioDeVentasMasIVA
  );
  
  const cotizacionGarantia = new cliente.Cotizador(
    renta,
    "56600",
    cliente.EstadoFirma[variableEstadoFirma],
    cobertura
  );
  
  await cotizacionGarantia.resolved;
  console.log(
    "🚀 ~ file: nodeTest.js:33 ~ cotizacionGarantiaConFiadorConFirma:",
    cotizacionGarantia.precioDeVentasMasIVA
  );
  
  const cotizacionGarantiaSinFiadorSinFirma = new cliente.Cotizador(
    renta,
    "56600",
    cliente.EstadoFirma[variableEstadoCepomex],
    cobertura
  );
  
  await cotizacionGarantiaSinFiadorSinFirma.resolved;
  console.log(
    "🚀 ~ file: nodeTest.js:41 ~ cotizacionGarantiaSinFiadorSinFirma:",
    cotizacionGarantiaSinFiadorSinFirma.precioDeVentasMasIVA
  );
})();
