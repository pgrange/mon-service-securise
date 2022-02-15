const DepotDonnees = require('./src/depotDonnees');
const Middleware = require('./src/middleware');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurChiffrement = require('./src/adaptateurs/adaptateurChiffrement');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = require('./src/adaptateurs/adaptateurMail');

const port = process.env.PORT || 3000;
const referentiel = Referentiel.creeReferentiel();
const depotDonnees = DepotDonnees.creeDepot();
const middleware = Middleware({
  adaptateurChiffrement,
  adaptateurJWT,
  depotDonnees,
  login: process.env.LOGIN_ADMIN,
  motDePasse: process.env.MOT_DE_PASSE_ADMIN,
});
const serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, adaptateurMail);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
