import { prisma } from '../../lib/prisma.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { type Response } from 'express';
import { AppError } from '../../utils/AppError.js';

export type ReportFormat = 'json' | 'xlsx' | 'pdf';

export class ReportsService {
 // métodos auxiliares privados
  private static async saveReportRecord(
    userId: string,
    tipo: string,
    parametros?: object,
  ) {
    await prisma.relatorio.create({
      data: {
        tipo,
        parametros: parametros ?? {},
        geradoPorId: userId,
      },
    });
  }

  // relatório de cursos cadastrados
  static async getRegisteredCourses(userId: string) {
    const courses = await prisma.cursoExtensao.findMany({
      select: {
        id: true,
        titulo: true,
        tipo: true,
        tipoAcao: true,
        status: true,
        cargaHoraria: true,
        dataInicio: true,
        dataFim: true,
        modeloOferta: true,
        _count: { select: { inscricoes: true } },
        professor: {
          select: {
            perfilServidor: {
              select: { user: { select: { nome: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.saveReportRecord(userId, 'cursos_cadastrados');
    return courses;
  }

  // relatório de inscrições por curso

  static async getEnrollmentsByCourse(userId: string, cursoId: string) {
    const course = await prisma.cursoExtensao.findUnique({
      where: { id: cursoId },
      select: { id: true, titulo: true },
    });

    if (!course) throw new AppError('Curso não encontrado.', 404);

    const enrollments = await prisma.inscricao.findMany({
      where: { cursoId },
      select: {
        id: true,
        status: true,
        inscricaoEm: true,
        aluno: {
          select: {
            matricula: true,
            user: { select: { nome: true, email: true } },
          },
        },
      },
      orderBy: { inscricaoEm: 'asc' },
    });

    await this.saveReportRecord(userId, 'inscritos_por_curso', { cursoId });
    return { course, enrollments };
  }

  // relatório de inscrições por status
  static async getEnrollmentsByStatus(userId: string) {
    const raw = await prisma.inscricao.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const data = raw.map((r) => ({
      status: r.status,
      total: r._count._all,
    }));

    await this.saveReportRecord(userId, 'inscricoes_por_status');
    return data;
  }

  // relatório geral consolidado
  static async getGeneralReport(userId: string) {
    const [totalCourses, totalEnrollments, enrollmentsByStatus, coursesByStatus] =
      await Promise.all([
        prisma.cursoExtensao.count(),
        prisma.inscricao.count(),
        prisma.inscricao.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.cursoExtensao.groupBy({ by: ['status'], _count: { _all: true } }),
      ]);

    await this.saveReportRecord(userId, 'relatorio_geral');

    return {
      totalCourses,
      totalEnrollments,
      enrollmentsByStatus: enrollmentsByStatus.map((r) => ({
        status: r.status,
        total: r._count._all,
      })),
      coursesByStatus: coursesByStatus.map((r) => ({
        status: r.status,
        total: r._count._all,
      })),
    };
  }

  // exportação de dados para planilha XLSX
  static async exportToXlsx(
    res: Response,
    filename: string,
    sheetName: string,
    columns: { header: string; key: string }[],
    rows: Record<string, unknown>[],
  ) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = columns.map((c) => ({ ...c, width: 25 }));

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    sheet.addRows(rows);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  // exportação de dados para documento PDF
  static exportToPdf(
    res: Response,
    filename: string,
    title: string,
    headers: string[],
    rows: string[][],
  ) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    doc.pipe(res);

    // configuração do título e cabeçalho do documento
    doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(`Generated at: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
    doc.moveDown(1);

    // configuração e desenho da tabela de dados
    const colWidth = (doc.page.width - 80) / headers.length;
    const rowHeight = 20;
    let y = doc.y;

    const drawRow = (cells: string[], isHeader = false) => {
      let x = 40;
      doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);

      if (isHeader) {
        doc.rect(x, y, doc.page.width - 80, rowHeight).fill('#2563EB');
        doc.fillColor('white');
      } else {
        doc.fillColor('black');
      }

      cells.forEach((cell) => {
        doc.text(cell, x + 4, y + 5, { width: colWidth - 8, lineBreak: false });
        x += colWidth;
      });

      if (!isHeader) {
        doc.rect(40, y, doc.page.width - 80, rowHeight).stroke('#CCCCCC');
      }

      y += rowHeight;
    };

    drawRow(headers, true);
    rows.forEach((row) => drawRow(row));

    doc.end();
  }
}