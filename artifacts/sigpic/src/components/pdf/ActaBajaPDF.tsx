import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { docStyles } from './styles';

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
  firmante?: string;
  cargoFirmante?: string;
}

export function ActaBajaPDF({ bien, movimientos, institucion = 'Institución', unidad = 'Unidad', firmante = '________________________________', cargoFirmante = 'Cargo' }: ActaBajaPDFProps) {
  const fechaStr = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fechaAltaStr = bien.fechaAlta ? new Date(bien.fechaAlta).toLocaleDateString('es-AR') : 'N/A';

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

        <Text style={docStyles.docTitle}>Acta de Baja Patrimonial</Text>
        <Text style={docStyles.docSubtitle}>Registro de baja definitiva de bien del inventario</Text>

        <View style={{ marginTop: 15, padding: 12, borderWidth: 1, borderColor: '#fecaca', borderRadius: 4, backgroundColor: '#fef2f2' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#991b1b', marginBottom: 8 }}>DATOS DEL BIEN DADO DE BAJA</Text>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Nombre:</Text>
            <Text style={[docStyles.infoValue, { fontFamily: 'Helvetica-Bold' }]}>{bien.nombre}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Código Interno:</Text>
            <Text style={docStyles.infoValue}>{bien.codigoInterno || 'Sin código'}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Nº Patrimonial:</Text>
            <Text style={docStyles.infoValue}>{bien.numeroPatrimonial || 'N/A'}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Nº Serie:</Text>
            <Text style={docStyles.infoValue}>{bien.numeroSerie || 'N/A'}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Marca / Modelo:</Text>
            <Text style={docStyles.infoValue}>{bien.marca || '-'} {bien.modelo || ''}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Categoría:</Text>
            <Text style={docStyles.infoValue}>{bien.categoriaNombre || '-'}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Estado Físico Actual:</Text>
            <Text style={docStyles.infoValue}>{bien.estadoFisico}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Dependencia:</Text>
            <Text style={docStyles.infoValue}>{bien.dependenciaNombre || '-'}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Responsable:</Text>
            <Text style={docStyles.infoValue}>{bien.responsableNombre || '-'}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Fecha de Alta:</Text>
            <Text style={docStyles.infoValue}>{fechaAltaStr}</Text>
          </View>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Origen:</Text>
            <Text style={docStyles.infoValue}>{bien.origenBien || '-'}</Text>
          </View>
        </View>

        {movimientos.length > 0 && (
          <>
            <Text style={docStyles.sectionTitle}>Historial de Movimientos</Text>
            <View style={docStyles.table}>
              <View style={docStyles.tableHeader}>
                <Text style={[docStyles.tableHeaderText, { width: 80 }]}>Fecha</Text>
                <Text style={[docStyles.tableHeaderText, { width: 100 }]}>Tipo</Text>
                <Text style={[docStyles.tableHeaderText, { width: 200 }]}>Descripción</Text>
                <Text style={[docStyles.tableHeaderText, { width: 80 }]}>Usuario</Text>
              </View>
              {movimientos.map((m, idx) => (
                <View key={idx} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                  <Text style={[docStyles.tableCell, { width: 80 }]}>
                    {new Date(m.fecha).toLocaleDateString('es-AR')}
                  </Text>
                  <Text style={[docStyles.tableCell, { width: 100, fontFamily: 'Helvetica-Bold' }]}>{m.tipo}</Text>
                  <Text style={[docStyles.tableCell, { width: 200 }]}>{m.descripcion || '-'}</Text>
                  <Text style={[docStyles.tableCell, { width: 80 }]}>{m.usuario}</Text>
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

        <View style={docStyles.signatureSection}>
          <View style={docStyles.signatureLine}>
            <Text style={docStyles.signatureName}>{firmante}</Text>
            <Text style={docStyles.signatureRole}>{cargoFirmante}</Text>
          </View>
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Documento generado el {fechaStr}</Text>
          <Text>Acta de Baja Patrimonial</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
