import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { docStyles } from './styles';

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
  firmante?: string;
  cargoFirmante?: string;
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

export function ActaResponsabilidadPDF({ responsable, bienes, institucion = 'Institución', unidad = 'Unidad', firmante = '________________________________', cargoFirmante = 'Cargo' }: ActaResponsabilidadPDFProps) {
  const fechaStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  const horaStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Document>
      <Page size="LETTER" style={docStyles.page}>
        <View style={docStyles.header}>
          <View style={docStyles.headerTop}>
            <View style={docStyles.headerLeft}>
              <Text style={docStyles.institutionName}>{institucion}</Text>
              <Text style={docStyles.systemName}>SIGPIC - Sistema Integral de Gestión Patrimonial</Text>
              <Text style={docStyles.unitName}>{unidad}</Text>
            </View>
            <View style={docStyles.headerRight}>
              <Text style={{ fontSize: 8, color: '#666' }}>Fecha:</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{fechaStr}</Text>
            </View>
          </View>
        </View>

        <Text style={docStyles.docTitle}>Acta de Responsabilidad</Text>
        <View style={docStyles.horizontalLine} />

        <Text style={docStyles.docSubtitle}>
          El/La suscribiente, {responsable.nombre}{responsable.cargo ? `, ${responsable.cargo}` : ''}{responsable.dependenciaNombre ? ` de la dependencia ${responsable.dependenciaNombre}` : ''}, declara tener a su cargo y responsabilidad los siguientes bienes patrimoniales, comprometiéndose a mantenerlos en las condiciones en que se encuentran, a utilizarlos exclusivamente para los fines propios de la institución y a comunicar cualquier novedad que afecte su integridad.
        </Text>

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
                <Text style={[docStyles.tableCellLast, { width: 50, textAlign: 'center' }]}>1</Text>
              </View>
            ))
          )}
        </View>

        <View style={docStyles.signatureSectionDual}>
          <View style={docStyles.signatureBlock}>
            <Text style={docStyles.signatureLabel}>ENTREGA</Text>
            <View style={docStyles.signatureLine}>
              <Text style={docStyles.signatureName}>{firmante}</Text>
              <Text style={docStyles.signatureRole}>{cargoFirmante}</Text>
            </View>
          </View>
          <View style={docStyles.signatureBlock}>
            <Text style={docStyles.signatureLabel}>RECIBE</Text>
            <View style={docStyles.signatureLine}>
              <Text style={docStyles.signatureName}>{responsable.nombre}</Text>
              <Text style={docStyles.signatureRole}>{responsable.cargo || responsable.dependenciaNombre || ''}</Text>
            </View>
          </View>
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Documento generado el {fechaStr}</Text>
          <Text>Acta de Responsabilidad</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
