# IDV Commons Identity.com Credential Request and Interactive Validation Library 

The IDV Common library provides you common functionality will support you in customizing your [IDV Toolkit](https://github.com/identity-com/idv-toolkit). It is organized into two parts:

- Credential Requests
- Validation Plans

# Getting Started 

This library is already integrated in the [IDV Builder](https://github.com/identity-com/idv-builder). As such, at least a rudimentary understanding of the architecture of
an IDV Toolkit is a prerequisite. A good place to start is the [IDV Toolkit Architecture Guide](https://github.com/identity-com/idv-toolkit/blob/develop/README.md), and following that
the details documentation of each [IDV Toolkit component](https://github.com/identity-com/idv-toolkit/tree/develop/components).
  
# Credential Requests
Under `src/cr` you will find the CredentialRequest class. It is a model of a user's request (and its lifecycle) to you as an IDV, to attest to a specific credential. Typically this would happen via a mobile 
client that supports the Identity.com credential creation protocol.

For more information please read the [Credential Module documentation](https://github.com/identity-com/idv-toolkit/tree/develop/components/modules/CredentialModule).

# Validation Plan
A validation plan defines the information (in the format of [User Collectable Attributes](https://github.com/identity-com/uca) that needs to be successfully validated by the IDV, before  
the requested credential ([Verifiable Credential](https://github.com/identity-com/credential-commons)) can be created and attested to.
The building blocks that will enable you to create custom validation plans can be found under _src/vp_ . 

For more details please read the IDV Toolkit's [ValidationModule documentation](https://github.com/identity-com/idv-toolkit/tree/develop/components/modules/ValidationModule). In the following section only a rudimentary 
overview will be given.

## Handlers
Handlers are generic abstractions that react to events fired by the Validation Module. They have access to the state of the entire validation process, and can therefore be individually as complicated as they need to be.

### UCA Handler
The IDV Commons library provides an ancestral handler, called `UCA Handler`(`src/vp/Handler.js`), that a handler that abstracts a lot of the work around receiving UCA values:
By passing the name of a UCA as the constructor parameter, the handleUCA method will be called every time the value of that UCA changes, i.e. when the client has provided the requested information.
This method can execute any arbitrary code, for example calling an external API to decide whether to accept or reject the UCA.

To extend/implement a handler logic you should create a new class that extends the `UCA Handler and override the "handler" method.

#### Example

```javascript
class MyUCAHandler extends UCAHandler {
   
   constructor(ucaName = null, autoAccept = false, ucaVersion = '1') {
        // it's a good practice to define the ucaName and ucaVersion when exporting the instance
        // but it's ok to not have any constructor params and only initialize the super class with the specific values. 
        super(ucaName, autoAccept, ucaName);
   }

   /**
   * handleUCA is called after all checks are made and base on the value is expected to mutate the usaState
   * value [object] uca value received on the event
   * ucaState [object] the specific uca state in the running process
   **/
   async handleUCA(value, ucaState) {
      // most common changes are setting errors
      // ucaState.errors = [];  

      // and setting new status
      // ucaState.status = UCAStatus.VALIDATING;
   }

  
}
```   

### Validating Handler 

The IDV Commons library provides an ancestral handler, called `Validating Handler` that extends UCAHandler and can be used to handle validation process that requires async validations. 
It automatically sets the associated UCAs status to `VALIDATING` as long as no exception is thrown.

#### Example

```javascript
class MyUCAHandler extends ValidatingHandler {
   
   constructor(ucaName = null, ucaVersion = '1') {
        // it's good practice to define the ucaName and ucaVersion when exporting the instance
        // but it's ok to not have any constructor params and only initialize the super class with the specific values. 
        super(ucaName, ucaName);
   }

   /**
   * Called after all checks are made and base on the value is expected to mutate the usaState
   * @param value [object] uca value received on the event
   * @param ucaState [object] the specific uca state in the running process
   **/
   async handleUCA(value, ucaState) {
      // TODO dispatch the validation process asynchronous adding it to some queue implementation
      super.handleUCA(value, ucaState) 
   }

  
}
```

# Tasks
In many cases, UCA validation may be handled by a service external to the IDV Toolkit, and may take more than a few seconds. In this case, an external task can be added to the process state,
that can be resolved later either via a notification or via polling.

For more details please read the IDV Toolkit's [ValidationModule documentation on Tasks](https://github.com/identity-com/idv-toolkit/tree/develop/components/modules/ValidationModule#long-running-tasks).

### Creating a Task

You can use the _createPollingTask_ helper method to append a new polling task the process state:

```javascript
state.externalTasks = [
   ...state.externalTasks,
   createSimpleTask(
        { name: 'myTaskName',
          taskExpiresAfter: '24h',
          externalSystemId: 'externalId',
          parameters: {
            // details the IDV Toolkit needs to know how to poll
          }
        })
]
```
### External Task Handler

The IDV Commons library provides an ancestral handler, called `ExternalTaskHandler` that already implements the `canHandle` logic, checking if the event is an external task event
that should be processed.

#### Example

```javascript
class MyUCAHandler extends ExternalTaskHandler {
   
   constructor(eventType, externalTaskName) {
        // it's a good practice to define the eventType and externalTaskName when exporting the instance
        // but it's ok to not have any constructor params and only initialize the super class with the specific values. 
        super(eventType, externalTaskName);
   }

  /**
     * Manipulate the state based on the event and task. Must return the resultant state
     * @param state The incoming state
     * @param event The incoming event
     * @param task The task this event is related to
     * @return {*} The outcoming state
     */
   async handleTask(state, event, task) {
      // TODO process the event and possibly update the state
      return state;
   }
}
```  
