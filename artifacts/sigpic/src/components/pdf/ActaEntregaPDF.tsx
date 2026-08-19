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

export function ActaEntregaPDF({ bien, responsableAnterior, institucion = 'Institución', unidad = 'Unidad', firmante = '________________________________', cargoFirmante = 'Cargo' }: ActaEntregaPDFProps) {
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

        <Text style={docStyles.docTitle}>Acta de Entrega y Responsabilidad</Text>
        <View style={docStyles.horizontalLine} />

        <Text style={docStyles.docSubtitle}>
          En la ciudad de, día {fechaStr}, a las {horaStr} horas, se hace entrega del siguiente bien patrimonial{responsableAnterior ? ` por parte de ${responsableAnterior}` : ''}, el cual pasa a ser responsabilidad del funcionario que recibe. El mismo declara haber recibido el bien en las condiciones descritas en el presente acta.
        </Text>

        <View style={docStyles.table}>
          <View style={docStyles.tableHeader}>
            <Text style={[docStyles.tableHeaderText, { width: 30, borderRightWidth: 1, borderRightColor: '#000' }]}>#</Text>
            <Text style={[docStyles.tableHeaderText, { flex: 1, borderRightWidth: 1, borderRightColor: '#000' }]}>DESCRIPCION</Text>
            <Text style={[docStyles.tableHeaderText, { width: 50 }]}>CANT.</Text>
          </View>
          <View style={[docStyles.tableRow, docStyles.tableRowAlt]}>
            <Text style={[docStyles.tableCell, { width: 30, borderRightWidth: 1, borderRightColor: '#000' }]}>1</Text>
            <Text style={[docStyles.tableCell, { flex: 1, borderRightWidth: 1, borderRightColor: '#000' }]}>
              {buildDescripcion(bien)}
            </Text>
            <Text style={[docStyles.tableCellLast, { width: 50, textAlign: 'center' }]}>1</Text>
          </View>
        </View>

        {responsableAnterior && (
          <View style={{ marginTop: 15, padding: 8, borderWidth: 1, borderColor: '#000', backgroundColor: '#fafafa' }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>ENTREGA DE:</Text>
            <Text style={{ fontSize: 10 }}>{responsableAnterior}</Text>
          </View>
        )}

        <View style={{ marginTop: 10, padding: 8, borderWidth: 1, borderColor: '#000', backgroundColor: '#fafafa' }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>RECIBE:</Text>
          <Text style={{ fontSize: 10 }}>{bien.responsableNombre || 'Sin asignar'}</Text>
          {bien.dependenciaNombre && (
            <Text style={{ fontSize: 9, color: '#444', marginTop: 3 }}>Dependencia: {bien.dependenciaNombre}</Text>
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
              <Text style={docStyles.signatureName}>{bien.responsableNombre || '________________________________'}</Text>
              <Text style={docStyles.signatureRole}>{bien.dependenciaNombre || ''}</Text>
            </View>
          </View>
        </View>

        <View style={docStyles.footer}>
          <Text>SIGPIC - Documento generado el {fechaStr}</Text>
          <Text>Acta de Entrega y Responsabilidad</Text>
          <Text>Página 1</Text>
        </View>
      </Page>
    </Document>
  );
}
