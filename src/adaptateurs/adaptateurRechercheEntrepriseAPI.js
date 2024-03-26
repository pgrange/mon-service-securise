const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const rechercheOrganisations = (terme, departement) =>
  axios
    .get('https://recherche-entreprises.api.gouv.fr/search', {
      params: {
        q: terme,
        ...(departement && { departement }),
        per_page: 25,
        page: 1,
        limite_matching_etablissements: 1,
        est_entrepreneur_individuel: false,
      },
    })
    .then((reponse) =>
      reponse.data.results
        .filter((r) => r.siege.departement !== null)
        .map((r) => ({
          nom: r.nom_complet,
          departement: r.siege.departement,
          siret: r.siege.siret,
        }))
    )
    .catch((e) => {
      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par API recherche-entreprise': e.response.data,
      });
      return Promise.resolve([]);
    });

module.exports = { rechercheOrganisations };
