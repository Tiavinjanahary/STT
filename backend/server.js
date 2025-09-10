const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importer les nouvelles routes
const n1StatsRouter = require('./routes/n1-stats');
const n2StatsRouter = require('./routes/n2-stats');

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
const uri = process.env.MONGO_URI || "mongodb://s_stt:007Tiavina@10.128.14.140/stt_database";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("La connexion à la base de données MongoDB a été établie avec succès");
    
    // Utiliser les routes dédiées pour N1 et N2
    app.use('/n1', n1StatsRouter);
    app.use('/n2', n2StatsRouter);

    app.listen(port, () => {
        console.log(`Le serveur fonctionne sur le port: ${port}`);
    });
  })
  .catch(err => {
    console.error("Erreur de connexion à la base de données:", err);
    process.exit(1);
  });