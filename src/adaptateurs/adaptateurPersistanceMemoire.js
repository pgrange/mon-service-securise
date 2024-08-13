const adaptateurHorlogeParDefaut = require('./adaptateurHorloge');

const nouvelAdaptateur = (
  donnees = {},
  adaptateurHorloge = adaptateurHorlogeParDefaut
) => {
  donnees.utilisateurs ||= [];
  donnees.services ||= [];
  donnees.autorisations ||= [];
  donnees.parcoursUtilisateurs ||= [];
  donnees.notificationsExpirationHomologation ||= [];
  donnees.notifications ||= [];
  donnees.suggestionsActions ||= [];

  const metsAJourEnregistrement = (
    fonctionRecherche,
    id,
    donneesAMettreAJour
  ) =>
    fonctionRecherche(id)
      .then((e) => Object.assign(e, donneesAMettreAJour))
      .then(() => {});

  const supprimeEnregistrement = async (nomTable, id) => {
    donnees[nomTable] = donnees[nomTable].filter((e) => e.id !== id);
  };

  const ajouteService = async (id, donneesService, nomServiceHash) => {
    donnees.services.push({ id, ...donneesService, nomServiceHash });
  };

  const ajouteUtilisateur = async (id, donneesUtilisateur, emailHash) => {
    donnees.utilisateurs.push(
      Object.assign(donneesUtilisateur, {
        id,
        dateCreation: adaptateurHorloge.maintenant(),
        emailHash,
      })
    );
  };

  const autorisations = async (idUtilisateur) => {
    const seulementUnUtilisateur = typeof idUtilisateur !== 'undefined';

    const filtre = seulementUnUtilisateur
      ? (a) => a.idUtilisateur === idUtilisateur
      : (a) => a.estProprietaire;

    return donnees.autorisations.filter(filtre);
  };

  const contributeursService = (idService) =>
    donnees.autorisations
      .filter((a) => a.idService === idService)
      .map((a) => donnees.utilisateurs.find((u) => u.id === a.idUtilisateur));

  const suggestionsActionsService = (idService) =>
    donnees.suggestionsActions.filter((s) => s.idService === idService);

  const service = async (id) => {
    const serviceTrouve = donnees.services.find((h) => h.id === id);
    if (serviceTrouve) {
      serviceTrouve.contributeurs = contributeursService(id);
      serviceTrouve.suggestionsActions = suggestionsActionsService(id);
    }

    return serviceTrouve;
  };

  const serviceDeprecated = async (id) => {
    const serviceTrouve = donnees.services.find((s) => s.id === id);
    if (serviceTrouve) serviceTrouve.contributeurs = contributeursService(id);

    return serviceTrouve;
  };

  const services = async (idUtilisateur) => {
    const as = await autorisations(idUtilisateur);
    return Promise.all(as.map(({ idService }) => service(idService)));
  };

  const tousLesServices = async () => {
    const lesIds = donnees.services.map((s) => s.id);
    return lesIds.map(service);
  };

  const serviceAvecNom = (idUtilisateur, nomService, idServiceMisAJour) =>
    services(idUtilisateur).then((lesServices) =>
      lesServices.find(
        (s) =>
          s.id !== idServiceMisAJour &&
          s.descriptionService?.nomService === nomService
      )
    );

  const metsAJourService = (...params) =>
    metsAJourEnregistrement(serviceDeprecated, ...params);

  const sauvegardeAutorisation = async (id, donneesAutorisation) => {
    const dejaConnue = donnees.autorisations.find((a) => a.id === id);

    if (!dejaConnue) donnees.autorisations.push({ id, ...donneesAutorisation });
    else Object.assign(dejaConnue, { ...donneesAutorisation });
  };

  const sauvegardeService = (id, donneesService, nomServiceHash) => {
    const dejaConnu = donnees.services.find((s) => s.id === id) !== undefined;
    return dejaConnu
      ? metsAJourService(id, donneesService)
      : ajouteService(id, donneesService, nomServiceHash);
  };

  const supprimeService = (...params) =>
    supprimeEnregistrement('services', ...params);

  const supprimeServices = async () => {
    donnees.services = [];
  };

  const supprimeUtilisateur = (...params) =>
    supprimeEnregistrement('utilisateurs', ...params);

  const supprimeUtilisateurs = async () => {
    donnees.utilisateurs = [];
  };

  const utilisateur = async (id) =>
    donnees.utilisateurs.find((u) => u.id === id);

  const metsAJourIdResetMdpUtilisateur = async (id, idResetMotDePasse) => {
    const u = await utilisateur(id);
    Object.assign(u, { idResetMotDePasse });
  };

  const metsAJourUtilisateur = (id, donneesAMettreAJour, emailHash) =>
    utilisateur(id)
      .then((e) => Object.assign(e, donneesAMettreAJour))
      .then((e) => emailHash && Object.assign(e, { emailHash }))
      .then(() => {});

  const utilisateurAvecEmailHash = async (emailHash) =>
    donnees.utilisateurs.find((u) => u.emailHash === emailHash);

  const utilisateurAvecIdReset = async (idReset) =>
    donnees.utilisateurs.find((u) => u.idResetMotDePasse === idReset);

  const tousUtilisateurs = async () => donnees.utilisateurs;

  const autorisation = async (id) =>
    donnees.autorisations.find((a) => a.id === id);

  const autorisationsDuService = async (idService) =>
    donnees.autorisations.filter((a) => a.idService === idService);

  const autorisationPour = async (idUtilisateur, idService) =>
    donnees.autorisations.find(
      (a) => a.idUtilisateur === idUtilisateur && a.idService === idService
    );

  const ajouteAutorisation = async (id, donneesAutorisation) => {
    donnees.autorisations.push(Object.assign(donneesAutorisation, { id }));
  };

  const nbAutorisationsProprietaire = async (idUtilisateur) =>
    donnees.autorisations.filter(
      (a) => a.idUtilisateur === idUtilisateur && a.estProprietaire
    ).length;

  const supprimeAutorisation = async (idUtilisateur, idService) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idUtilisateur !== idUtilisateur || a.idService !== idService
    );
  };

  const supprimeAutorisations = async () => {
    donnees.autorisations = [];
  };

  const supprimeAutorisationsContribution = async (idUtilisateur) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idUtilisateur !== idUtilisateur || a.estProprietaire
    );
  };

  const supprimeAutorisationsHomologation = async (idService) => {
    donnees.autorisations = donnees.autorisations.filter(
      (a) => a.idService !== idService
    );
  };

  const lisParcoursUtilisateur = async (id) =>
    donnees.parcoursUtilisateurs.find((p) => p.id === id);

  const sauvegardeParcoursUtilisateur = async (
    id,
    donneesParcoursUtilisateur
  ) => {
    const dejaConnu = donnees.parcoursUtilisateurs.find((p) => p.id === id);

    if (!dejaConnu)
      donnees.parcoursUtilisateurs.push({ id, ...donneesParcoursUtilisateur });
    else Object.assign(dejaConnu, { ...donneesParcoursUtilisateur });
  };

  const rechercheContributeurs = async (idUtilisateur, recherche) => {
    const idServices = donnees.autorisations
      .filter((a) => a.idUtilisateur === idUtilisateur && a.estProprietaire)
      .map((a) => a.idService);
    const idUniquesContributeurs = donnees.autorisations.filter(
      (a) => idServices.includes(a.idService) && !a.estProprietaire
    );
    const tousContributeurs = donnees.utilisateurs.filter((u) =>
      idUniquesContributeurs.includes(u.id)
    );

    const rechercheMinuscule = recherche.toLowerCase();
    return tousContributeurs.filter(
      (c) =>
        c.email.toLowerCase().includes(rechercheMinuscule) ||
        c.prenom?.toLowerCase().includes(rechercheMinuscule) ||
        c.nom?.toLowerCase().includes(rechercheMinuscule)
    );
  };

  const lisNotificationsExpirationHomologationDansIntervalle = async (
    debut,
    fin
  ) => {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    return donnees.notificationsExpirationHomologation.filter(
      (n) => dateDebut <= n.dateProchainEnvoi && n.dateProchainEnvoi < dateFin
    );
  };

  const sauvegardeNotificationsExpirationHomologation = async (
    notifications
  ) => {
    donnees.notificationsExpirationHomologation = [
      ...donnees.notificationsExpirationHomologation,
      ...notifications,
    ];
  };

  const supprimeNotificationsExpirationHomologation = async (ids) => {
    donnees.notificationsExpirationHomologation =
      donnees.notificationsExpirationHomologation.filter(
        (n) => !ids.includes(n.id)
      );
  };

  const supprimeNotificationsExpirationHomologationPourService = async (
    idService
  ) => {
    donnees.notificationsExpirationHomologation =
      donnees.notificationsExpirationHomologation.filter(
        (n) => n.idService !== idService
      );
  };

  const marqueNouveauteLue = async (idUtilisateur, idNouveaute) => {
    donnees.notifications[`${idUtilisateur}-${idNouveaute}`] = {
      idUtilisateur,
      idNouveaute,
    };
  };

  const nouveautesPourUtilisateur = async (idUtilisateur) =>
    Object.entries(donnees.notifications)
      .filter(([_cle, valeur]) => valeur.idUtilisateur === idUtilisateur)
      .map((_cle, valeur) => valeur.idNouveaute);

  const tachesDeServicePour = async () => [];

  const marqueTacheDeServiceLue = async () => {};

  const marqueSuggestionActionFaiteMaintenant = async () => {};

  const ajouteSuggestionAction = async () => {};

  const ajouteTacheDeService = async () => {};

  return {
    ajouteAutorisation,
    ajouteSuggestionAction,
    ajouteTacheDeService,
    ajouteUtilisateur,
    autorisation,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    service,
    serviceAvecNom,
    services,
    lisNotificationsExpirationHomologationDansIntervalle,
    lisParcoursUtilisateur,
    marqueNouveauteLue,
    marqueSuggestionActionFaiteMaintenant,
    marqueTacheDeServiceLue,
    metsAJourIdResetMdpUtilisateur,
    metsAJourUtilisateur,
    nbAutorisationsProprietaire,
    nouveautesPourUtilisateur,
    rechercheContributeurs,
    sauvegardeAutorisation,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeParcoursUtilisateur,
    sauvegardeService,
    serviceDeprecated,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeService,
    supprimeServices,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    tachesDeServicePour,
    tousLesServices,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmailHash,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
