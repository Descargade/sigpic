import { StyleSheet } from '@react-pdf/renderer';

export const docStyles = StyleSheet.create({
  page: {
    padding: '40 50',
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: '#000',
  },

  /* ─── HEADER ──────────────────────────────────────────────── */
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
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
    fontFamily: 'Times-Bold',
    color: '#000',
    marginBottom: 2,
  },
  institutionSiglas: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#000',
    marginBottom: 2,
  },
  systemName: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    color: '#000',
    marginBottom: 2,
  },
  unitName: {
    fontSize: 9,
    color: '#000',
  },

  /* ─── TITLE (ACTA FORMAT) ────────────────────────────────── */
  docTitle: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 12,
  },
  docSubtitle: {
    fontSize: 10,
    color: '#000',
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
    color: '#000',
    fontFamily: 'Times-Bold',
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
    backgroundColor: '#fff',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: '#000',
    fontSize: 8,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 8,
    color: '#000',
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  tableCellLeft: {
    fontSize: 8,
    color: '#000',
    textAlign: 'left',
    justifyContent: 'center',
    paddingLeft: 6,
  },
  tableCellLast: {
    fontSize: 8,
    color: '#000',
    textAlign: 'center',
    justifyContent: 'center',
  },
  columnSeparator: {
    width: 1,
    backgroundColor: '#000',
    alignSelf: 'stretch',
  },

  /* ─── SECTION TITLE ──────────────────────────────────────── */
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#000',
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
  },
  observationsTitle: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: '#000',
    marginBottom: 5,
  },
  observationsText: {
    fontSize: 9,
    color: '#000',
    lineHeight: 1.4,
  },

  /* ─── DUAL SIGNATURES (ENTREGUÉ / RECIBÍ CONFORME) ──────── */
  signatureSectionDual: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLineAbove: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    color: '#000',
    marginTop: 5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  signatureName: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    color: '#000',
  },
  signatureRole: {
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
    marginTop: 2,
  },

  /* ─── SINGLE SIGNATURE (legacy) ──────────────────────────── */
  signatureSection: {
    marginTop: 50,
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingTop: 5,
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
    color: '#000',
  },

  /* ─── BADGES ─────────────────────────────────────────────── */
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#000',
    color: '#000',
  },
  countBadge: {
    borderWidth: 1,
    borderColor: '#000',
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 9,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    color: '#000',
    padding: 30,
    fontSize: 10,
  },
});
