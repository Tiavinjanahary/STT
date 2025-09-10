const router = require('express').Router();
const { N1Stat, N2Stat } = require('../models/Stat.js');
const ExcelJS = require('exceljs');
const path = require('path');

// Middleware pour sélectionner le modèle en fonction de la route
const selectModel = (req, res, next) => {
    const model = req.originalUrl.startsWith('/n1') ? N1Stat : N2Stat;
    req.model = model;
    next();
};

// Appliquer le middleware à toutes les routes de ce routeur
router.use(selectModel);

// GET: Récupérer toutes les statistiques avec filtres optionnels
router.route('/').get((req, res) => {
    const { startDate, endDate } = req.query;

    let query = {};

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) // Inclure toute la journée de fin
        };
    }

    req.model.find(query)
        .sort({ date: -1 }) // Trier par date décroissante
        .then(stats => res.json(stats))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// POST: Ajouter une nouvelle statistique
router.route('/add').post((req, res) => {
    const { date, appel, jira, mail, escalade, p1, p2, p3, p4 } = req.body;

    const newStat = new req.model({
        date: Date.parse(date),
        appel: Number(appel),
        jira: Number(jira),
        mail: Number(mail),
        escalade: Number(escalade),
        p1: Number(p1),
        p2: Number(p2),
        p3: Number(p3),
        p4: Number(p4),
    });

    newStat.save()
        .then(() => res.json('Statistique ajoutée!'))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// GET: Récupérer une statistique par son ID
router.route('/:id').get((req, res) => {
    req.model.findById(req.params.id)
        .then(stat => res.json(stat))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// DELETE: Supprimer une statistique par son ID
router.route('/:id').delete((req, res) => {
    req.model.findByIdAndDelete(req.params.id)
        .then(() => res.json('Statistique supprimée.'))
        .catch(err => res.status(400).json('Erreur: ' + err));
});

// POST: Mettre à jour une statistique par son ID
router.route('/update/:id').post((req, res) => {
    req.model.findById(req.params.id)
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

// POST: Importer les données depuis le fichier Excel
router.route('/import').post(async (req, res) => {
    try {
        const filePath = path.resolve(__dirname, '..', '..', 'Synthèse v2.0.xlsx');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            return res.status(400).json("Aucune feuille de calcul trouvée.");
        }

        const headerRow = worksheet.getRow(10); // Les dates sont sur la ligne 10
        const startDate = new Date('2024-12-30T00:00:00.000Z');
        
        let startColumn = -1;

        // Trouver la colonne de départ pour le 30/12/2024
        headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (cell.value instanceof Date && cell.value.getTime() === startDate.getTime()) {
                if(startColumn === -1) { //Prendre la première occurrence
                    startColumn = colNumber;
                }
            }
        });

        if (startColumn === -1) {
            // Fallback pour les formats de date qui ne sont pas des objets Date
            headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                try {
                    // Tenter de parser la date si c'est une string (ex: '30/12/2024')
                    if (typeof cell.value === 'string' && new Date(cell.value).getTime() === startDate.getTime()) {
                         if(startColumn === -1) {
                            startColumn = colNumber;
                         }
                    }
                } catch(e) { /* ignorer les erreurs de parsing */ }
            });
        }

        if (startColumn === -1) {
            return res.status(400).json("Impossible de trouver la date de début (30/12/2024) dans le fichier Excel. Vérifiez la ligne 10.");
        }

        const rowMapping = {
            appel: 2,
            jira: 3,
            mail: 4,
            escalade: 6,
            p1: 11,
            p2: 12,
            p3: 13,
            p4: 14,
        };

        const promises = [];

        // Itérer sur chaque colonne à partir de la date de début
        for (let c = startColumn; c <= worksheet.columnCount; c++) {
            const dateValue = headerRow.getCell(c).value;
            if (!dateValue || !(dateValue instanceof Date)) {
                // Si la cellule de date est vide ou n'est pas une date, on arrête
                continue;
            }

            const statData = {
                date: dateValue,
                appel: worksheet.getRow(rowMapping.appel).getCell(c).value || 0,
                jira: worksheet.getRow(rowMapping.jira).getCell(c).value || 0,
                mail: worksheet.getRow(rowMapping.mail).getCell(c).value || 0,
                escalade: worksheet.getRow(rowMapping.escalade).getCell(c).value || 0,
                p1: worksheet.getRow(rowMapping.p1).getCell(c).value || 0,
                p2: worksheet.getRow(rowMapping.p2).getCell(c).value || 0,
                p3: worksheet.getRow(rowMapping.p3).getCell(c).value || 0,
                p4: worksheet.getRow(rowMapping.p4).getCell(c).value || 0,
            };
            
            // Nettoyer les données qui pourraient être des objets (formules)
            for(const key in statData) {
                if(typeof statData[key] === 'object' && statData[key] !== null && !(statData[key] instanceof Date)) {
                    statData[key] = statData[key].result || 0;
                }
            }

            // Utiliser findOneAndUpdate avec upsert pour éviter les doublons
            const promise = req.model.findOneAndUpdate(
                { date: statData.date },
                statData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            promises.push(promise);
        }

        await Promise.all(promises);

        res.json(`${promises.length} jours de statistiques ont été importés ou mis à jour avec succès.`);

    } catch (err) {
        console.error(err);
        res.status(500).json('Erreur serveur lors de l\'importation: ' + err.message);
    }
});


// POST: Créer des entrées vides pour les jours ouvrés de la semaine en cours (version robuste)
router.route('/seed-week').post(async (req, res) => {
    try {
        const today = new Date();
        const promises = [];

        // Trouver le lundi de la semaine en cours, en UTC
        const dayOfWeek = today.getUTCDay(); // 0=Dimanche, 6=Samedi
        const dayAdjustment = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        monday.setUTCDate(monday.getUTCDate() + dayAdjustment);

        // Itérer 5 fois pour Lundi -> Vendredi
        for (let i = 0; i < 5; i++) {
            const currentDay = new Date(monday.getTime());
            currentDay.setUTCDate(monday.getUTCDate() + i);

            const defaultStat = {
                date: currentDay,
                appel: 0,
                jira: 0,
                mail: 0,
                escalade: 0,
                p1: 0,
                p2: 0,
                p3: 0,
                p4: 0,
            };

            // Crée le document seulement s'il n'existe pas pour cette date.
            const promise = req.model.findOneAndUpdate(
                { date: currentDay },
                { $setOnInsert: defaultStat },
                { upsert: true, new: true }
            );
            promises.push(promise);
        }

        await Promise.all(promises);
        res.json("La semaine a été initialisée avec succès (v2).");

    } catch (err) {
        console.error("Erreur lors de l\'initialisation de la semaine:", err);
        res.status(500).json('Erreur serveur: ' + err.message);
    }
});

module.exports = router;
