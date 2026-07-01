import { type Request, type Response } from 'express';
import { ReportsService, type ReportFormat } from './reports.service.js';

export class ReportsController {
 // GET /reports/courses: lista todos os cursos cadastrados
  static async getRegisteredCourses(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const format = (req.query.formato as ReportFormat) ?? 'json';

      const data = await ReportsService.getRegisteredCourses(userId);

      if (format === 'json') {
        return res.status(200).json(data);
      }

      const columns = [
        { header: 'Title', key: 'titulo' },
        { header: 'Type', key: 'tipo' },
        { header: 'Action Type', key: 'tipoAcao' },
        { header: 'Status', key: 'status' },
        { header: 'Workload (h)', key: 'cargaHoraria' },
        { header: 'Start Date', key: 'dataInicio' },
        { header: 'End Date', key: 'dataFim' },
        { header: 'Offer Model', key: 'modeloOferta' },
        { header: 'Enrollments', key: 'totalEnrollments' },
      ];

      const rows = data.map((c) => ({
        titulo: c.titulo,
        tipo: c.tipo,
        tipoAcao: c.tipoAcao,
        status: c.status,
        cargaHoraria: String(c.cargaHoraria),
        dataInicio: c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : '-',
        dataFim: c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR') : '-',
        modeloOferta: c.modeloOferta,
        totalEnrollments: String(c._count.inscricoes),
      }));

      if (format === 'xlsx') {
        return await ReportsService.exportToXlsx(
          res,
          'registered-courses',
          'Registered Courses',
          columns,
          rows,
        );
      }

      if (format === 'pdf') {
        const headers = columns.map((c) => c.header);
        const pdfRows = rows.map((r) =>
          columns.map((c) => String(r[c.key as keyof typeof r] ?? '-')),
        );
        return ReportsService.exportToPdf(
          res,
          'registered-courses',
          'Registered Courses Report',
          headers,
          pdfRows,
        );
      }

      return res.status(400).json({ error: 'Invalid format. Use: json, xlsx or pdf.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // GET /reports/enrollments/:cursoId: lista as inscrições de um curso específico
  static async getEnrollmentsByCourse(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const cursoId = String(req.params.cursoId || '');
      const format = (req.query.formato as ReportFormat) ?? 'json';

      const { course, enrollments } = await ReportsService.getEnrollmentsByCourse(
        userId,
        cursoId,
      );

      if (format === 'json') {
        return res.status(200).json({ course, enrollments });
      }

      const columns = [
        { header: 'Name', key: 'nome' },
        { header: 'Email', key: 'email' },
        { header: 'Registration', key: 'matricula' },
        { header: 'Status', key: 'status' },
        { header: 'Enrolled At', key: 'inscricaoEm' },
      ];

      const rows = enrollments.map((i) => ({
        nome: i.aluno.user.nome,
        email: i.aluno.user.email,
        matricula: i.aluno.matricula,
        status: i.status,
        inscricaoEm: new Date(i.inscricaoEm).toLocaleDateString('pt-BR'),
      }));

      if (format === 'xlsx') {
        return await ReportsService.exportToXlsx(
          res,
          `enrollments-${cursoId}`,
          `Enrollments - ${course.titulo}`,
          columns,
          rows,
        );
      }

      if (format === 'pdf') {
        const headers = columns.map((c) => c.header);
        const pdfRows = rows.map((r) =>
          columns.map((c) => String(r[c.key as keyof typeof r] ?? '-')),
        );
        return ReportsService.exportToPdf(
          res,
          `enrollments-${cursoId}`,
          `Enrollments — ${course.titulo}`,
          headers,
          pdfRows,
        );
      }

      return res.status(400).json({ error: 'Invalid format. Use: json, xlsx or pdf.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // GET /reports/enrollments-by-status: retorna o total de inscrições agrupadas por status
  static async getEnrollmentsByStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const format = (req.query.formato as ReportFormat) ?? 'json';

      const data = await ReportsService.getEnrollmentsByStatus(userId);

      if (format === 'json') {
        return res.status(200).json(data);
      }

      const columns = [
        { header: 'Status', key: 'status' },
        { header: 'Total', key: 'total' },
      ];

      const rows = data.map((d) => ({ status: d.status, total: String(d.total) }));

      if (format === 'xlsx') {
        return await ReportsService.exportToXlsx(
          res,
          'enrollments-by-status',
          'Enrollments by Status',
          columns,
          rows,
        );
      }

      if (format === 'pdf') {
        const headers = columns.map((c) => c.header);
        const pdfRows = rows.map((r) => [r.status, r.total]);
        return ReportsService.exportToPdf(
          res,
          'enrollments-by-status',
          'Enrollments by Status Report',
          headers,
          pdfRows,
        );
      }

      return res.status(400).json({ error: 'Invalid format. Use: json, xlsx or pdf.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // GET /reports/general: gera o relatório consolidado geral do sistema
  static async getGeneralReport(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const format = (req.query.formato as ReportFormat) ?? 'json';

      const data = await ReportsService.getGeneralReport(userId);

      if (format === 'json') {
        return res.status(200).json(data);
      }

      const columns = [
        { header: 'Metric', key: 'metric' },
        { header: 'Value', key: 'value' },
      ];

      const rows = [
        { metric: 'Total Courses', value: String(data.totalCourses) },
        { metric: 'Total Enrollments', value: String(data.totalEnrollments) },
        ...data.enrollmentsByStatus.map((r) => ({
          metric: `Enrollments — ${r.status}`,
          value: String(r.total),
        })),
        ...data.coursesByStatus.map((r) => ({
          metric: `Courses — ${r.status}`,
          value: String(r.total),
        })),
      ];

      if (format === 'xlsx') {
        return await ReportsService.exportToXlsx(
          res,
          'general-report',
          'General Report',
          columns,
          rows,
        );
      }

      if (format === 'pdf') {
        const headers = columns.map((c) => c.header);
        const pdfRows = rows.map((r) => [r.metric, r.value]);
        return ReportsService.exportToPdf(
          res,
          'general-report',
          'General Consolidated Report',
          headers,
          pdfRows,
        );
      }

      return res.status(400).json({ error: 'Invalid format. Use: json, xlsx or pdf.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}