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
          <View>
            <View style={docStyles.tableHeader}>
              {colHeaders.map((h, i) => (
                <React.Fragment key={i}>
                  <View style={{ width: colWidths[i] }}><Text style={docStyles.tableHeaderText}>{h}</Text></View>
                  {i < colHeaders.length - 1 && <View style={{ width: 1, backgroundColor: '#000' }} />}
                </React.Fragment>
              ))}
            </View>
            {bienes.length === 0 ? (
              <View style={docStyles.tableRow}>
                <Text style={docStyles.noData}>No hay bienes para mostrar</Text>
              </View>
            ) : (
              bienes.map((b, idx) => (
                <View key={b.id} style={[docStyles.tableRow, idx % 2 === 0 && docStyles.tableRowAlt]}>
                  <View style={{ width: colWidths[0] }}><Text style={docStyles.tableCell}>{b.codigoInterno || '-'}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[1] }}><Text style={docStyles.tableCell}>{b.numeroPatrimonial || '-'}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[2] }}><Text style={docStyles.tableCell}>{b.numeroSerie || '-'}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[3] }}><Text style={[docStyles.tableCellLeft, { fontFamily: 'Times-Bold' }]}>{b.nombre}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[4] }}><Text style={docStyles.tableCell}>{b.categoriaNombre || '-'}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[5] }}><Text style={docStyles.tableCell}>{b.marca || '-'}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[6] }}><Text style={docStyles.tableCell}>{b.modelo || '-'}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[7] }}><Text style={docStyles.tableCell}>{b.cantidad || 1}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[8] }}><Text style={docStyles.tableCell}>{b.estadoFisico}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[9] }}><Text style={docStyles.tableCell}>{b.estadoAdministrativo}</Text></View>
                  <View style={{ width: 1, backgroundColor: '#000' }} />
                  <View style={{ width: colWidths[10] }}><Text style={docStyles.tableCellLast}>{b.dependenciaNombre || '-'}</Text></View>
                </View>
              ))
            )}
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
