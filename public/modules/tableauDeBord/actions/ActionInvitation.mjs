import ActionAbstraite from './Action.mjs';
import { declencheValidation } from '../../interactions/validation.mjs';

const estInvitationDejaEnvoyee = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'INVITATION_DEJA_ENVOYEE';

class ActionInvitation extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-invitation', tableauDesServices);
    this.appliqueContenu({
      titre: 'Inviter des contributeurs 1/2',
      texteSimple:
        'Inviter les personnes de votre choix à contribuer à ce service.',
      texteMultiple:
        'Inviter les personnes de votre choix à contribuer à ces services.',
    });
  }

  initialise() {
    $('#email-invitation-collaboration').val('');
    $('#action-invitation').show();
    $('.message-erreur#invitation-deja-envoyee').hide();
    const $loader = $('.conteneur-loader', this.idConteneur);
    $loader.removeClass('visible');
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple, seulementCreateur }) {
    return !estSelectionMultiple && seulementCreateur;
  }

  execute() {
    declencheValidation(this.idConteneur);
    const $emailInvite = $('#email-invitation-collaboration');

    if (!$emailInvite.is(':valid')) return Promise.reject();

    const $loader = $('.conteneur-loader', this.idConteneur);
    $loader.addClass('visible');
    $('#action-invitation').hide();

    const emailContributeur = $emailInvite.val();
    const invitations = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) =>
        axios.post('/api/autorisation', {
          emailContributeur,
          idHomologation: idService,
        })
    );
    return Promise.all(invitations)
      .then(() => this.tableauDesServices.recupereServices())
      .catch((e) => {
        if (estInvitationDejaEnvoyee(e.response)) {
          $('.message-erreur#invitation-deja-envoyee').show();
        }
        $('#action-invitation').show();
        $loader.removeClass('visible');
        throw e;
      });
  }
}

export default ActionInvitation;
