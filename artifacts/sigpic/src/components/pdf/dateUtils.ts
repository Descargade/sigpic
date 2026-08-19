const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CIENCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIUNO', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE', 'TREINTA', 'TREINTA Y UNO'];
const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

function unidad(n: number): string {
  return UNIDADES[n] || String(n);
}

function numeroEnLetras(n: number): string {
  if (n <= 31) return unidad(n);
  return String(n);
}

function anioEnLetras(n: number): string {
  if (n === 2026) return 'dos mil veintiséis';
  if (n === 2025) return 'dos mil veinticinco';
  if (n === 2024) return 'dos mil veinticuatro';
  if (n === 2027) return 'dos mil veintisiete';
  return String(n);
}

export function fechaEnLetras(fecha: Date): { dia: string; mes: string; anio: string; completa: string } {
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const anio = fecha.getFullYear();
  return {
    dia: numeroEnLetras(dia),
    mes: MESES[mes],
    anio: anioEnLetras(anio),
    completa: `${numeroEnLetras(dia)} días del mes de ${MESES[mes]} del año ${anioEnLetras(anio)}`,
  };
}

export function fechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
