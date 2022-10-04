const Base = require('./base');
const Homologation = require('./homologation');

const {
  ErreurIdentifiantActionSaisieInvalide,
  ErreurIdentifiantActionSaisieManquant,
  ErreurVersionActionSaisieManquante,
} = require('../erreurs');
const Referentiel = require('../referentiel');

class ActionSaisie extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    homologation = new Homologation({})
  ) {
    super({ proprietesAtomiquesRequises: ['id', 'version'] });
    ActionSaisie.valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.homologation = homologation;
    this.referentiel = referentiel;
  }

  description() {
    return this.referentiel.descriptionActionSaisie(this.id);
  }

  suivante() {
    return this.referentiel.actionSuivante(this.id);
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description(),
      statut: this.homologation.statutSaisie(this.id),
    };
  }

  static valide(donnees, referentiel) {
    const { id, version } = donnees;
    if (!id) {
      throw new ErreurIdentifiantActionSaisieManquant(
        "L'identifiant d'action de saisie doit être renseigné"
      );
    }

    if (!version) {
      throw new ErreurVersionActionSaisieManquante(
        "La version d'action de saisie doit être renseignée"
      );
    }

    const identifiants = referentiel.identifiantsActionsSaisie();
    if (!identifiants.includes(id)) {
      throw new ErreurIdentifiantActionSaisieInvalide(
        `L'action de saisie "${id}" est invalide`
      );
    }
  }
}

module.exports = ActionSaisie;
