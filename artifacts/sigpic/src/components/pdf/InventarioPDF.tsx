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

function colPositions(): number[] {
  const positions: number[] = [];
  let acc = 4;
  for (let i = 0; i < colWidths.length - 1; i++) {
    acc += colWidths[i];
    positions.push(acc);
  }
  return positions;
}

export function InventarioPDF({ titulo, subtitulo, bienes, filtros, institucion = 'Institución', unidad = 'Unidad' }: InventarioPDFProps) {
  const ahora = new Date();
  const lines = colPositions();

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
              <Text style={{ fontSize: 8, color: '#000' }}>Fecha de emisión:</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Times-Bold' }}>{fechaCorta(ahora)}</Text>
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
                <Text style={{ fontSize: 8, color: '#000' }}>{key}: </Text>
                <Text style={{ fontSize: 8, fontFamily: 'Times-Bold' }}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Text style={docStyles.countBadge}>Total: {bienes.length} bien(es)</Text>
        </View>

        <View style={docStyles.table}>
          <View style={{ position: 'relative' }}>
            <View style={docStyles.tableHeader}>
              {colHeaders.map((h, i) => (
                <Text key={i} style={[docStyles.tableHeaderText, { width: colWidths[i] }]}>{h}</Text>
              ))}
            </View>
            {bienes.length === 0 ? (
              <View style={docStyles.tableRow}>
                <Text style={docStyles.noData}>No hay bienes para mostrar</Text>
              </View>
            ) : (
              bienes.map((b, idx) => (
                <View key={b.id} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                  <Text style={[docStyles.tableCell, { width: colWidths[0] }]}>{b.codigoInterno || '-'}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[1] }]}>{b.numeroPatrimonial || '-'}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[2] }]}>{b.numeroSerie || '-'}</Text>
                  <Text style={[docStyles.tableCellLeft, { width: colWidths[3], fontFamily: 'Times-Bold' }]}>{b.nombre}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[4] }]}>{b.categoriaNombre || '-'}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[5] }]}>{b.marca || '-'}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[6] }]}>{b.modelo || '-'}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[7] }]}>{b.cantidad || 1}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[8] }]}>{b.estadoFisico}</Text>
                  <Text style={[docStyles.tableCell, { width: colWidths[9] }]}>{b.estadoAdministrativo}</Text>
                  <Text style={[docStyles.tableCellLast, { width: colWidths[10] }]}>{b.dependenciaNombre || '-'}</Text>
                </View>
              ))
            )}
            {lines.map((x, i) => (
              <View key={i} style={{ position: 'absolute', left: x, top: 0, bottom: 0, width: 1, backgroundColor: '#000' }} />
            ))}
          </View>
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
