class ServiceSupervision {
  constructor({ depotDonnees, adaptateurSupervision }) {
    if (!depotDonnees || !adaptateurSupervision) {
      throw new Error(
        "Impossible d'instancier le service de supervision sans ses dépendances"
      );
    }
    this.depotDonnees = depotDonnees;
    this.adaptateurSupervision = adaptateurSupervision;
  }

  async delieServiceEtSuperviseurs(idService) {
    await this.adaptateurSupervision.delieServiceDesSuperviseurs(idService);
  }

  async relieServiceEtSuperviseurs(service) {
    const superviseurs = await this.depotDonnees.lisSuperviseurs(
      service.siretDeOrganisation()
    );

    if (!superviseurs.length) return;

    await this.adaptateurSupervision.relieSuperviseursAService(
      service,
      superviseurs
    );
  }
}

module.exports = ServiceSupervision;
