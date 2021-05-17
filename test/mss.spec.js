const axios = require('axios');
const expect = require('expect.js');
const MSS = require('../src/mss');

describe('Le serveur MSS', () => {
  const serveur = MSS.creeServeur();

  before((done) => { serveur.ecoute(1234, done); });

  after(() => { serveur.arreteEcoute(); });

  it('sert des pages HTML', (done) => {
    axios.get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((error) => done(error));
  });
});
