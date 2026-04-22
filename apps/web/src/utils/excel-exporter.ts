import { Transaction } from "@/types/finance";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const generateExcelReport = async (
  transactions: Transaction[],
  periodLabel: string,
) => {
  const workbook = new ExcelJS.Workbook();

  // Helper function to create standardized sheets
  const createSheet = (
    sheetName: string,
    title: string,
    data: Transaction[],
    colors: { header: string; total: string; title: string },
    options: {
      includeTags: boolean;
      tagsAlignment?: "left" | "right" | "center";
    } = {
      includeTags: true,
    },
  ) => {
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns
    const columns = [
      { header: "Data", key: "date", width: 15 },
      { header: "Descrição", key: "description", width: 30 },
      { header: "Categoria", key: "category", width: 20 },
      { header: "Valor", key: "amount", width: 15 },
    ];

    if (options.includeTags) {
      columns.push({ header: "Tags", key: "tags", width: 25 });
    }

    worksheet.columns = columns;
    const lastColLetter = options.includeTags ? "E" : "D";

    // --- Title ---
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: colors.title },
    };
    titleCell.alignment = { horizontal: "center" };

    let currentRow = 3;

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // --- Headers ---
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = columns.map((c) => c.header);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.header },
      };
      cell.alignment = { horizontal: "center" };
      cell.border = borderStyle;
    });
    currentRow++;

    // --- Data ---
    let totalAmount = 0;
    data.forEach((t) => {
      const row = worksheet.getRow(currentRow);
      const values = [
        new Date(t.date).toLocaleDateString("pt-BR"),
        t.description,
        t.category || "Sem Categoria",
        Number(t.amount),
      ];

      if (options.includeTags) {
        values.push(t.tags?.join(", ") || "");
      }

      row.values = values;
      totalAmount += Number(t.amount);

      // Formatting Amount (Column 4)
      row.getCell(4).numFmt = '"R$ "#,##0.00';

      // Formatting Tags (Column 5) if exists
      if (options.includeTags && options.tagsAlignment) {
        row.getCell(5).alignment = { horizontal: options.tagsAlignment };
      }

      // Apply borders to all used cells in the row
      row.eachCell((cell, colNumber) => {
        if (colNumber <= columns.length) {
          cell.border = borderStyle;
        }
      });

      currentRow++;
    });

    // --- Blank Line ---
    currentRow++;

    // --- Total ---
    const totalRow = worksheet.getRow(currentRow);
    totalRow.values = [
      `TOTAL ${sheetName.toUpperCase()}`,
      "",
      "",
      totalAmount,
      ...(options.includeTags ? [""] : []),
    ];
    totalRow.font = { bold: true };

    // Apply borders to total row
    for (let i = 1; i <= columns.length; i++) {
      totalRow.getCell(i).border = borderStyle;
    }

    totalRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.total },
    };
    totalRow.getCell(4).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.total },
    };
    totalRow.getCell(4).numFmt = '"R$ "#,##0.00';

    // --- Hide Unused Columns ---
    // Entradas (4 cols A-D) -> Hide F (6) até XFD (16384)
    // Despesas (5 cols A-E) -> Hide G (7) até XFD (16384)
    const lastUsedCol = options.includeTags ? 5 : 4;
    const startHideCol = lastUsedCol + 1;

    // XFD é a coluna 16384 no Excel
    for (let i = startHideCol; i <= 16384; i++) {
      worksheet.getColumn(i).hidden = true;
    }

    // --- Hide Empty Rows ---
    // Ocultar todas as linhas a partir de 2 linhas abaixo do total
    const firstRowToHide = currentRow + 2;
    // Excel tem limite de 1048576 linhas
    for (let i = firstRowToHide; i <= 1048576; i++) {
      worksheet.getRow(i).hidden = true;
    }
  };

  // Separate transactions
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Create "Entradas" Sheet
  createSheet(
    "Entradas",
    `Relatório de Entradas - ${periodLabel}`,
    incomeTransactions,
    {
      header: "FF166534", // Dark Green
      total: "FFDCFCE7", // Light Green
      title: "FF15803D", // Green Text
    },
    { includeTags: false },
  );

  // Create "Despesas" Sheet
  createSheet(
    "Despesas",
    `Relatório de Despesas - ${periodLabel}`,
    expenseTransactions,
    {
      header: "FF991B1B", // Dark Red
      total: "FFFEE2E2", // Light Red
      title: "FFDC2626", // Red Text
    },
    { includeTags: true, tagsAlignment: "right" },
  );

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Relatorio_Financeiro_${periodLabel.replace(/\//g, "-")}.xlsx`);
};
