const router = require('express').Router();
const { N1Stat } = require('../models/Stat.js');
const ExcelJS = require('exceljs');
const path = require('path');

// GET: Récupérer toutes les statistiques avec filtres optionnels
router.route('/').get((req, res) => {
    const { startDate, endDate } = req.query;

    let query = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        query.date = {
            $gte: start,
            $lte: end
        };
    }

    N1Stat.find(query)
        .sort({ date: -1 })
        .then(stats => res.json(stats))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// POST: Ajouter ou mettre à jour une statistique (Upsert)
router.route('/add').post(async (req, res) => {
    const { date, appel, jira, mail, escalade, p1, p2, p3, p4 } = req.body;

    // Normaliser la date pour la comparaison (début du jour en UTC)
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const filter = { date: targetDate };

    const update = {
        appel: Number(appel),
        jira: Number(jira),
        mail: Number(mail),
        escalade: Number(escalade),
        p1: Number(p1),
        p2: Number(p2),
        p3: Number(p3),
        p4: Number(p4),
        date: targetDate // Assurer que la date est bien celle du début du jour
    };

    try {
        // findOneAndUpdate avec upsert: true va créer le document s'il n'existe pas
        const stat = await N1Stat.findOneAndUpdate(filter, update, {
            new: true, // Retourne le document modifié
            upsert: true, // Crée le document s'il n'existe pas
            setDefaultsOnInsert: true // Applique les valeurs par défaut du schéma
        });
        res.json('Statistique ajoutée ou mise à jour!');
    } catch (err) {
        res.status(400).json('Erreur: ' + err);
    }
});

// GET: Exporter les statistiques en Excel
router.route('/export').get(async (req, res) => {
    const { startDate, endDate } = req.query;

    let query = {};
    let fileName = 'STT_N1';

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
        const stats = await N1Stat.find(query).sort({ date: 'asc' });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Statistiques N1');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Appel', key: 'appel', width: 10 },
            { header: 'Jira', key: 'jira', width: 10 },
            { header: 'Mail', key: 'mail', width: 10 },
            { header: 'Total', key: 'total', width: 10 },
            { header: 'Escaladé', key: 'escalade', width: 12 },
            { header: 'P1', key: 'p1', width: 10 },
            { header: 'P2', key: 'p2', width: 10 },
            { header: 'P3', key: 'p3', width: 10 },
            { header: 'P4', key: 'p4', width: 10 },
            { header: ' Traité', key: 'traite', width: 10 },
            { header: 'En cours', key: 'en_cours', width: 12 },
        ];

        // Ajouter les données
        stats.forEach(stat => {
            worksheet.addRow({
                ...stat.toObject(), // Convertit le document Mongoose en objet simple
                date: new Date(stat.date).toLocaleDateString('fr-FR', { timeZone: 'UTC' }), // Formatter la date
            });
        });

        // Ajouter une ligne de totaux
        const totals = stats.reduce((acc, stat) => {
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

        worksheet.addRow({}); // Ligne vide pour la séparation
        const totalRow = worksheet.addRow({
            date: 'TOTAL',
            appel: totals.appel,
            jira: totals.jira,
            mail: totals.mail,
            total: totals.total,
            escalade: totals.escalade,
            p1: totals.p1,
            p2: totals.p2,
            p3: totals.p3,
            p4: totals.p4,
            traite: totals.traite,
            en_cours: totals.en_cours
        });

        // Style pour la ligne de totaux
        totalRow.font = { bold: true };

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

// GET: Récupérer une statistique par son ID
router.route('/:id').get((req, res) => {
    N1Stat.findById(req.params.id)
        .then(stat => res.json(stat))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// DELETE: Supprimer une statistique par son ID
router.route('/:id').delete((req, res) => {
    N1Stat.findByIdAndDelete(req.params.id)
        .then(() => res.json('Statistique supprimée.'))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// POST: Mettre à jour une statistique par son ID
router.route('/update/:id').post((req, res) => {
    N1Stat.findById(req.params.id)
        .then(stat => {
            stat.appel = Number(req.body.appel);
            stat.jira = Number(req.body.jira);
            stat.mail = Number(req.body.mail);
            stat.escalade = Number(req.body.escalade);
            stat.p1 = Number(req.body.p1);
            stat.p2 = Number(req.body.p2);
            stat.p3 = Number(req.body.p3);
            stat.p4 = Number(req.body.p4);

            stat.save()
                .then(() => res.json('Statistique mise à jour!'))
                .catch(err => res.status(400).json('Erreur: ' + err));
        })
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// POST: Seed the current week with default stats if they don't exist
router.route('/seed-week').post(async (req, res) => {
    try {
        const today = new Date();
        const day = today.getUTCDay(); // Use UTC day (0=Sun, 1=Mon)
        const diff = today.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), diff));

        const promises = [];

        for (let i = 0; i < 5; i++) { // Loop for 5 days (Mon-Fri)
            const currentDate = new Date(monday);
            currentDate.setUTCDate(monday.getUTCDate() + i);

            const startOfDay = new Date(currentDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(currentDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const promise = N1Stat.findOneAndUpdate(
                { date: { $gte: startOfDay, $lte: endOfDay } },
                { $setOnInsert: {
                    date: currentDate,
                    appel: 0,
                    jira: 0,
                    mail: 0,
                    escalade: 0,
                    p1: 0,
                    p2: 0,
                    p3: 0,
                    p4: 0
                }},
                { upsert: true, new: true }
            );
            promises.push(promise);
        }

        await Promise.all(promises);
        res.json('Semaine initialisée avec succès (Lundi-Vendredi).');
    } catch (err) {
        res.status(400).json({ message: 'Erreur lors de l\'initialisation de la semaine', error: err });
    }
});

module.exports = router;
