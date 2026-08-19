import { StyleSheet } from '@react-pdf/renderer';

export const docStyles = StyleSheet.create({
  page: {
    padding: '40 50',
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },

  /* ─── HEADER ──────────────────────────────────────────────── */
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a5f',
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 140,
    alignItems: 'flex-end',
  },
  institutionName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  institutionSiglas: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  systemName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  unitName: {
    fontSize: 9,
    color: '#666',
  },

  /* ─── TITLE (ACTA FORMAT) ────────────────────────────────── */
  docTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginBottom: 12,
  },
  docSubtitle: {
    fontSize: 10,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 12,
    lineHeight: 1.5,
  },

  /* ─── INFO ROWS ──────────────────────────────────────────── */
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  infoLabel: {
    width: 140,
    fontSize: 9,
    color: '#666',
    fontFamily: 'Helvetica-Bold',
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
  },

  /* ─── TABLE (FORMAL BORDERS + CENTERED) ──────────────────── */
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: '#f8f8f8',
  },
  tableCell: {
    fontSize: 8,
    color: '#1a1a1a',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableCellLeft: {
    fontSize: 8,
    color: '#1a1a1a',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    textAlign: 'left',
    justifyContent: 'center',
  },
  tableCellLast: {
    fontSize: 8,
    color: '#1a1a1a',
    textAlign: 'center',
    justifyContent: 'center',
  },

  /* ─── SECTION TITLE ──────────────────────────────────────── */
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },

  /* ─── OBSERVATIONS ───────────────────────────────────────── */
  observations: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fafafa',
  },
  observationsTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  observationsText: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.4,
  },

  /* ─── DUAL SIGNATURES (ENTREGA / RECIBE) ─────────────────── */
  signatureSectionDual: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 5,
    alignItems: 'center',
  },
  signatureName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 9,
    color: '#444',
    textAlign: 'center',
    marginTop: 2,
  },

  /* ─── SINGLE SIGNATURE (legacy) ──────────────────────────── */
  signatureSection: {
    marginTop: 50,
    alignItems: 'center',
  },

  /* ─── FOOTER ─────────────────────────────────────────────── */
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#666',
  },

  /* ─── BADGES ─────────────────────────────────────────────── */
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  badgeGood: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeRegular: { backgroundColor: '#fef9c3', color: '#854d0e' },
  badgeBad: { backgroundColor: '#fee2e2', color: '#991b1b' },
  countBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: 30,
    fontSize: 10,
  },
});
