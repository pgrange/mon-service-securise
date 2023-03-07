const axios = require('axios');
const expect = require('expect.js');

const { depotVide } = require('../depots/depotVide');
const adaptateurHorlogeParDefaut = require('../../src/adaptateurs/adaptateurHorloge');
const MoteurRegles = require('../../src/moteurRegles');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');

const middleware = require('../mocks/middleware');

const testeurMss = () => {
  let adaptateurHorloge;
  let adaptateurMail;
  let adaptateurPdf;
  let adaptateurPdfHtml;
  let depotDonnees;
  let moteurRegles;
  let referentiel;
  let serveur;

  const verifieJetonDepose = (reponse, suite) => {
    const valeurHeader = reponse.headers['set-cookie'][0];
    expect(valeurHeader).to.match(/^token=.+; path=\/; expires=.+; samesite=strict; httponly$/);
    suite();
  };

  const verifieRequeteGenereErreurHTTP = (status, messageErreur, requete, suite) => {
    axios(requete)
      .then(() => suite('Réponse OK inattendue'))
      .catch((erreur) => {
        expect(erreur.response.status).to.equal(status);
        expect(erreur.response.data).to.eql(messageErreur);
        suite();
      })
      .catch(suite);
  };

  const initialise = (done) => {
    adaptateurHorloge = adaptateurHorlogeParDefaut;
    adaptateurMail = {};
    adaptateurPdfHtml = {};
    adaptateurPdf = {};
    middleware.reinitialise({});
    referentiel = Referentiel.creeReferentielVide();
    moteurRegles = new MoteurRegles(referentiel);
    depotVide()
      .then((depot) => {
        depotDonnees = depot;
        serveur = MSS.creeServeur(
          depotDonnees,
          middleware,
          referentiel,
          moteurRegles,
          adaptateurMail,
          adaptateurPdfHtml,
          adaptateurPdf,
          adaptateurHorloge,
          false,
        );
        serveur.ecoute(1234, done);
      })
      .catch(done);
  };

  const arrete = () => (serveur.arreteEcoute());

  return {
    adaptateurHorloge: () => adaptateurHorloge,
    adaptateurMail: () => adaptateurMail,
    adaptateurPdf: () => adaptateurPdf,
    adaptateurPdfHtml: () => adaptateurPdfHtml,
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    moteurRegles: () => moteurRegles,
    referentiel: () => referentiel,
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieJetonDepose,
  };
};

module.exports = testeurMss;
