const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const adaptateurUUIDParDefaut = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesHomologations = require('./depots/depotDonneesHomologations');
const depotDonneesNotificationsExpirationHomologation = require('./depots/depotDonneesNotificationsExpirationHomologation');
const depotDonneesParcoursUtilisateurs = require('./depots/depotDonneesParcoursUtilisateur');
const depotDonneesUtilisateurs = require('./depots/depotDonneesUtilisateurs');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    referentiel = Referentiel.creeReferentiel(),
    adaptateurRechercheEntite,
    busEvenements,
  } = config;

  const depotHomologations = depotDonneesHomologations.creeDepot({
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    busEvenements,
    referentiel,
  });

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurChiffrement,
    adaptateurJWT,
    adaptateurPersistance,
    adaptateurUUID,
    depotHomologations,
    busEvenements,
    adaptateurRechercheEntite,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance,
    adaptateurUUID,
    depotHomologations,
    depotUtilisateurs,
    busEvenements,
  });

  const depotParcoursUtilisateurs = depotDonneesParcoursUtilisateurs.creeDepot({
    adaptateurPersistance,
    referentiel,
  });

  const depotNotificationsExpirationHomologation =
    depotDonneesNotificationsExpirationHomologation.creeDepot({
      adaptateurPersistance,
      adaptateurUUID,
    });

  const {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAuService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    homologation,
    serviceExiste,
    homologations,
    enregistreDossier,
    metsAJourService,
    nouveauService,
    remplaceRisquesSpecifiquesDuService,
    supprimeHomologation,
    tousLesServices,
  } = depotHomologations;

  const {
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeUtilisateur,
    tousUtilisateurs,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
    verifieMotDePasse,
  } = depotUtilisateurs;

  const {
    accesAutorise,
    ajouteContributeurAuService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    sauvegardeAutorisation,
    supprimeContributeur,
  } = depotAutorisations;

  const { lisParcoursUtilisateur, sauvegardeParcoursUtilisateur } =
    depotParcoursUtilisateurs;

  const {
    lisNotificationsExpirationHomologationEnDate,
    sauvegardeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
  } = depotNotificationsExpirationHomologation;

  return {
    accesAutorise,
    ajouteContributeurAuService,
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesuresAuService,
    ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    dupliqueService,
    homologation,
    serviceExiste,
    homologations,
    enregistreDossier,
    finaliseDossierCourant,
    lisNotificationsExpirationHomologationEnDate,
    lisParcoursUtilisateur,
    metsAJourMotDePasse,
    metsAJourUtilisateur,
    metsAJourService,
    nouveauService,
    nouvelUtilisateur,
    reinitialiseMotDePasse,
    remplaceRisquesSpecifiquesDuService,
    sauvegardeAutorisation,
    sauvegardeParcoursUtilisateur,
    sauvegardeNotificationsExpirationHomologation,
    supprimeContributeur,
    supprimeHomologation,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeUtilisateur,
    tousUtilisateurs,
    tousLesServices,
    utilisateur,
    utilisateurAFinaliser,
    utilisateurAuthentifie,
    utilisateurExiste,
    utilisateurAvecEmail,
    valideAcceptationCGUPourUtilisateur,
    verifieMotDePasse,
  };
};

module.exports = { creeDepot };
