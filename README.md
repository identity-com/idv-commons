# [WIP] Identity.com Credential Request and Interactive Validation Library 

- Credential Request Library (CR)
- Interactive Validation Library (IV)

## Summary

This Javascript Library provides functionality around Credentials Requests (CR), Interactive Validations (IV) and Data Collect and Interactive Validation Protocol (DCVP) to help Validators to manage requests lifecycle and Credential Wallets for run validations.

## Contents

## Validation Process

When a credential request is created, a validation process URL is provided by the IDV-toolkit that the credential wallet can use to send UCAs for validation to. The wallet interacts with the IDV-toolkit Validation Module (VM) as follows:

1. The Credential Wallet (CW) makes a credential request to the Credential Module (CM) within the IDV-toolkit. The CM returns a CredentialRequest object that contains within it a processUrl which should be used for querying and sending information to the VM.

2. The CW queries the processUrl and the VM returns a validation process object. This can be used to instantiate a ValidationProcess object.

3. The CW uses the 'ucas' property of the ValidationProcess to discover what information needs to be acquired from the user for validation. Each UCA can be instantiated as a ValidationUCA which will contain a ucaMapId which will be used to build the Validation Module URL for sending the UCA values to, in the form /processes/:processId/ucas/:ucaMapId.

4. For each UCA requiring user input (with a status AWAITING_USER_INPUT), the CW will get input from the user and get a value object for sending to the VM, using the method 'getValueObj' on the ValidationUCA. This method instantiates a ValidationUCAValue object which will validate that the value is good for that particular UCA type. Some UCAs are dependant upon other UCAs. This is defined by a 'dependsOn' array in the UCA object. This array contains an ordered list of UCAs which require validation before the 'parent' UCA can be validated. Values for these UCAs should be sent before a value for the parent UCA is sent.

5. For each UCA, the CW sends a UCA value object to the CM, using the URL mentioned in step 3. The VM will accept the UCA by returning a HTTP 202 response along with the value object that was sent. If the VM does not accept the UCA, it will return a 500 code, along with an error object describing why it was rejected.

6. The CW can query the state of the Validation process at any time by querying the processUrl described in step 1. A new ValidationProcess object can be parsed from the response and the CW can check the 'status' value of the process. When the status is COMPLETE, the VM will already have contacted the Credential Module to finish the Credential creation process. The CW can now make a request to the CM to get the created credential, using the URL /credential-requests/:credentialId/credential.