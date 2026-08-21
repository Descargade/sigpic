import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { docStyles } from './styles';
import { fechaEnLetras, fechaCorta } from './dateUtils';

interface BienData {
  id: number;
  codigoInterno?: string | null;
  numeroPatrimonial?: string | null;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  estadoFisico: string;
  estadoAdministrativo: string;
  categoriaNombre?: string | null;
  dependenciaNombre?: string | null;
  responsableNombre?: string | null;
  responsableCargo?: string | null;
  origenBien?: string | null;
  observaciones?: string | null;
  fechaAlta: string;
}

interface MovimientoData {
  tipo: string;
  descripcion?: string | null;
  fecha: string;
  usuario: string;
}

interface ActaBajaPDFProps {
  bien: BienData;
  movimientos: MovimientoData[];
  institucion?: string;
  unidad?: string;
  firmanteNombre?: string;
  firmanteCargo?: string;
}

function buildDescripcion(b: BienData): string {
  const parts: string[] = [];
  if (b.codigoInterno) parts.push(`Código: ${b.codigoInterno}`);
  if (b.numeroPatrimonial) parts.push(`Patrimonial: ${b.numeroPatrimonial}`);
  parts.push(`Nombre: ${b.nombre}`);
  if (b.marca) parts.push(`Marca: ${b.marca}`);
  if (b.modelo) parts.push(`Modelo: ${b.modelo}`);
  if (b.numeroSerie) parts.push(`Serie: ${b.numeroSerie}`);
  if (b.categoriaNombre) parts.push(`Categoría: ${b.categoriaNombre}`);
  parts.push(`Estado: ${b.estadoFisico}`);
  if (b.dependenciaNombre) parts.push(`Dependencia: ${b.dependenciaNombre}`);
  if (b.responsableNombre) parts.push(`Responsable: ${b.responsableNombre}`);
  return parts.join('\n');
}

export function ActaBajaPDF({
  bien, movimientos,
  institucion = 'Institución', unidad = 'Unidad',
  firmanteNombre = '________________________________', firmanteCargo = 'Cargo',
}: ActaBajaPDFProps) {
  const ahora = new Date();
  const fecha = fechaEnLetras(ahora);
  const fechaAltaStr = bien.fechaAlta ? fechaCorta(new Date(bien.fechaAlta)) : 'N/A';

  const parrafo = `En la Ciudad Autónoma de Buenos Aires, asiento del ${institucion.toUpperCase()}, a los ${fecha.completa}, se labra la presente Acta a fin de dejar constancia de la baja definitiva del siguiente bien patrimonial, dado de alta el ${fechaAltaStr}${bien.origenBien ? `, de origen ${bien.origenBien}` : ''}, por encontrarse en estado que no permite su uso o reparación, conforme al siguiente detalle:`;

  return (
    <Document>
      <Page size="LETTER" style={docStyles.page}>
        <View style={docStyles.header}>
          <View style={docStyles.headerTop}>
            <View style={docStyles.headerLeft}>
              <Text style={docStyles.institutionName}>EJERCITO ARGENTINO</Text>
              <Text style={docStyles.institutionSiglas}>ISMDDC</Text>
              <Text style={docStyles.systemName}>SIGPIC - Sistema Integral de Gestión Patrimonial</Text>
              <Text style={docStyles.unitName}>{unidad}</Text>
            </View>
            <View style={docStyles.headerRight}>
              <Text style={{ fontSize: 8, color: '#000' }}>Fecha de emisión:</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Times-Bold' }}>{fechaCorta(ahora)}</Text>
            </View>
          </View>
        </View>

        <Text style={docStyles.docTitle}>Acta de Baja Patrimonial</Text>
        <View style={docStyles.horizontalLine} />

        <Text style={docStyles.docSubtitle}>{parrafo}</Text>

        <View style={docStyles.table}>
          <View fixed style={docStyles.tableHeader}>
            <View style={{ width: 30, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableHeaderText}>#</Text></View>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableHeaderText}>DESCRIPCION</Text></View>
            <View style={{ width: 50 }}><Text style={docStyles.tableHeaderText}>CANT.</Text></View>
          </View>
          <View wrap={false} style={[docStyles.tableRow, docStyles.tableRowAlt]}>
            <View style={{ width: 30, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableCell}>1</Text></View>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableCellLeft}>{buildDescripcion(bien)}</Text></View>
            <View style={{ width: 50 }}><Text style={docStyles.tableCellLast}>1</Text></View>
          </View>
        </View>

        {movimientos.length > 0 && (
          <>
            <Text style={docStyles.sectionTitle}>Historial de Movimientos</Text>
            <View style={docStyles.table}>
              <View fixed style={docStyles.tableHeader}>
                <View style={{ width: 70, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableHeaderText}>Fecha</Text></View>
                <View style={{ width: 90, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableHeaderText}>Tipo</Text></View>
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableHeaderText}>Descripción</Text></View>
                <View style={{ width: 80 }}><Text style={docStyles.tableHeaderText}>Usuario</Text></View>
              </View>
              {movimientos.map((m, idx) => (
                <View key={idx} wrap={false} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                  <View style={{ width: 70, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableCell}>{new Date(m.fecha).toLocaleDateString('es-AR')}</Text></View>
                  <View style={{ width: 90, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={[docStyles.tableCell, { fontFamily: 'Times-Bold' }]}>{m.tipo}</Text></View>
                  <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000' }}><Text style={docStyles.tableCellLeft}>{m.descripcion || '-'}</Text></View>
                  <View style={{ width: 80 }}><Text style={docStyles.tableCellLast}>{m.usuario}</Text></View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={docStyles.observations}>
          <Text style={docStyles.observationsTitle}>MOTIVO DE LA BAJA</Text>
          <Text style={docStyles.observationsText}>
            {bien.observaciones || 'El bien es dado de baja por encontrarse en estado que no permite su uso o reparación, de acuerdo con las disposiciones institucionales vigentes.'}
          </Text>
        </View>

        <View style={docStyles.signatureSectionDual}>
          <View style={docStyles.signatureBlock}>
            <View style={docStyles.signatureLineAbove} />
            <Text style={docStyles.signatureName}>{bien.responsableNombre || '________________________________'}</Text>
            <Text style={docStyles.signatureRole}>{bien.responsableCargo || bien.dependenciaNombre || ''}</Text>
          </View>
          <View style={docStyles.signatureBlock}>
            <View style={docStyles.signatureLineAbove} />
            <Text style={docStyles.signatureName}>{firmanteNombre}</Text>
            <Text style={docStyles.signatureRole}>{firmanteCargo}</Text>
          </View>
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Documento generado el {fechaCorta(ahora)}</Text>
          <Text>Acta de Baja Patrimonial</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
