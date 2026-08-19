import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { docStyles } from './styles';
import { fechaCorta } from './dateUtils';

interface BienData {
  id: number;
  codigoInterno?: string | null;
  numeroPatrimonial?: string | null;
  numeroSerie?: string | null;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  estadoFisico: string;
  estadoAdministrativo: string;
  categoriaNombre?: string | null;
  dependenciaNombre?: string | null;
  responsableNombre?: string | null;
  origenBien?: string | null;
  fechaAlta: string;
  cantidad?: number;
  cantidadComponentes?: number;
}

interface InventarioPDFProps {
  titulo: string;
  subtitulo?: string;
  bienes: BienData[];
  filtros?: Record<string, string>;
  institucion?: string;
  unidad?: string;
}

const colWidths = [50, 50, 45, 95, 60, 50, 50, 35, 60, 60, 65];
const colHeaders = ['Código', 'Nº Patrim.', 'Nº Serie', 'Nombre', 'Categoría', 'Marca', 'Modelo', 'Cant.', 'Estado Fís.', 'Estado Admin.', 'Dependencia'];

export function InventarioPDF({ titulo, subtitulo, bienes, filtros, institucion = 'Institución', unidad = 'Unidad' }: InventarioPDFProps) {
  const ahora = new Date();

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={docStyles.page}>
        <View style={docStyles.header}>
          <View style={docStyles.headerTop}>
            <View style={docStyles.headerLeft}>
              <Text style={docStyles.institutionName}>EJERCITO ARGENTINO</Text>
              <Text style={docStyles.institutionSiglas}>ISMDDC</Text>
              <Text style={docStyles.systemName}>SIGPIC - Sistema Integral de Gestión Patrimonial</Text>
              <Text style={docStyles.unitName}>{unidad}</Text>
            </View>
            <View style={docStyles.headerRight}>
              <Text style={{ fontSize: 8, color: '#666' }}>Fecha de emisión:</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{fechaCorta(ahora)}</Text>
            </View>
          </View>
        </View>

        <Text style={docStyles.docTitle}>{titulo}</Text>
        <View style={docStyles.horizontalLine} />
        {subtitulo && <Text style={docStyles.docSubtitle}>{subtitulo}</Text>}

        {filtros && Object.keys(filtros).length > 0 && (
          <View style={{ marginBottom: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(filtros).map(([key, value]) => (
              <View key={key} style={{ flexDirection: 'row', marginRight: 15 }}>
                <Text style={{ fontSize: 8, color: '#666' }}>{key}: </Text>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Text style={docStyles.countBadge}>Total: {bienes.length} bien(es)</Text>
        </View>

        <View style={docStyles.table}>
          <View style={docStyles.tableHeader}>
            {colHeaders.map((h, i) => (
              <Text key={i} style={[docStyles.tableHeaderText, { width: colWidths[i], borderRightWidth: i < colHeaders.length - 1 ? 1 : 0, borderRightColor: '#000' }]}>{h}</Text>
            ))}
          </View>
          {bienes.length === 0 ? (
            <View style={docStyles.tableRow}>
              <Text style={docStyles.noData}>No hay bienes para mostrar</Text>
            </View>
          ) : (
            bienes.map((b, idx) => (
              <View key={b.id} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                <Text style={[docStyles.tableCell, { width: colWidths[0], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.codigoInterno || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[1], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.numeroPatrimonial || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[2], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.numeroSerie || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[3], borderRightWidth: 1, borderRightColor: '#000', fontFamily: 'Helvetica-Bold' }]}>{b.nombre}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[4], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.categoriaNombre || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[5], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.marca || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[6], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.modelo || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[7], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.cantidad || 1}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[8], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.estadoFisico}</Text>
                <Text style={[docStyles.tableCell, { width: colWidths[9], borderRightWidth: 1, borderRightColor: '#000' }]}>{b.estadoAdministrativo}</Text>
                <Text style={[docStyles.tableCellLast, { width: colWidths[10] }]}>{b.dependenciaNombre || '-'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Generado el {fechaCorta(ahora)}</Text>
          <Text>Página 1</Text>
          <Text>Total: {bienes.length} bien(es)</Text>
        </View>
      </Page>
    </Document>
  );
}
