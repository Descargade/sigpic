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
  categoriaNombre?: string | null;
  dependenciaNombre?: string | null;
  responsableNombre?: string | null;
}

interface ActaEntregaPDFProps {
  bien: BienData;
  responsableAnterior?: string | null;
  institucion?: string;
  unidad?: string;
  firmante?: string;
  cargoFirmante?: string;
}

export function ActaEntregaPDF({ bien, responsableAnterior, institucion = 'Institución', unidad = 'Unidad', firmante = '________________________________', cargoFirmante = 'Cargo' }: ActaEntregaPDFProps) {
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

        <Text style={docStyles.docTitle}>Acta de Entrega / Recepción</Text>
        <Text style={docStyles.docSubtitle}>Transferencia de bien patrimonial entre funcionarios</Text>

        <View style={{ marginTop: 15, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, backgroundColor: '#f0f7ff' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e3a5f', marginBottom: 8 }}>DATOS DEL BIEN</Text>
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
            <Text style={docStyles.infoLabel}>Estado Físico:</Text>
            <Text style={docStyles.infoValue}>{bien.estadoFisico}</Text>
          </View>
          {bien.categoriaNombre && (
            <View style={docStyles.infoRow}>
              <Text style={docStyles.infoLabel}>Categoría:</Text>
              <Text style={docStyles.infoValue}>{bien.categoriaNombre}</Text>
            </View>
          )}
        </View>

        {responsableAnterior && (
          <View style={{ marginTop: 15, padding: 12, borderWidth: 1, borderColor: '#fef3c7', borderRadius: 4, backgroundColor: '#fffbeb' }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#92400e', marginBottom: 5 }}>ENTREGA DE:</Text>
            <Text style={{ fontSize: 10 }}>{responsableAnterior}</Text>
          </View>
        )}

        <View style={{ marginTop: 15, padding: 12, borderWidth: 1, borderColor: '#dcfce7', borderRadius: 4, backgroundColor: '#f0fdf4' }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#166534', marginBottom: 5 }}>RECIBE:</Text>
          <Text style={{ fontSize: 10 }}>{bien.responsableNombre || 'Sin asignar'}</Text>
          {bien.dependenciaNombre && (
            <Text style={{ fontSize: 9, color: '#666', marginTop: 3 }}>Dependencia: {bien.dependenciaNombre}</Text>
          )}
        </View>

        <View style={docStyles.observations}>
          <Text style={docStyles.observationsTitle}>OBSERVACIONES</Text>
          <Text style={docStyles.observationsText}>
            En esta fecha se procede a la entrega del bien detallado, el cual pasa a ser responsabilidad del funcionario que recibe. El mismo declara haber recibido el bien en las condiciones descritas.
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
          <Text>Acta de Entrega / Recepción</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
