const expect = require('expect.js');
const axios = require('axios');

const testeurMSS = require('./testeurMSS');
const { verifieNomFichierServi, verifieTypeFichierServiEstPDF, verifieTypeFichierServiEstZIP } = require('../aides/verifieFichierServi');
const { unDossier } = require('../constructeurs/constructeurDossier');
const Homologation = require('../../src/modeles/homologation');
const Referentiel = require('../../src/referentiel');

describe('Le serveur MSS des routes /api/service/:id/pdf/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/service/:id/pdf/annexes.pdf`', () => {
    beforeEach(() => {
      testeur.adaptateurPdf().genereAnnexes = () => Promise.resolve('Pdf annexes');
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/annexes.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/annexes.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexes = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/annexes.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/dossierDecision.pdf`', () => {
    const referentiel = Referentiel
      .creeReferentiel({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
        statutsAvisDossierHomologation: { favorable: {} },
      });

    beforeEach(() => {
      testeur.adaptateurPdf().genereDossierDecision = () => Promise.resolve('Pdf decision');
      const homologationARenvoyer = new Homologation({
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [
          unDossier(referentiel)
            .quiEstActif()
            .avecAutorite('Jean Dupond', 'RSSI')
            .avecAvis([{ collaborateurs: ['Jean Dupond'], dureeValidite: 'unAn', statut: 'favorable' }])
            .avecDocuments(['unDocument'])
            .donnees,
        ],
      }, referentiel);
      homologationARenvoyer.mesures.indiceCyber = () => 3.5;
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf',
        done,
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereDossierDecision = (donnees) => {
        adaptateurPdfAppele = true;
        expect(donnees.nomService).to.equal('un service');
        expect(donnees.nomPrenomAutorite).to.equal('Jean Dupond');
        expect(donnees.fonctionAutorite).to.equal('RSSI');
        expect(donnees.avis).to.eql([{ collaborateurs: ['Jean Dupond'], dureeValidite: 'unAn', statut: 'favorable' }]);
        expect(donnees.documents).to.eql(['unDocument']);
        return Promise.resolve('Pdf dossier décision');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste en cas d'échec de génération de pdf", (done) => {
      testeur.adaptateurPdf().genereDossierDecision = () => Promise.reject();

      axios.get('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/syntheseSecurite.pdf`', () => {
    const referentiel = Referentiel
      .creeReferentiel({
        categoriesMesures: { uneCategorie: {} },
        localisationsDonnees: { uneLocalisation: { description: 'France' } },
        statutsDeploiement: { unStatutDeploiement: { description: 'Statut de déploiement' } },
        typesService: { unType: { description: 'Type de service' } },
        mesures: { uneMesure: { categorie: 'uneCategorie' } },
        reglesPersonnalisation: { mesuresBase: ['uneMesure'] },
      });
    const homologationARenvoyer = new Homologation({ id: '456' }, referentiel);

    beforeEach(() => {
      testeur.adaptateurPdf().genereSyntheseSecurite = () => Promise.resolve('Pdf synthèse sécurité');
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereSyntheseSecurite = (donnees) => {
        adaptateurPdfAppele = true;
        expect(donnees.service).to.eql(homologationARenvoyer);
        expect(donnees.referentiel).to.eql(testeur.referentiel());
        return Promise.resolve('Pdf synthèse sécurité');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste en cas d'échec de génération de pdf", (done) => {
      testeur.adaptateurPdf().genereSyntheseSecurite = () => Promise.reject();

      axios.get('http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/documentsHomologation.zip`', () => {
    const referentiel = Referentiel.creeReferentielVide();
    const homologationARenvoyer = new Homologation({
      id: '456',
      descriptionService: { nomService: 'un service' },
      dossiers: [unDossier(referentiel).donnees],
    }, referentiel);
    homologationARenvoyer.mesures.indiceCyber = () => 3.5;

    beforeEach(() => {
      testeur.adaptateurPdf().genereArchiveTousDocuments = () => Promise.resolve('Archive ZIP');
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip',
        done,
      );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur.middleware().verifieRechercheDossierCourant(
        'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip',
        done,
      );
    });

    it('sert un fichier de type zip', (done) => {
      verifieTypeFichierServiEstZIP('http://localhost:1234/api/service/456/pdf/documentsHomologation.zip', done);
    });

    it('sert un fichier dont le nom contient la date du jour en format court', (done) => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      verifieNomFichierServi('http://localhost:1234/api/service/456/pdf/documentsHomologation.zip', 'MSS_decision_20230128.zip', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereArchiveTousDocuments = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Archive ZIP');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/documentsHomologation.zip')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("utilise un adaptateur d'horloge pour la génération du nom", (done) => {
      let adaptateurHorlogeAppele = false;
      testeur.adaptateurHorloge().maintenant = () => {
        adaptateurHorlogeAppele = true;
        return new Date();
      };

      axios.get('http://localhost:1234/api/service/456/pdf/documentsHomologation.zip')
        .then(() => {
          expect(adaptateurHorlogeAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste en cas d'échec de génération de pdf", (done) => {
      testeur.adaptateurPdf().genereArchiveTousDocuments = () => Promise.reject();

      axios.get('http://localhost:1234/api/service/456/pdf/documentsHomologation.zip')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });
});
