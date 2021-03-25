- [IDV Commons Identity.com Credential Request and Interactive Validation Library](#idv-commons-identitycom-credential-request-and-interactive-validation-library)
- [Validation Plans](#validation-plans)
  - [Handlers](#handlers)
    - [UCA Handler](#uca-handler)
      - [Example](#example)
    - [Validating Handler](#validating-handler)
      - [Example](#example-1)
- [Tasks](#tasks)
    - [Creating a Task](#creating-a-task)
    - [External Task Handler](#external-task-handler)
      - [Example](#example-2)
- [Credential Requests](#credential-requests)

# IDV Commons Identity.com Credential Request and Interactive Validation Library 

The IDV Common library provides common functionality that will help you when customizing your [IDV Builder](https://github.com/identity-com/idv-builder) 
or [IDV Toolkit](https://www.identity.com/ecosystem/identity-validator-toolkit/). 

> **_NOTE:_** We are in the process of Open-Sourcing the IDV Toolkit. Until then, the IDV Builder can be used to join the 
> Identity.com ecosystem.

IDV Commons is provides functionality regarding two main concepts of the IDV Toolkit/Builder:
- `Validation Plans` and `Handlers`
- `Credential Requests`


# Validation Plans
A validation plan defines the information (in the format of [User Collectable Attributes](https://github.com/identity-com/uca) 
that needs to be successfully validated by the IDV, before the requested credential ([Verifiable Credential](https://github.com/identity-com/credential-commons)) 
can be created and attested to.

The functionality provided IDV Commons for working with Validation Plans can be found in _src/vp_ , the most important one 
being the abstraction of common Handler use-cases. 

## Handlers
Handlers are generic abstractions that react to events fired . They have access to the state of the entire validation process, 
and can therefore be individually as complicated as they need to be. For more information around Handlers and how they fit 
into the IDV Toolkit  architecture please refer to the [IDV Builder](https://github.com/identity-com/idv-builder) documentation.

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

## Plan Manager
The IDV Commons library provides an abstract class, called `PlanManager`(`src/vp/PlanManager.js`), that defines the interface to implement the validation plan resolution.
This class includes methods to list the plans supported by the IDV and to retrieve a plan given a credential item type.

The IDV Toolkit supports implementing a custom Plan Manager for an IDV.

# Tasks
In many cases, UCA validation may be handled by a service external to the IDV Toolkit, and may take more than a few seconds. 
In this case, an external task can be added to the process state, that can be resolved later either via a notification or via polling.

For more details please read the IDV Toolkit's [ValidationModule documentation on Tasks](https://github.com/identity-com/idv-toolkit/tree/develop/components/modules/ValidationModule#long-running-tasks).

### Creating a Task

Here is an example of how to add an external task in handler code, using the `createPollingTask` defined in `src/vp/Tasks.js`:

```
const { Tasks: {  createPollingTask  }} = require('@identity.com/idv-commons');

const handler = (state, event) => {
    // create the task
    const task = createPollingTask({
        taskExpiresAfter: '48h',
        interval: '1h',
        parameters: {
            // details the IDV Toolkit needs to know how to poll
        }
    });

    // trigger the external service, e.g. via an http POST

    // return the updated state
    return {
        ...state,
        externalTasks: [task]
    }
}
```

### External Task Handler

The IDV Commons library provides an ancestral handler, called `ExternalTaskHandler` that already implements the logic to 
check if an event is an external task event that should be processed.

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

# Credential Requests
> **_NOTE:_** Credential Requests do not need to be customized when using the IDV Builder. Thus, this section will be 
> remain a _stub_ and will updated with more details, as soon as the IDV Toolkit is open-sourced.

Under `src/cr` you will find the CredentialRequest class. It is the model of a user's request (and its lifecycle) to you 
as an IDV, to attest to a specific credential. Typically this would happen via a mobile client that supports the Identity.com credential creation protocol.
