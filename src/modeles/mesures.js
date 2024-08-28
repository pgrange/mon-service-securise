const InformationsService = require('./informationsService');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');
const {
  StatistiquesMesuresGenerales,
} = require('./statistiquesMesuresGenerales');
const { IndiceCyber } = require('./indiceCyber');
const { CompletudeMesures } = require('./completudeMesures');

function mesuresGeneralesApplicables(
  mesuresPersonnalisees,
  mesuresGenerales,
  referentiel
) {
  const idMesuresPersonnalisees = Object.keys(mesuresPersonnalisees);
  const donneesMesuresGeneralesApplicables = idMesuresPersonnalisees.map(
    (id) => ({ id, ...mesuresGenerales.avecId(id) })
  );
  return new MesuresGenerales(
    { mesuresGenerales: donneesMesuresGeneralesApplicables },
    referentiel
  );
}

class Mesures extends InformationsService {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    mesuresPersonnalisees = {}
  ) {
    super({
      listesAgregats: {
        mesuresGenerales: MesuresGenerales,
        mesuresSpecifiques: MesuresSpecifiques,
      },
    });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
    this.mesuresPersonnalisees = mesuresPersonnalisees;
  }

  completude() {
    return new CompletudeMesures({
      statistiquesMesuresGenerales: this.statistiquesMesuresGenerales(),
      mesuresSpecifiques: this.mesuresSpecifiques,
    });
  }

  indiceCyber() {
    return new IndiceCyber(
      this.statistiquesMesuresGenerales().totauxParTypeEtParCategorie(),
      this.referentiel
    ).indiceCyber();
  }

  indiceCyberPersonnalise() {
    return new IndiceCyber(
      this.statistiquesMesures().totauxParTypeEtParCategorie(),
      this.referentiel
    ).indiceCyber();
  }

  nombreMesuresPersonnalisees() {
    return Object.keys(this.mesuresPersonnalisees).length;
  }

  nombreMesuresSpecifiques() {
    return this.mesuresSpecifiques.nombre();
  }

  nombreTotalMesuresGenerales() {
    return this.nombreMesuresPersonnalisees();
  }

  metsAJourMesuresSpecifiques(mesures) {
    this.mesuresSpecifiques = mesures;
  }

  parStatutEtCategorie() {
    const applicables = mesuresGeneralesApplicables(
      this.mesuresPersonnalisees,
      this.mesuresGenerales,
      this.referentiel
    );

    const mesuresGeneralesParStatut = applicables.parStatutEtCategorie();
    return this.mesuresSpecifiques.parStatutEtCategorie(
      mesuresGeneralesParStatut
    );
  }

  statutSaisie() {
    const applicables = mesuresGeneralesApplicables(
      this.mesuresPersonnalisees,
      this.mesuresGenerales,
      this.referentiel
    );

    const generalesSontCompletes =
      applicables.statutSaisie() === Mesures.COMPLETES;
    const specifiquesCompletes =
      this.mesuresSpecifiques.statutSaisie() === Mesures.COMPLETES ||
      this.mesuresSpecifiques.nombre() === 0;

    return generalesSontCompletes && specifiquesCompletes
      ? Mesures.COMPLETES
      : Mesures.A_COMPLETER;
  }

  enrichiesAvecDonneesPersonnalisees() {
    const mesuresEnrichies = Object.entries(this.mesuresPersonnalisees).reduce(
      (acc, mesurePersonnalisee) => {
        const [id, donnees] = mesurePersonnalisee;
        let generale = this.mesuresGenerales.avecId(id);
        if (generale) {
          generale = generale.toJSON();
          delete generale.id;
        }

        return {
          ...acc,
          [id]: { ...donnees, ...(generale && { ...generale }) },
        };
      },
      {}
    );

    return {
      mesuresGenerales: mesuresEnrichies,
      mesuresSpecifiques: this.mesuresSpecifiques.toJSON(),
    };
  }

  statistiquesMesuresGenerales() {
    return new StatistiquesMesuresGenerales(
      {
        mesuresGenerales: this.mesuresGenerales,
        mesuresPersonnalisees: this.mesuresPersonnalisees,
      },
      this.referentiel
    );
  }

  statistiquesMesures() {
    return new StatistiquesMesuresGenerales(
      {
        mesuresGenerales: this.mesuresGenerales,
        mesuresPersonnalisees: this.mesuresPersonnalisees,
        mesuresSpecifiques: this.mesuresSpecifiques.items,
      },
      this.referentiel,
      true
    );
  }

  supprimeResponsable(idUtilisateur) {
    this.mesuresGenerales.supprimeResponsable(idUtilisateur);
    this.mesuresSpecifiques.supprimeResponsable(idUtilisateur);
  }
}

module.exports = Mesures;
