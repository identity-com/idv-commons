const { expect } = require('chai');

const CredentialRequestManager = require('../../../src/cr/CredentialRequestManager');
const {
  CredentialRequest,
  CredentialRequestType,
  CredentialRequestStatus,
} = require('../../../src/cr/CredentialRequest');

const options = {
  mode: 'server', // 'client'
  serverConfig: {
    idvDid: 'did:ethr:000000',
    credentialRequestType: CredentialRequestType.INTERACTIVE,
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
  before(() => {
    crManager = new CredentialRequestManager(options);
  });

  it('createCredentialRequest', () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);
    expect(crTest).to.exist;

    expect(crTest.id).to.exist;
    expect(crTest.credentialItem).to.equal('credential-cvc:PhoneNumber-v1');
    expect(crTest.idv).to.equal(options.serverConfig.idvDid);
    expect(crTest.status).to.equal(CredentialRequestStatus.PENDING);
    expect(crTest.type).to.equal(options.serverConfig.credentialRequestType);
    expect(crTest.acceptedClaims).to.be.null;
    expect(crTest.credentialId).to.be.null;
  });

  it('createCredentialRequest with scopeRequestId', () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const scopeRequestId = 'someSRid';
    const crTest = crManager.createCredentialRequest(credentialItem, scopeRequestId);
    expect(crTest).to.exist;

    expect(crTest.id).to.exist;
    expect(crTest.credentialItem).to.equal('credential-cvc:PhoneNumber-v1');
    expect(crTest.scopeRequestId).to.equal('someSRid');
    expect(crTest.idv).to.equal(options.serverConfig.idvDid);
    expect(crTest.status).to.equal(CredentialRequestStatus.PENDING);
    expect(crTest.type).to.equal(options.serverConfig.credentialRequestType);
    expect(crTest.acceptedClaims).to.be.null;
    expect(crTest.credentialId).to.be.null;
  });

  it('CR.fromJSON', () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);
    expect(crTest).to.exist;

    const crTestJSON = JSON.parse(JSON.stringify(crTest));
    // console.log(JSON.stringify(crTestJSON, null, 2));

    const crTestFromJSON = CredentialRequest.fromJSON(crTestJSON);

    expect(crTest.id).to.equal(crTestFromJSON.id);
    expect(crTest.credentialItem).to.equal(crTestFromJSON.credentialItem);
    expect(crTest.idv).to.equal(crTestFromJSON.idv);
    expect(crTest.status).to.equal(crTestFromJSON.status);
    expect(crTest.type).to.equal(crTestFromJSON.type);
    expect(crTest.acceptedClaims).to.equal(crTestFromJSON.acceptedClaims);
    expect(crTest.credentialId).to.equal(crTestFromJSON.credentialId);
  });

  it('acceptClaims - success', async () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);

    const claimsForCredential = [
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
      await crTest.acceptClaims(claimsForCredential);
      // console.log(JSON.stringify(crTest, null, 2));
      expect(crTest.status).to.equal(CredentialRequestStatus.ACCEPTED);
      expect(crTest.acceptedClaims).to.exist;
      expect(crTest.credentialId).to.be.null;
    } catch (err) {
      // console.log(err);
      expect(err).not.to.exist;
    }
  });

  it('acceptClaims - failure on claims', () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);

    const claimsForCredential = [
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
      crTest.acceptClaims(claimsForCredential);
      // console.log(JSON.stringify(cr1, null, 2));
      expect(crTest.status).to.equal(CredentialRequestStatus.PENDING);
      expect(crTest.credentialId).to.be.null;
    } catch (err) {
      expect(err).to.exist;
    }
  });

  // SKIP because, at the moment, VC dosent support Claim validation
  it.skip('acceptClaims - failure with wrong Claim for VC', async () => {
    const credentialItem = 'cvc:Credential:Email';
    const crTest = crManager.createCredentialRequest(credentialItem);

    const claimsForCredentialOtherCredential = [
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

    const shouldFail = () => crTest.acceptClaims(claimsForCredentialOtherCredential);

    expect(shouldFail).to.throw();
  });

  it('createCredential - success', async () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);

    const claimsForCredential = [
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

    await crTest.acceptClaims(claimsForCredential);
    expect(crTest.status).to.equal(CredentialRequestStatus.ACCEPTED);

    const credential = await crTest.createCredential();

    expect(crTest.status).to.equal(CredentialRequestStatus.ACCEPTED);

    expect(credential).to.exist;
    expect(credential.id).to.equal(crTest.credentialId);
    expect(credential.issuer).to.equal(crTest.idv);
    expect(credential.identifier).to.equal(crTest.credentialItem);
    expect(credential.claim).to.exist;
    expect(credential.proof).to.exist;
    expect(credential.proof.type).to.equal('CvcMerkleProof2018');
    expect(credential.proof.merkleRoot).to.exist;
  });

  it('anchorCredential - success', async () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);

    const claimsForCredential = [
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

    await crTest.acceptClaims(claimsForCredential);
    expect(crTest.status).to.equal(CredentialRequestStatus.ACCEPTED);

    const credentialObj = JSON.parse(JSON.stringify(await crTest.createCredential()));
    const credential = await crTest.anchorCredential(credentialObj);

    expect(crTest.status).to.equal(CredentialRequestStatus.ISSUED);
    expect(credential).to.exist;
    expect(credential.id).to.equal(crTest.credentialId);
    expect(credential.issuer).to.equal(crTest.idv);
    expect(credential.identifier).to.equal(crTest.credentialItem);
    expect(credential.claim).to.exist;
    expect(credential.proof).to.exist;
    expect(credential.proof.type).to.equal('CvcMerkleProof2018');
    expect(credential.proof.merkleRoot).to.exist;
  });

  it('anchorCredential - error', async () => {
    const credentialItem = 'credential-cvc:PhoneNumber-v1';
    const crTest = crManager.createCredentialRequest(credentialItem);

    const claimsForCredential = [
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

    crTest.acceptClaims(claimsForCredential);
    crTest.acceptedClaims = null;
    const credentialObj = JSON.parse(JSON.stringify(crTest.createCredential()));

    const shouldFail = crTest.anchorCredential(credentialObj);
    return expect(shouldFail).to.be.rejectedWith(Error);
  });
});
