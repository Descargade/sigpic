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
  categoriaNombre?: string | null;
  dependenciaNombre?: string | null;
  responsableNombre?: string | null;
  ubicacion?: string | null;
}

interface ActaEntregaPDFProps {
  bienes: BienData[];
  responsableAnterior?: string | null;
  institucion?: string;
  unidad?: string;
  entregaNombre?: string;
  entregaCargo?: string;
  recibeNombre?: string;
  recibeCargo?: string;
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
  return parts.join('\n');
}

export function ActaEntregaPDF({
  bienes, responsableAnterior,
  institucion = 'Institución', unidad = 'Unidad',
  entregaNombre = '________________________________', entregaCargo = 'Cargo',
  recibeNombre = '________________________________', recibeCargo = 'Cargo',
}: ActaEntregaPDFProps) {
  const ahora = new Date();
  const fecha = fechaEnLetras(ahora);

  const parrafo = bienes.length === 1
    ? `En la Ciudad Autónoma de Buenos Aires, asiento del ${institucion.toUpperCase()}, a los ${fecha.completa}, se labra la presente Acta a fin de dejar constancia de la entrega del siguiente bien patrimonial${responsableAnterior ? ` por parte de ${responsableAnterior}` : ''}, conforme al siguiente detalle:`
    : `En la Ciudad Autónoma de Buenos Aires, asiento del ${institucion.toUpperCase()}, a los ${fecha.completa}, se labra la presente Acta a fin de dejar constancia de la entrega de los siguientes ${bienes.length} bienes patrimoniales${responsableAnterior ? ` por parte de ${responsableAnterior}` : ''}, conforme al siguiente detalle:`;

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

        <Text style={docStyles.docTitle}>Acta de Entrega y Responsabilidad</Text>
        <View style={docStyles.horizontalLine} />

        <Text style={docStyles.docSubtitle}>{parrafo}</Text>

        <View style={docStyles.table}>
          <View fixed style={docStyles.tableHeader}>
            <View style={{ width: 25 }}><Text style={docStyles.tableHeaderText}>N°</Text></View>
            <View style={docStyles.columnSeparator} />
            <View style={{ width: 100 }}><Text style={docStyles.tableHeaderText}>UBICACION</Text></View>
            <View style={docStyles.columnSeparator} />
            <View style={{ flex: 1 }}><Text style={docStyles.tableHeaderText}>DESCRIPCION</Text></View>
            <View style={docStyles.columnSeparator} />
            <View style={{ width: 40 }}><Text style={docStyles.tableHeaderText}>CANT</Text></View>
          </View>
          {bienes.map((b, idx) => (
            <View key={b.id} wrap={false} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
              <View style={{ width: 25 }}><Text style={docStyles.tableCell}>{idx + 1}</Text></View>
              <View style={docStyles.columnSeparator} />
              <View style={{ width: 100 }}><Text style={docStyles.tableCellLeft}>{b.ubicacion || b.dependenciaNombre || '-'}</Text></View>
              <View style={docStyles.columnSeparator} />
              <View style={{ flex: 1 }}><Text style={docStyles.tableCellLeft}>{buildDescripcion(b)}</Text></View>
              <View style={docStyles.columnSeparator} />
              <View style={{ width: 40 }}><Text style={docStyles.tableCellLast}>1</Text></View>
            </View>
          ))}
        </View>

        <View style={docStyles.signatureSectionDual}>
          <View style={docStyles.signatureBlock}>
            <View style={docStyles.signatureLineAbove} />
            <Text style={docStyles.signatureLabel}>ENTREGUÉ CONFORME</Text>
            <Text style={docStyles.signatureName}>{entregaNombre}</Text>
            <Text style={docStyles.signatureRole}>{entregaCargo}</Text>
          </View>
          <View style={docStyles.signatureBlock}>
            <View style={docStyles.signatureLineAbove} />
            <Text style={docStyles.signatureLabel}>RECIBÍ CONFORME</Text>
            <Text style={docStyles.signatureName}>{recibeNombre}</Text>
            <Text style={docStyles.signatureRole}>{recibeCargo}</Text>
          </View>
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Documento generado el {fechaCorta(ahora)}</Text>
          <Text>Acta de Entrega y Responsabilidad</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
