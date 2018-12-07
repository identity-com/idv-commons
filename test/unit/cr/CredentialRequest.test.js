const CredentialRequestManager = require('../../../src/cr/CredentialRequestManager');
const { CredentialRequest, CR_TYPES, CR_STATUSES } = require('../../../src/cr/CredentialRequest');

const options = {
  mode: 'server', // 'client'
  serverConfig: {
    idvDid: 'did:ethr:000000',
    credentialRequestType: CR_TYPES.INTERACTIVE,
    anchorService: { // For the CredentialCommons AnchorService
      // pluginImpl: genericAnchorPlugin,
      pluginConfig: {
        attestationService: '',
        attestationServiceAuthHeader: '',
        userKeychain: { prv: 'xprv' },
      },
    },
  },
  clientConfig: {
    services: {
      baseUrl: 'http://base.url/someroute',
      paths: {
        CREDENTIAL_REQUEST: '/credential-requests',
      },
    },
  },
};

describe('CredentialRequest', () => {
  let crManager;
  beforeAll(() => {
    crManager = new CredentialRequestManager(options);
  });

  it('createCredentialRequest', () => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);
    expect(crTest).toBeDefined();
    // console.log(JSON.stringify(crTest, null, 2));

    expect(crTest.id).toBeDefined();
    expect(crTest.credentialIdentifier).toEqual('cvc:Credential:PhoneNumber');
    expect(crTest.idv).toEqual(options.serverConfig.idvDid);
    expect(crTest.status).toEqual(CR_STATUSES.PENDING);
    expect(crTest.createdOn).toBeDefined();
    expect(crTest.updatedOn).toBeDefined();
    expect(crTest.type).toEqual(options.serverConfig.credentialRequestType);
    expect(crTest.acceptedUcas).toBeNull();
    expect(crTest.credentialId).toBeNull();
  });

  it('CR.fromJSON', () => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);
    expect(crTest).toBeDefined();

    const crTestJSON = JSON.parse(JSON.stringify(crTest));
    // console.log(JSON.stringify(crTestJSON, null, 2));

    const crTestFromJSON = CredentialRequest.fromJSON(crTestJSON);

    expect(crTest.id).toEqual(crTestFromJSON.id);
    expect(crTest.credentialIdentifier).toEqual(crTestFromJSON.credentialIdentifier);
    expect(crTest.idv).toEqual(crTestFromJSON.idv);
    expect(crTest.status).toEqual(crTestFromJSON.status);
    expect(crTest.createdOn).toEqual(crTestFromJSON.createdOn);
    expect(crTest.updatedOn).toEqual(crTestFromJSON.updatedOn);
    expect(crTest.type).toEqual(crTestFromJSON.type);
    expect(crTest.acceptedUcas).toEqual(crTestFromJSON.acceptedUcas);
    expect(crTest.credentialId).toEqual(crTestFromJSON.credentialId);
  });

  it('acceptUcas - success', () => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);

    const ucasForCredential = [
      {
        identifier: 'cvc:Contact:phoneNumber',
        value: {
          country: 'BR',
          countryCode: '55',
          number: '31988889999',
          lineType: 'mobile',
        },
      },
    ];

    try {
      crTest.acceptUcas(ucasForCredential);
      // console.log(JSON.stringify(crTest, null, 2));
      expect(crTest.status).toEqual(CR_STATUSES.ACCEPTED);
      expect(crTest.acceptedUcas).toBeDefined();
      expect(crTest.credentialId).toBeNull();
    } catch (err) {
      // console.log(err);
      expect(err).not.toBeDefined();
    }
  });

  it('acceptUcas - failure on ucas', () => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);

    const ucasForCredential = [
      {
        identifier: 'cvc:Contact:phoneNumber',
        value: {
          country: { v: 'BR' },
          countryCode: '55',
          number: '31988889999',
          lineType: 'mobile',
        },
      },

    ];

    try {
      crTest.acceptUcas(ucasForCredential);
      // console.log(JSON.stringify(cr1, null, 2));
      expect(crTest.status).toEqual(CR_STATUSES.PENDING);
      expect(crTest.credentialId).toBeNull();
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  // SKIP because nowadays VC dosent support UCA validation
  it.skip('acceptUcas - failure with wrong UCA for VC', async (done) => {
    const credentialIdentifier = 'cvc:Credential:Email';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);

    const ucasForCredentialOtherCredential = [
      {
        identifier: 'cvc:Contact:phoneNumber',
        value: {
          country: 'BR',
          countryCode: '55',
          number: '31988889999',
          lineType: 'mobile',
        },
      },
    ];

    try {
      crTest.acceptUcas(ucasForCredentialOtherCredential);
    } catch (err) {
      console.log(err);
      expect(err).toBeDefined();
      done();
    }
  });

  it('createCredential - success', async (done) => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);

    const ucasForCredential = [
      {
        identifier: 'cvc:Contact:phoneNumber',
        value: {
          country: 'BR',
          countryCode: '55',
          number: '31988889999',
          lineType: 'mobile',
        },
      },
    ];

    crTest.acceptUcas(ucasForCredential);
    expect(crTest.status).toEqual(CR_STATUSES.ACCEPTED);

    const credential = crTest.createCredential();

    expect(crTest.status).toEqual(CR_STATUSES.ACCEPTED);

    expect(credential).toBeDefined();
    expect(credential.id).toEqual(crTest.credentialId);
    expect(credential.issuer).toEqual(crTest.idv);
    expect(credential.identifier).toEqual(crTest.credentialIdentifier);
    expect(credential.claim).toBeDefined();
    expect(credential.proof).toBeDefined();
    expect(credential.proof.type).toEqual('CvcMerkleProof2018');
    expect(credential.proof.merkleRoot).toBeDefined();
    done();
  });


  it('anchorCredential - success', async (done) => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);

    const ucasForCredential = [
      {
        identifier: 'cvc:Contact:phoneNumber',
        value: {
          country: 'BR',
          countryCode: '55',
          number: '31988889999',
          lineType: 'mobile',
        },
      },
    ];

    crTest.acceptUcas(ucasForCredential);
    expect(crTest.status).toEqual(CR_STATUSES.ACCEPTED);

    const credentialObj = JSON.parse(JSON.stringify(crTest.createCredential()));
    const credential = await crTest.anchorCredential(credentialObj);

    expect(crTest.status).toEqual(CR_STATUSES.ISSUED);
    expect(credential).toBeDefined();
    expect(credential.id).toEqual(crTest.credentialId);
    expect(credential.issuer).toEqual(crTest.idv);
    expect(credential.identifier).toEqual(crTest.credentialIdentifier);
    expect(credential.claim).toBeDefined();
    expect(credential.proof).toBeDefined();
    expect(credential.proof.type).toEqual('CvcMerkleProof2018');
    expect(credential.proof.merkleRoot).toBeDefined();
    done();
  });


  it('anchorCredential - error', async (done) => {
    const credentialIdentifier = 'cvc:Credential:PhoneNumber';
    const crTest = crManager.createCredentialRequest(credentialIdentifier);

    const ucasForCredential = [
      {
        identifier: 'cvc:Contact:phoneNumber',
        value: {
          country: 'BR',
          countryCode: '55',
          number: '31988889999',
          lineType: 'mobile',
        },
      },
    ];

    crTest.acceptUcas(ucasForCredential);
    crTest.acceptedUcas = null;
    const credentialObj = JSON.parse(JSON.stringify(crTest.createCredential()));

    try {
      const credential = await crTest.anchorCredential(credentialObj);
      expect(credential).not.toBeDefined();
    } catch (err) {
      expect(err).toBeDefined();
      expect(crTest.status).toEqual(CR_STATUSES.ACCEPTED);
      done();
    }
  });
});
