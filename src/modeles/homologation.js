const Referentiel = require('../referentiel');
const AvisExpertCyber = require('./avisExpertCyber');
const CaracteristiquesComplementaires = require('./caracteristiquesComplementaires');
const Mesure = require('./mesure');
const PartiesPrenantes = require('./partiesPrenantes');
const Risque = require('./risque');

class Homologation {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    const {
      id = '',
      idUtilisateur,
      nomService,
      natureService = [],
      provenanceService,
      dejaMisEnLigne,
      fonctionnalites,
      donneesCaracterePersonnel,
      delaiAvantImpactCritique,
      presenceResponsable,
      mesures = [],
      caracteristiquesComplementaires = {},
      partiesPrenantes = {},
      risques = [],
      avisExpertCyber = {},
    } = donnees;

    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.nomService = nomService;
    this.natureService = natureService;
    this.provenanceService = provenanceService;
    this.dejaMisEnLigne = dejaMisEnLigne;
    this.fonctionnalites = fonctionnalites;
    this.donneesCaracterePersonnel = donneesCaracterePersonnel;
    this.delaiAvantImpactCritique = delaiAvantImpactCritique;
    this.presenceResponsable = presenceResponsable;
    this.mesures = mesures.map((donneesMesure) => new Mesure(donneesMesure, referentiel));
    this.caracteristiquesComplementaires = new CaracteristiquesComplementaires(
      caracteristiquesComplementaires, referentiel,
    );
    this.partiesPrenantes = new PartiesPrenantes(partiesPrenantes);
    this.risques = risques.map((donneesRisque) => new Risque(donneesRisque, referentiel));
    this.avisExpertCyber = new AvisExpertCyber(avisExpertCyber);

    this.referentiel = referentiel;
  }

  descriptionNatureService() { return this.referentiel.natureService(this.natureService); }

  descriptionEquipePreparation() {
    return this.partiesPrenantes.descriptionEquipePreparation();
  }

  descriptionAutoriteHomologation() {
    return this.partiesPrenantes.descriptionAutoriteHomologation();
  }

  localisationDonnees() {
    return this.caracteristiquesComplementaires.descriptionLocalisationDonnees();
  }

  hebergeur() { return this.caracteristiquesComplementaires.descriptionHebergeur(); }

  presentation() { return this.caracteristiquesComplementaires.presentation; }

  structureDeveloppement() { return this.caracteristiquesComplementaires.structureDeveloppement; }

  autoriteHomologation() { return this.partiesPrenantes.autoriteHomologation; }

  fonctionAutoriteHomologation() { return this.partiesPrenantes.fonctionAutoriteHomologation; }

  piloteProjet() { return this.partiesPrenantes.piloteProjet; }

  expertCybersecurite() { return this.partiesPrenantes.expertCybersecurite; }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
