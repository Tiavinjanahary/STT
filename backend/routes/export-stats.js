const router = require('express').Router();
const { N1Stat, N2Stat } = require('../models/Stat.js');
const ExcelJS = require('exceljs');

router.route('/').get(async (req, res) => {
    const { startDate, endDate } = req.query;

    let query = {};
    let fileName = 'STT_N1_N2';

    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
        fileName += `_${startDate}_${endDate}`;
    } else {
        fileName += '_all_time';
    }
    fileName += '.xlsx';

    try {
        const [n1Stats, n2Stats] = await Promise.all([
            N1Stat.find(query),
            N2Stat.find(query)
        ]);

        const combinedStats = [...n1Stats, ...n2Stats];

        const totals = combinedStats.reduce((acc, stat) => {
            acc.appel += stat.appel || 0;
            acc.jira += stat.jira || 0;
            acc.mail += stat.mail || 0;
            acc.total += stat.total || 0;
            acc.escalade += stat.escalade || 0;
            acc.p1 += stat.p1 || 0;
            acc.p2 += stat.p2 || 0;
            acc.p3 += stat.p3 || 0;
            acc.p4 += stat.p4 || 0;
            acc.traite += stat.traite || 0;
            acc.en_cours += stat.en_cours || 0;
            return acc;
        }, { appel: 0, jira: 0, mail: 0, total: 0, escalade: 0, p1: 0, p2: 0, p3: 0, p4: 0, traite: 0, en_cours: 0 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Résumé N1+N2');

        worksheet.columns = [
            { header: 'Indicateur', key: 'indicator', width: 20 },
            { header: 'Total', key: 'value', width: 15 },
        ];

        worksheet.addRow({ indicator: 'Appel', value: totals.appel });
        worksheet.addRow({ indicator: 'Jira', value: totals.jira });
        worksheet.addRow({ indicator: 'Mail', value: totals.mail });
        worksheet.addRow({ indicator: 'Total Global', value: totals.total });
        worksheet.addRow({ indicator: 'Escaladé', value: totals.escalade });
        worksheet.addRow({ indicator: 'P1', value: totals.p1 });
        worksheet.addRow({ indicator: 'P2', value: totals.p2 });
        worksheet.addRow({ indicator: 'P3', value: totals.p3 });
        worksheet.addRow({ indicator: 'P4', value: totals.p4 });
        worksheet.addRow({ indicator: 'Tickets Traités', value: totals.traite });
        worksheet.addRow({ indicator: 'Tickets En Cours', value: totals.en_cours });
        
        // Style
        worksheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
            if (rowNumber > 1) { // Appliquer aux lignes de données
                row.getCell('value').alignment = { horizontal: 'right' };
            }
        });
        worksheet.getRow(1).font = { bold: true }; // Header en gras

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la génération du fichier Excel", error: err.toString() });
    }
});

module.exports = router;
