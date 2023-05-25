import { gestionnaireTiroir } from './gestionnaireTiroir.mjs';
import tableauDesServices from './tableauDesServices.mjs';
import gestionnaireActionsTiroir from './gestionnaireActionsTiroir.mjs';

const gestionnaireEvenements = {
  brancheComportement: () => {
    $('#recherche-service').on('input', (e) => {
      tableauDesServices.modifieRecherche($(e.target).val());
    });

    $('.tableau-services thead th:not(:first):not(:last)').on('click', (e) => {
      const colonne = $(e.target).data('colonne');
      tableauDesServices.modifieTri(colonne);
    });

    $('.tableau-services').on('click', (e) => {
      const $elementClique = $(e.target);
      if ($elementClique.hasClass('selection-service')) {
        gestionnaireEvenements.selectionneService($elementClique);
      } else if ($elementClique.hasClass('checkbox-selection-tous-services')) {
        gestionnaireEvenements.selectionneTousServices($elementClique);
      } else if ($elementClique.hasClass('action')) {
        gestionnaireEvenements.afficheTiroirAction($elementClique);
      } else if ($elementClique.hasClass('contributeurs')) {
        const idService = $elementClique
          .parents('.ligne-service')
          .data('id-service');
        gestionnaireEvenements.afficheTiroirAction($elementClique, idService);
      } else {
        gestionnaireEvenements.fermeMenuFlottant();
      }
    });

    $('.tiroir .fermeture-tiroir').on('click', () => {
      gestionnaireTiroir.basculeOuvert(false);
    });

    $('#action-duplication').on('click', () => {
      gestionnaireActionsTiroir.duplique();
    });

    $('#action-suppression').on('click', () => {
      gestionnaireActionsTiroir.supprime();
    });

    $('#action-invitation').on('click', () => {
      gestionnaireActionsTiroir.invite();
    });

    $('#action-export-csv').on('click', () => {
      gestionnaireActionsTiroir.exporteCsv();
    });
  },
  afficheTiroirAction: ($action, ...args) => {
    gestionnaireTiroir.afficheContenuAction($action.data('action'), ...args);
    gestionnaireEvenements.fermeMenuFlottant();
  },
  selectionneService: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    const idService = $checkbox.parents('.ligne-service').data('id-service');
    tableauDesServices.basculeSelectionService(idService, selectionne);
    gestionnaireEvenements.fermeMenuFlottant();
    tableauDesServices.afficheEtatSelection();
    gestionnaireTiroir.basculeOuvert(false);
  },
  selectionneTousServices: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    $checkbox.removeClass('selection-partielle');

    $('.selection-service').each((_, input) => {
      const $checkboxService = $(input);
      tableauDesServices.basculeSelectionService(
        $checkboxService.parents('.ligne-service').data('id-service'),
        selectionne
      );
      $checkboxService.prop('checked', selectionne);
    });

    gestionnaireEvenements.fermeMenuFlottant();
    tableauDesServices.afficheEtatSelection();
    gestionnaireTiroir.basculeOuvert(false);
  },
  fermeMenuFlottant: () => {
    $('.action-lien').removeClass('actif');
    $('.conteneur-selection-services').removeClass('actif');
    $('.menu-flotant').addClass('invisible');
  },
};

export default gestionnaireEvenements;
