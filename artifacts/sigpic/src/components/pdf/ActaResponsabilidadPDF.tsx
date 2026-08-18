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

export function ActaResponsabilidadPDF({ responsable, bienes, institucion = 'Institución', unidad = 'Unidad', firmante = '________________________________', cargoFirmante = 'Cargo' }: ActaResponsabilidadPDFProps) {
  const fechaStr = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

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
        <Text style={docStyles.docSubtitle}>Asignación de bienes patrimoniales a funcionario</Text>

        <View style={{ marginTop: 15, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, backgroundColor: '#f0f7ff' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e3a5f', marginBottom: 8 }}>DATOS DEL RESPONSABLE</Text>
          <View style={docStyles.infoRow}>
            <Text style={docStyles.infoLabel}>Nombre completo:</Text>
            <Text style={[docStyles.infoValue, { fontFamily: 'Helvetica-Bold' }]}>{responsable.nombre}</Text>
          </View>
          {responsable.cargo && (
            <View style={docStyles.infoRow}>
              <Text style={docStyles.infoLabel}>Cargo:</Text>
              <Text style={docStyles.infoValue}>{responsable.cargo}</Text>
            </View>
          )}
          {responsable.jerarquia && (
            <View style={docStyles.infoRow}>
              <Text style={docStyles.infoLabel}>Jerarquía:</Text>
              <Text style={docStyles.infoValue}>{responsable.jerarquia}</Text>
            </View>
          )}
          {responsable.dependenciaNombre && (
            <View style={docStyles.infoRow}>
              <Text style={docStyles.infoLabel}>Dependencia:</Text>
              <Text style={docStyles.infoValue}>{responsable.dependenciaNombre}</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={docStyles.sectionTitle}>Bienes Asignados</Text>
          <Text style={docStyles.countBadge}>Total: {bienes.length}</Text>
        </View>

        <View style={docStyles.table}>
          <View style={docStyles.tableHeader}>
            <Text style={[docStyles.tableHeaderText, { width: 30 }]}>Nº</Text>
            <Text style={[docStyles.tableHeaderText, { width: 70 }]}>Código</Text>
            <Text style={[docStyles.tableHeaderText, { width: 70 }]}>Nº Patrim.</Text>
            <Text style={[docStyles.tableHeaderText, { width: 140 }]}>Nombre</Text>
            <Text style={[docStyles.tableHeaderText, { width: 70 }]}>Marca</Text>
            <Text style={[docStyles.tableHeaderText, { width: 70 }]}>Modelo</Text>
            <Text style={[docStyles.tableHeaderText, { width: 70 }]}>Serie</Text>
            <Text style={[docStyles.tableHeaderText, { width: 60 }]}>Estado</Text>
          </View>
          {bienes.length === 0 ? (
            <Text style={docStyles.noData}>No hay bienes asignados a este responsable</Text>
          ) : (
            bienes.map((b, idx) => (
              <View key={b.id} style={idx % 2 === 0 ? [docStyles.tableRow, docStyles.tableRowAlt] : docStyles.tableRow}>
                <Text style={[docStyles.tableCell, { width: 30 }]}>{idx + 1}</Text>
                <Text style={[docStyles.tableCell, { width: 70 }]}>{b.codigoInterno || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: 70 }]}>{b.numeroPatrimonial || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: 140, fontFamily: 'Helvetica-Bold' }]}>{b.nombre}</Text>
                <Text style={[docStyles.tableCell, { width: 70 }]}>{b.marca || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: 70 }]}>{b.modelo || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: 70 }]}>{b.numeroSerie || '-'}</Text>
                <Text style={[docStyles.tableCell, { width: 60 }]}>{b.estadoFisico}</Text>
              </View>
            ))
          )}
        </View>

        <View style={docStyles.observations}>
          <Text style={docStyles.observationsTitle}>OBSERVACIONES</Text>
          <Text style={docStyles.observationsText}>
            El/La suscribiente declara haber recibido en perfecto estado de conservación y funcionamiento los bienes detallados en el presente acta, comprometiéndose a mantenerlos en las condiciones en que se encuentran, a utilizarlos exclusivamente para los fines propios de la institución y a comunicar cualquier novedad que afecte su integridad.
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
          <Text>Acta de Responsabilidad</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
