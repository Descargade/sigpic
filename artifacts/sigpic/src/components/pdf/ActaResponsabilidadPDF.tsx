import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { docStyles } from './styles';
import { fechaEnLetras, fechaCorta } from './dateUtils';

interface ResponsableData {
  nombre: string;
  cargo?: string | null;
  jerarquia?: string | null;
  dependenciaNombre?: string | null;
}

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
}

interface ActaResponsabilidadPDFProps {
  responsable: ResponsableData;
  bienes: BienData[];
  institucion?: string;
  unidad?: string;
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

export function ActaResponsabilidadPDF({
  responsable, bienes,
  institucion = 'Institución', unidad = 'Unidad',
}: ActaResponsabilidadPDFProps) {
  const ahora = new Date();
  const fecha = fechaEnLetras(ahora);

  const cargoDesc = responsable.cargo ? `, ${responsable.cargo}` : '';
  const depDesc = responsable.dependenciaNombre ? ` de la dependencia ${responsable.dependenciaNombre}` : '';
  const parrafo = `En la Ciudad Autónoma de Buenos Aires, asiento del ${institucion.toUpperCase()}, a los ${fecha.completa}, se labra la presente Acta a fin de dejar constancia de la asignación de los siguientes bienes patrimoniales por parte de ${responsable.nombre}${cargoDesc}${depDesc}, conforme al siguiente detalle:`;

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

        <Text style={docStyles.docTitle}>Acta de Responsabilidad</Text>
        <View style={docStyles.horizontalLine} />

        <Text style={docStyles.docSubtitle}>{parrafo}</Text>

        <View style={docStyles.table}>
          <View style={docStyles.tableHeader}>
            <Text style={[docStyles.tableHeaderText, { width: 30, borderRightWidth: 1, borderRightColor: '#000' }]}>#</Text>
            <Text style={[docStyles.tableHeaderText, { flex: 1, borderRightWidth: 1, borderRightColor: '#000' }]}>DESCRIPCION</Text>
            <Text style={[docStyles.tableHeaderText, { width: 50 }]}>CANT.</Text>
          </View>
          {bienes.length === 0 ? (
            <View style={docStyles.tableRow}>
              <Text style={docStyles.noData}>No hay bienes asignados a este responsable</Text>
            </View>
          ) : (
            bienes.map((b, idx) => (
              <View key={b.id} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                <Text style={[docStyles.tableCell, { width: 30, borderRightWidth: 1, borderRightColor: '#000' }]}>{idx + 1}</Text>
                <Text style={[docStyles.tableCell, { flex: 1, borderRightWidth: 1, borderRightColor: '#000' }]}>
                  {buildDescripcion(b)}
                </Text>
                <Text style={[docStyles.tableCellLast, { width: 50 }]}>1</Text>
              </View>
            ))
          )}
        </View>

        <View style={docStyles.signatureSection}>
          <View style={docStyles.signatureLineAbove} />
          <Text style={[docStyles.signatureName, { marginTop: 5 }]}>{responsable.nombre}</Text>
          <Text style={docStyles.signatureRole}>{responsable.cargo || responsable.dependenciaNombre || ''}</Text>
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Documento generado el {fechaCorta(ahora)}</Text>
          <Text>Acta de Responsabilidad</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
