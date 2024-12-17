const adaptateurJWTParDefaut = require('./adaptateurs/adaptateurJWT');
const { fabriqueAdaptateurUUID } = require('./adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('./adaptateurs/fabriqueAdaptateurPersistance');
const Referentiel = require('./referentiel');
const depotDonneesAutorisations = require('./depots/depotDonneesAutorisations');
const depotDonneesServices = require('./depots/depotDonneesServices');
const depotDonneesNotificationsExpirationHomologation = require('./depots/depotDonneesNotificationsExpirationHomologation');
const depotDonneesParcoursUtilisateurs = require('./depots/depotDonneesParcoursUtilisateur');
const depotDonneesUtilisateurs = require('./depots/depotDonneesUtilisateurs');
const depotDonneesNotifications = require('./depots/depotDonneesNotifications');
const depotDonneesSuggestionsActions = require('./depots/depotDonneesSuggestionsActions');
const depotDonneesActivitesMesure = require('./depots/depotDonneesActivitesMesure');
const depotDonneesEvolutionsIndiceCyber = require('./depots/depotDonneesEvolutionsIndiceCyber');
const depotDonneesSuperviseurs = require('./depots/depotDonneesSuperviseurs');
const depotDonneesParrainages = require('./depots/depotDonneesParrainages');

const {
  fabriqueAdaptateurChiffrement,
} = require('./adaptateurs/fabriqueAdaptateurChiffrement');
const {
  fabriqueAdaptateurProfilAnssi,
} = require('./adaptateurs/fabriqueAdaptateurProfilAnssi');

const creeDepot = (config = {}) => {
  const {
    adaptateurChiffrement = fabriqueAdaptateurChiffrement(),
    adaptateurEnvironnement,
    adaptateurJWT = adaptateurJWTParDefaut,
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    referentiel = Referentiel.creeReferentiel(),
    adaptateurRechercheEntite,
    busEvenements,
    serviceCgu,
  } = config;

  const depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
    adaptateurChiffrement,
    adaptateurEnvironnement,
    adaptateurJWT,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    adaptateurProfilAnssi: fabriqueAdaptateurProfilAnssi(),
    busEvenements,
    serviceCgu,
  });

  const depotServices = depotDonneesServices.creeDepot({
    adaptateurChiffrement,
    adaptateurPersistance,
    adaptateurUUID,
    adaptateurRechercheEntite,
    depotDonneesUtilisateurs: depotUtilisateurs,
    busEvenements,
    referentiel,
  });

  const depotAutorisations = depotDonneesAutorisations.creeDepot({
    adaptateurPersistance,
    adaptateurUUID,
    depotServices,
    depotUtilisateurs,
    busEvenements,
  });

  const depotParcoursUtilisateurs = depotDonneesParcoursUtilisateurs.creeDepot({
    adaptateurPersistance,
    referentiel,
    busEvenements,
  });

  const depotNotificationsExpirationHomologation =
    depotDonneesNotificationsExpirationHomologation.creeDepot({
      adaptateurPersistance,
      adaptateurUUID,
    });

  const depotNotifications = depotDonneesNotifications.creeDepot({
    adaptateurPersistance,
    depotServices,
  });

  const depotSuggestionsActions = depotDonneesSuggestionsActions.creeDepot({
    adaptateurPersistance,
  });

  const depotActivitesMesure = depotDonneesActivitesMesure.creeDepot({
    adaptateurPersistance,
  });

  const depotEvolutionsIndiceCyber =
    depotDonneesEvolutionsIndiceCyber.creeDepot({
      adaptateurPersistance,
    });

  const depotSuperviseurs = depotDonneesSuperviseurs.creeDepot({
    adaptateurPersistance,
    adaptateurRechercheEntite,
  });

  const depotParrainages = depotDonneesParrainages.creeDepot({
    adaptateurPersistance,
  });

  const {
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesureSpecifiqueAuService,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
    ajouteRolesResponsabilitesAService,
    dupliqueService,
    finaliseDossierCourant,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourRisqueSpecifiqueDuService,
    metsAJourService,
    nombreServices,
    nouveauService,
    rechercheContributeurs,
    supprimeService,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    tousLesServices,
    tousLesServicesAvecSiret,
  } = depotServices;

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

  const {
    lisParcoursUtilisateur,
    sauvegardeParcoursUtilisateur,
    enregistreNouvelleConnexionUtilisateur,
  } = depotParcoursUtilisateurs;

  const {
    marqueNouveauteLue,
    marqueTacheDeServiceLue,
    nouveautesPourUtilisateur,
    tachesDesServices,
  } = depotNotifications;

  const {
    lisNotificationsExpirationHomologationEnDate,
    sauvegardeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
  } = depotNotificationsExpirationHomologation;

  const { acquitteSuggestionAction } = depotSuggestionsActions;

  const { ajouteActiviteMesure, lisActivitesMesure } = depotActivitesMesure;

  const { lisDernierIndiceCyber, sauvegardeNouvelIndiceCyber } =
    depotEvolutionsIndiceCyber;

  const {
    ajouteSiretAuSuperviseur,
    estSuperviseur,
    superviseur,
    lisSuperviseurs,
  } = depotSuperviseurs;

  const { ajouteParrainage, parrainagePour, metsAJourParrainage } =
    depotParrainages;

  const santeDuDepot = async () => {
    await adaptateurPersistance.sante();
  };

  return {
    accesAutorise,
    acquitteSuggestionAction,
    ajouteActiviteMesure,
    ajouteContributeurAuService,
    ajouteDescriptionService,
    ajouteDossierCourantSiNecessaire,
    ajouteMesureSpecifiqueAuService,
    ajouteParrainage,
    ajouteRisqueGeneralAService,
    ajouteRisqueSpecifiqueAService,
    ajouteRolesResponsabilitesAService,
    ajouteSiretAuSuperviseur,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    dupliqueService,
    estSuperviseur,
    service,
    serviceExiste,
    services,
    enregistreDossier,
    finaliseDossierCourant,
    lisActivitesMesure,
    lisDernierIndiceCyber,
    lisNotificationsExpirationHomologationEnDate,
    lisParcoursUtilisateur,
    lisSuperviseurs,
    marqueNouveauteLue,
    marqueTacheDeServiceLue,
    metsAJourMotDePasse,
    metsAJourMesureGeneraleDuService,
    metsAJourMesureSpecifiqueDuService,
    metsAJourParrainage,
    metsAJourRisqueSpecifiqueDuService,
    metsAJourUtilisateur,
    metsAJourService,
    nombreServices,
    nouveauService,
    nouveautesPourUtilisateur,
    nouvelUtilisateur,
    parrainagePour,
    reinitialiseMotDePasse,
    rechercheContributeurs,
    santeDuDepot,
    sauvegardeAutorisation,
    sauvegardeParcoursUtilisateur,
    sauvegardeNouvelIndiceCyber,
    enregistreNouvelleConnexionUtilisateur,
    sauvegardeNotificationsExpirationHomologation,
    superviseur,
    supprimeContributeur,
    supprimeMesureSpecifiqueDuService,
    supprimeRisqueSpecifiqueDuService,
    supprimeService,
    supprimeIdResetMotDePassePourUtilisateur,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeUtilisateur,
    tachesDesServices,
    tousUtilisateurs,
    tousLesServices,
    tousLesServicesAvecSiret,
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
