"use client";

import { Product } from "@prisma/client";
import { formatToRupiah } from "@/lib/utils";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    backgroundColor: "#eee",
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    flex: 1,
  },
  headerCellNo: {
    flex: 0.3,
    textAlign: "center",
    padding: 4,
    borderStyle: "solid",
    borderWidth: 1,
    fontWeight: "bold",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#eee",
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    flex: 1,
  },
  cellNo: {
    flex: 0.3,
    textAlign: "center",
    padding: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  footer: {
    marginTop: 10,
    textAlign: "right",
    fontSize: 9,
    marginRight: 4,
  },
  summary: {
    marginTop: 12,
    fontSize: 11,
    textAlign: "right",
    fontWeight: "bold",
  },
});

const ITEMS_PER_PAGE = 20;

type ProductTablePDFDocumentProps = {
  data: Product[];
};

export default function TablePdfProduct({
  data,
}: ProductTablePDFDocumentProps) {
  const pages = Array.from(
    { length: Math.ceil(data.length / ITEMS_PER_PAGE) },
    (_, i) => data.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE),
  );

  const totalHarga = data.reduce((acc, d) => acc + d.price, 0);

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          <Text
            style={{
              marginBottom: 8,
              fontSize: 14,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Laporan Produk
          </Text>

          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.headerCellNo}>NO</Text>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Description</Text>
              <Text style={styles.headerCell}>Price</Text>
              <Text style={styles.headerCell}>Created At</Text>
            </View>
            {pageData.map((item, idx) => (
              <View style={styles.row} key={item.id}>
                <Text style={styles.cellNo}>
                  {pageIndex * ITEMS_PER_PAGE + idx + 1}
                </Text>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.description || "-"}</Text>
                <Text style={styles.cell}>Rp {formatToRupiah(item.price)}</Text>
                <Text style={styles.cell}>
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </Text>
              </View>
            ))}
          </View>

          <Text
            fixed
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />

          {pageIndex === pages.length - 1 && (
            <View style={styles.summary}>
              <Text>
                Total Harga Semua Produk: Rp {formatToRupiah(totalHarga)}
              </Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
}
