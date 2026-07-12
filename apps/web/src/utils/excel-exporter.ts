import { normalizePaymentType } from "@/constants/payment-types";
import { getCanonicalTransactionCategoryName } from "@/constants/transaction-category-ui";
import { Transaction } from "@/types/finance";
import { formatDateOnlyPtBR } from "@/utils/date";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const generateExcelReport = async (
  transactions: Transaction[],
  periodLabel: string,
  transferCategoryNames: string[] = [],
) => {
  const workbook = new ExcelJS.Workbook();

  // Helper function to create standardized sheets
  const createSheet = (
    sheetName: string,
    title: string,
    data: Transaction[],
    colors: { header: string; total: string; title: string },
    options: {
      includePaymentType?: boolean;
      includeTags: boolean;
      tagsAlignment?: "left" | "right" | "center";
    } = {
      includeTags: true,
    },
  ) => {
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns (a ordem aqui define a ordem das colunas na planilha)
    const columns = [
      { header: "Data", key: "date", width: 15 },
      { header: "Descrição", key: "description", width: 30 },
      { header: "Categoria", key: "category", width: 20 },
    ];

    if (options.includePaymentType) {
      columns.push({
        header: "Tipo de Pagamento",
        key: "paymentType",
        width: 18,
      });
    }

    columns.push({ header: "Valor", key: "amount", width: 15 });
    const amountColIndex = columns.length; // posição (1-based) da coluna Valor

    if (options.includeTags) {
      columns.push({ header: "Tags", key: "tags", width: 25 });
    }

    worksheet.columns = columns;
    const lastColLetter = String.fromCharCode(64 + columns.length);

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
      const values: (string | number)[] = [
        formatDateOnlyPtBR(t.date),
        t.description,
        t.category || "Sem Categoria",
      ];

      if (options.includePaymentType) {
        // Toda parcela de Parcelamento é, por definição, um pagamento no
        // crédito — independe do que estiver salvo em paymentType (planos
        // antigos podem ter sido cadastrados com outro valor).
        const isInstallment = Boolean(
          t.installmentNumber && t.installmentTotal,
        );
        values.push(
          isInstallment
            ? "Crédito"
            : normalizePaymentType(t.paymentType) || t.paymentType || "—",
        );
      }

      values.push(Number(t.amount));

      if (options.includeTags) {
        values.push(t.tags?.join(", ") || "");
      }

      row.values = values;
      totalAmount += Number(t.amount);

      // Formatting Amount
      row.getCell(amountColIndex).numFmt = '"R$ "#,##0.00';

      // Formatting Tags (última coluna) if exists
      if (options.includeTags && options.tagsAlignment) {
        row.getCell(columns.length).alignment = {
          horizontal: options.tagsAlignment,
        };
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
    const totalRowValues: (string | number)[] = new Array(columns.length).fill(
      "",
    );
    totalRowValues[0] = `TOTAL ${sheetName.toUpperCase()}`;
    totalRowValues[amountColIndex - 1] = totalAmount;
    totalRow.values = totalRowValues;
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
    totalRow.getCell(amountColIndex).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.total },
    };
    totalRow.getCell(amountColIndex).numFmt = '"R$ "#,##0.00';

    // --- Hide Unused Columns ---
    const lastUsedCol = columns.length;
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

  // Separate transactions. Categorias marcadas como transferência (ex:
  // Investimento) saem de "Despesas" — não são gasto real — e ganham sua
  // própria aba, no mesmo padrão das outras.
  //
  // A comparação usa o nome CANÔNICO da categoria (não o valor bruto salvo
  // na transação) porque lançamentos antigos podem ter variações do mesmo
  // nome (ex: "investimentos", "Investimentos") que hoje apontam pra mesma
  // categoria cadastrada — sem isso, esses lançamentos ficariam de fora da
  // aba de Investimentos por não baterem a string exata.
  const transferSet = new Set(transferCategoryNames);
  const isTransferTransaction = (t: Transaction) =>
    transferSet.has(getCanonicalTransactionCategoryName(t.category, t.type));

  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter(
    (t) => t.type === "expense" && !isTransferTransaction(t),
  );
  const investedTransactions = transactions.filter(
    (t) => t.type === "expense" && isTransferTransaction(t),
  );

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
    { includePaymentType: true, includeTags: true, tagsAlignment: "right" },
  );

  // Create "Investimentos" Sheet
  createSheet(
    "Investimentos",
    `Relatório de Investimentos - ${periodLabel}`,
    investedTransactions,
    {
      header: "FF1E3A8A", // Dark Blue
      total: "FFDBEAFE", // Light Blue
      title: "FF2563EB", // Blue Text
    },
    { includePaymentType: true, includeTags: false },
  );

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Relatorio_Financeiro_${periodLabel.replace(/\//g, "-")}.xlsx`);
};
