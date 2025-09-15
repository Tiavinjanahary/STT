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

// ... (import and seed-week routes can be added later if needed)

module.exports = router;
