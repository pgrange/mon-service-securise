const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { ErreurArticleCrispIntrouvable } = require('../../../src/erreurs');
const {
  donneesPartagees,
  requeteSansRedirection,
} = require('../../aides/http');

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  [
    '/',
    '/aPropos',
    '/securite',
    '/accessibilite',
    '/cgu',
    '/confidentialite',
    '/mentionsLegales',
    '/inscription',
    '/creation-compte?token=unToken',
    '/activation',
    '/connexion',
    '/reinitialisationMotDePasse',
    '/devenir-ambassadeurrice-monservicesecurise',
    '/faire-connaitre-et-recommander-monservicesecurise',
    '/promouvoir-monservicesecurise',
    '/co-construire-monservicesecurise',
    '/conseils-cyber',
    '/ui-kit',
  ].forEach((route) => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it(`sert le contenu HTML de la page ${route}`, (done) => {
      axios
        .get(`http://localhost:1234${route}`)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.headers['content-type']).to.contain('text/html');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/articles/:slug`', () => {
    it('utilise le CMS Crisp pour récupérer un article de blog', async () => {
      let idRecu;
      testeur.adaptateurCmsCrisp().recupereArticle = async (id) => {
        idRecu = id;
        return {
          contenuMarkdown: 'Un contenu',
          titre: 'Un titre',
          description: 'Une description',
        };
      };
      testeur.adaptateurCmsCrisp().recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-generique-1ab2c3/',
        },
      ];

      await axios.get(`http://localhost:1234/articles/un-slug-generique`);

      expect(idRecu).to.be('1');
    });

    it('sert le contenu HTML de la page', async () => {
      testeur.adaptateurCmsCrisp().recupereArticle = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
      });
      testeur.adaptateurCmsCrisp().recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-generique-1ab2c3/',
        },
      ];

      const reponse = await axios.get(
        `http://localhost:1234/articles/un-slug-generique`
      );

      expect(reponse.status).to.be(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
      expect(reponse.data).to.contain('Un titre');
    });

    it("renvoie une erreur 404 si l'article n'existe pas", async () => {
      testeur.adaptateurCmsCrisp().recupereArticleBlog = async () => {
        throw new ErreurArticleCrispIntrouvable();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Article Crisp inconnu`,
        `http://localhost:1234/articles/un-slug-inexistant`
      );
    });
  });

  describe('quand requête GET sur `/reinitialisationMotDePasse`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/reinitialisationMotDePasse',
          done
        );
    });
  });

  describe('quand requête GET sur `/initialisationMotDePasse/:idReset`', () => {
    const uuid = '109156be-c4fb-41ea-b1b4-efe1671c5836';

    it("charge l'état d'activation d'AgentConnect", (done) => {
      testeur
        .middleware()
        .verifieRequeteChargeActivationAgentConnect(
          'http://localhost:1234/initialisationMotDePasse/unUUID',
          done
        );
    });

    describe('avec idReset valide', () => {
      const utilisateur = {
        id: '123',
        genereToken: (source) => {
          expect(source).to.be('MSS');
          return 'un token';
        },
        accepteCGU: () => false,
      };

      beforeEach(() => {
        testeur.depotDonnees().utilisateurAFinaliser = async () => utilisateur;
        testeur.depotDonnees().utilisateur = async () => utilisateur;
      });

      it('dépose le jeton dans un cookie', async () => {
        let idRecu;
        testeur.depotDonnees().utilisateurAFinaliser = async (idReset) => {
          idRecu = idReset;
          return utilisateur;
        };

        const reponse = await axios.get(
          `http://localhost:1234/initialisationMotDePasse/${uuid}`
        );

        expect(idRecu).to.be(uuid);
        await testeur.verifieJetonDepose(reponse, () => {});
      });

      it('sert le contenu HTML de la page', (done) => {
        axios
          .get(`http://localhost:1234/initialisationMotDePasse/${uuid}`)
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.headers['content-type']).to.contain('text/html');
            done();
          })
          .catch(done);
      });
    });

    it("aseptise l'identifiant reçu", (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idReset'],
          `http://localhost:1234/initialisationMotDePasse/${uuid}`,
          done
        );
    });

    it("retourne une erreur HTTP 400 sur idReset n'est pas un UUID valide", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'UUID requis',
        'http://localhost:1234/initialisationMotDePasse/999'
      );
    });

    it('retourne une erreur HTTP 404 si idReset inconnu', async () => {
      testeur.depotDonnees().utilisateurAFinaliser = async () => {};

      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Identifiant d'initialisation de mot de passe inconnu`,
        `http://localhost:1234/initialisationMotDePasse/${uuid}`
      );
    });
  });

  describe('quand requête GET sur `/sitemap.xml`', () => {
    it('sert le contenu XML du fichier', async () => {
      const reponse = await axios.get('http://localhost:1234/sitemap.xml');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('application/xml');
    });
  });

  describe('quand requete GET sur `/creation-compte`', () => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it('retourne une erreur 400 si la signature du token est invalide', async () => {
      testeur.adaptateurJWT().decode = () => {
        throw new Error('Jeton invalide');
      };

      try {
        await axios.get(
          `http://localhost:1234/creation-compte?token=unFauxToken`
        );
        expect().fail("L'appel aurait dû lever une exception");
      } catch (e) {
        expect(e.response.status).to.be(400);
      }
    });

    it('retourne une erreur 400 si le token est vide', async () => {
      try {
        await axios.get('http://localhost:1234/creation-compte?token=');
        expect().fail("L'appel aurait dû lever une exception");
      } catch (e) {
        expect(e.response.status).to.be(400);
      }
    });

    it("ajoute les données de l'organisation quand le siret est fourni", async () => {
      testeur.serviceAnnuaire().rechercheOrganisations = async (siret) =>
        siret === '12P34' ? [{ nom: 'VERT', departement: '33' }] : [];

      testeur.adaptateurJWT().decode = (token) =>
        token === 'unTokenValide' ? { siret: '12P34' } : undefined;

      const reponse = await axios.get(
        `http://localhost:1234/creation-compte?token=unTokenValide`
      );

      expect(
        donneesPartagees(reponse.data, 'informations-professionnelles')
      ).to.eql({
        informationsProfessionnelles: {
          organisation: {
            siret: '12P34',
            departement: '33',
            nom: 'VERT',
          },
        },
      });
    });

    it("n'ajoute pas les données de l'organisation quand le siret n'est pas fourni", async () => {
      testeur.serviceAnnuaire().rechercheOrganisations = async (_) => {
        expect.fail('ne devrait pas appeler cette fonction');
      };

      const reponse = await axios.get(
        `http://localhost:1234/creation-compte?token=unTokenSansSiret`
      );

      expect(
        donneesPartagees(reponse.data, 'informations-professionnelles')
      ).to.eql({
        informationsProfessionnelles: {},
      });
    });

    it("n'ajoute pas les données de l'organisation quand aucune organisation n'est trouvée", async () => {
      testeur.serviceAnnuaire().rechercheOrganisations = async (_) => [];

      const reponse = await axios.get(
        `http://localhost:1234/creation-compte?token=unTokenAvecSiretInconnu`
      );

      expect(
        donneesPartagees(reponse.data, 'informations-professionnelles')
      ).to.eql({
        informationsProfessionnelles: {},
      });
    });

    it('envoie les départements', async () => {
      testeur.referentiel().departements = () => [{ nom: 'Gironde' }];

      const reponse = await axios.get(
        `http://localhost:1234/creation-compte?token=unTokenValide`
      );

      expect(donneesPartagees(reponse.data, 'departements')).to.eql({
        departements: [{ nom: 'Gironde' }],
      });
    });

    it('ajoute les informations provenant du profil Anssi', async () => {
      testeur.adaptateurJWT().decode = () => ({ email: 'jeand@beta.fr' });
      testeur.adaptateurProfilAnssi().recupere = (email) =>
        email === 'jeand@beta.fr'
          ? {
              organisation: { siret: '1234', nom: 'BLEU', departement: '75' },
              telephone: '0607080910',
              domainesSpecialite: ['RSSI', 'DEV'],
            }
          : undefined;

      const reponse = await axios.get(
        `http://localhost:1234/creation-compte?token=unTokenValide`
      );

      expect(
        donneesPartagees(reponse.data, 'informations-professionnelles')
      ).to.eql({
        informationsProfessionnelles: {
          email: 'jeand@beta.fr',
          organisation: {
            siret: '1234',
            departement: '75',
            nom: 'BLEU',
          },
          telephone: '0607080910',
          domainesSpecialite: ['RSSI', 'DEV'],
        },
      });
    });
  });

  describe('quand requête GET sur `/inscription`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/inscription',
          done
        );
    });
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/connexion',
          done
        );
    });

    it('ajoute la redirection', async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/connexion?urlRedirection=/redirige-vers'
      );
      expect(donneesPartagees(reponse.data, 'url-redirection')).to.eql({
        urlRedirection: 'http://localhost:1234/redirige-vers',
      });
    });

    it("n'ajoute pas la redirection si l'url n'est pas valide", async () => {
      const reponse = await requeteSansRedirection(
        'http://localhost:1234/connexion?urlRedirection=uri-invalide'
      );
      expect(donneesPartagees(reponse.data, 'url-redirection')).to.eql({});
    });
  });

  describe('quand requete GET sur `/statistiques`', () => {
    it("utilise l'adaptateur de statistiques pour récupérer les données", async () => {
      let adaptateurAppele = false;
      testeur.adaptateurStatistiques().recupereStatistiques = async () => {
        adaptateurAppele = true;
        return {
          utilisateurs: { nombre: 0, progression: 0 },
          services: { nombre: 0, progression: 0 },
          vulnerabilites: { nombre: 0, progression: 0 },
          indiceCyber: { nombre: 0, progression: 0 },
        };
      };

      const reponse = await axios.get('http://localhost:1234/statistiques');
      expect(reponse.status).to.be(200);
      expect(adaptateurAppele).to.be(true);
    });
  });
});
