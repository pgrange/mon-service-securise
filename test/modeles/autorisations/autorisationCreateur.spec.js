const expect = require('expect.js');

const AutorisationCreateur = require('../../../src/modeles/autorisations/autorisationCreateur');

describe("Une autorisation d'accès en tant que créateur", () => {
  it("permet d'ajouter un contributeur", () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.permissionAjoutContributeur).to.be(true);
  });

  it('permet de supprimer un contributeur', () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.permissionSuppressionContributeur).to.be(true);
  });

  it('permet de supprimer un service', () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.peutSupprimerService()).to.be(true);
  });

  it("indique que l'utilisateur est propriétaire du service", () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.estProprietaire).to.be(true);
  });
});
