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
  dependenciaNombre?: string | null;
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
          <View fixed style={docStyles.tableHeader}>
            <View style={{ width: 25 }}><Text style={docStyles.tableHeaderText}>N°</Text></View>
            <View style={{ width: 1, backgroundColor: '#000' }} />
            <View style={{ width: 100 }}><Text style={docStyles.tableHeaderText}>UBICACION</Text></View>
            <View style={{ width: 1, backgroundColor: '#000' }} />
            <View style={{ flex: 1 }}><Text style={docStyles.tableHeaderText}>DESCRIPCION</Text></View>
            <View style={{ width: 1, backgroundColor: '#000' }} />
            <View style={{ width: 40 }}><Text style={docStyles.tableHeaderText}>CANT</Text></View>
          </View>
          {bienes.length === 0 ? (
            <View style={docStyles.tableRow}>
              <Text style={docStyles.noData}>No hay bienes asignados a este responsable</Text>
            </View>
          ) : (
            bienes.map((b, idx) => (
              <View key={b.id} wrap={false} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                <View style={{ width: 25 }}><Text style={docStyles.tableCell}>{idx + 1}</Text></View>
                <View style={{ width: 1, backgroundColor: '#000' }} />
                <View style={{ width: 100 }}><Text style={docStyles.tableCellLeft}>{b.dependenciaNombre || '-'}</Text></View>
                <View style={{ width: 1, backgroundColor: '#000' }} />
                <View style={{ flex: 1 }}><Text style={docStyles.tableCellLeft}>{buildDescripcion(b)}</Text></View>
                <View style={{ width: 1, backgroundColor: '#000' }} />
                <View style={{ width: 40 }}><Text style={docStyles.tableCellLast}>1</Text></View>
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
