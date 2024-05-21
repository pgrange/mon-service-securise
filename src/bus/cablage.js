const EvenementMesuresServiceModifiees = require('./evenementMesuresServiceModifiees');
const {
  EvenementAutorisationsServiceModifiees,
} = require('./evenementAutorisationsServiceModifiees');
const {
  consigneCompletudeDansJournal,
} = require('./abonnements/consigneCompletudeDansJournal');
const {
  envoieTrackingCompletude,
} = require('./abonnements/envoieTrackingDeCompletude');
const EvenementNouveauServiceCree = require('./evenementNouveauServiceCree');
const {
  consigneNouveauServiceDansJournal,
} = require('./abonnements/consigneNouveauServiceDansJournal');
const {
  envoieTrackingDeNouveauService,
} = require('./abonnements/envoieTrackingDeNouveauService');
const {
  consigneProprietaireCreeUnServiceDansJournal,
} = require('./abonnements/consigneProprietaireCreeUnServiceDansJournal');
const {
  consigneAutorisationsModifieesDansJournal,
} = require('./abonnements/consigneAutorisationsModifieesDansJournal');
const {
  EvenementDescriptionServiceModifiee,
} = require('./evenementDescriptionServiceModifiee');
const EvenementUtilisateurModifie = require('./evenementUtilisateurModifie');
const {
  consigneProfilUtilisateurModifieDansJournal,
} = require('./abonnements/consigneProfilUtilisateurModifieDansJournal');
const {
  consigneNouvelUtilisateurInscritDansJournal,
} = require('./abonnements/consigneNouvelUtilisateurInscritDansJournal');
const EvenementUtilisateurInscrit = require('./evenementUtilisateurInscrit');
const EvenementDossierHomologationFinalise = require('./evenementDossierHomologationFinalise');
const {
  consigneNouvelleHomologationCreeeDansJournal,
} = require('./abonnements/consigneNouvelleHomologationCreeeDansJournal');
const EvenementServiceSupprime = require('./evenementServiceSupprime');
const {
  consigneServiceSupprimeDansJournal,
} = require('./abonnements/consigneServiceSupprimeDansJournal');
const {
  sauvegardeNotificationsExpirationHomologation,
} = require('./abonnements/sauvegardeNotificationsExpirationHomologation');
const {
  supprimeNotificationsExpirationHomologation,
} = require('./abonnements/supprimeNotificationsExpirationHomologation');
const {
  envoieMailFelicitationHomologation,
} = require('./abonnements/envoieMailFelicitationHomologation');
const {
  relieEntrepriseEtContactBrevo,
} = require('./abonnements/relieEntrepriseEtContactBrevo');
const CrmBrevo = require('../crm/crmBrevo');

const cableTousLesAbonnes = (
  busEvenements,
  {
    adaptateurHorloge,
    adaptateurTracking,
    adaptateurJournal,
    adaptateurRechercheEntreprise,
    adaptateurMail,
    depotDonnees,
    referentiel,
  }
) => {
  const crmBrevo = new CrmBrevo({
    adaptateurRechercheEntreprise,
    adaptateurMail,
  });

  busEvenements.abonnePlusieurs(EvenementNouveauServiceCree, [
    consigneNouveauServiceDansJournal({ adaptateurJournal }),
    consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal }),
    envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees }),
    consigneCompletudeDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementMesuresServiceModifiees, [
    consigneCompletudeDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementDescriptionServiceModifiee, [
    consigneCompletudeDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonne(
    EvenementAutorisationsServiceModifiees,
    consigneAutorisationsModifieesDansJournal({ adaptateurJournal })
  );

  busEvenements.abonne(
    EvenementUtilisateurModifie,
    consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    })
  );

  busEvenements.abonnePlusieurs(EvenementUtilisateurInscrit, [
    consigneNouvelUtilisateurInscritDansJournal({ adaptateurJournal }),
    consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    }),
    relieEntrepriseEtContactBrevo({ crmBrevo }),
  ]);

  busEvenements.abonnePlusieurs(EvenementDossierHomologationFinalise, [
    consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    }),
    sauvegardeNotificationsExpirationHomologation({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    }),
    envoieMailFelicitationHomologation({ depotDonnees, adaptateurMail }),
  ]);

  busEvenements.abonnePlusieurs(EvenementServiceSupprime, [
    consigneServiceSupprimeDansJournal({ adaptateurJournal }),
    supprimeNotificationsExpirationHomologation({ depotDonnees }),
  ]);
};

module.exports = { cableTousLesAbonnes };
