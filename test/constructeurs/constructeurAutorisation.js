const {
  tousDroitsEnEcriture,
} = require('../../src/modeles/autorisations/gestionDroits');
const AutorisationBase = require('../../src/modeles/autorisations/autorisationBase');

class ConstructeurAutorisation {
  constructor() {
    this.donnees = {
      estProprietaire: false,
      id: '',
      idUtilisateur: '',
      idHomologation: '',
      idService: '',
      droits: {},
    };
  }

  avecId(id) {
    this.donnees.id = id;
    return this;
  }

  deProprietaireDeService(idUtilisateur, idService) {
    this.donnees.estProprietaire = true;
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
    this.donnees.idHomologation = idService;
    return this;
  }

  deContributeurDeService(idUtilisateur, idService) {
    this.donnees.estProprietaire = false;
    this.donnees.idUtilisateur = idUtilisateur;
    this.donnees.idService = idService;
    this.donnees.idHomologation = idService;
    return this;
  }

  avecDroits(droits) {
    this.donnees.droits = droits;
    return this;
  }

  avecTousDroitsEcriture() {
    this.donnees.droits = tousDroitsEnEcriture();
    return this;
  }

  construis() {
    return this.donnees.estProprietaire
      ? AutorisationBase.NouvelleAutorisationProprietaire(this.donnees)
      : AutorisationBase.NouvelleAutorisationContributeur(this.donnees);
  }
}

const uneAutorisation = () => new ConstructeurAutorisation();

module.exports = { uneAutorisation };
