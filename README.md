# [WIP] Identity.com Credential Request and Interactive Validation Library 

- Credential Request Library (CR)
- Interactive Validation Library (IV)

## Summary

This Javascript Library provides functionality around Credentials Requests (CR), Interactive Validations (IV) and Data Collect and Interactive Validation Protocol (DCVP) to help Validators to manage requests lifecycle and Credential Wallets for run validations.


## Getting Started 

this library is already integrated in the IDV builder as a dependency and should not be used outside that context.
see the [IDV builder https://github.com/identity-com/idv-builder] docs on how to define new handler. 
  
## Handlers

Handlers are generic abstractions to process idv events.

to extend/implement a handler logic you should create a new class that extends one of the existing handler classes and override the "handler" method.
optionally you could also override the `canHandle` method too. see more details below.

### TypeHandler

An ancestral handler that already implements the `canHandle` logic checking if the event type matches the handler event type.

_obs: Not very useful as a direct parent class_

### UCAHandler

An ancestral handler that already implements the `canHandle` logic checking the event type and if the event payload has an UCA(user collectible attribute) that matches the handler
You should extend this handler to process UCA events trigger in a validation process

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

### ValidatingHandler 

An ancestral handler that extends UCAHandler and should be used to handle validation process
that required async validations. An handler that extends ValidatingHandler will never autoAccept
and will set UCA.status to VALIDATING if no exception is throw during handling process

#### Example

```javascript
class MyUCAHandler extends ValidatingHandler {
   
   constructor(ucaName = null, ucaVersion = '1') {
        // it's a good practice to define the ucaName and ucaVersion when exporting the instance
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

### ExternalTaskHandler

An ancestral handler that already implement the `canHandle` logic checking is the event is an external task event that should be process
You should extend this handler to process external task events like webhooks or schedule tasks.

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
      // TODO process the event and possible update the state
      return state;
   }

  
}
```

## Tasks

Tasks are generic abstractions that can be attached to a process to handle external events like webhooks and schedule logic

### Creating a PollingTask

just append to the externalTasks property of the process state using the createPollingTask like:

```javascript
state.externalTasks = [
   ...state.externalTasks,
   createPollingTask({name: 'myTaskName', interval: '10m', externalSystemId: 'externalId', parameters: {}})
]
```  

### Creating other tasks

just append to the externalTasks property of the process state using the createSimpleTask like:

```javascript
state.externalTasks = [
   ...state.externalTasks,
   createSimpleTask({name: 'myTaskName', taskExpiresAfter: '24h', externalSystemId: 'externalId', parameters: {}})
]
```

you still have to implement event source for this task you added.

## Events

Events are generic abstractions that represent "messages" to the process, most of the events are built-in
but if you defined specific external tasks you need to fire your own events

The events lifecycle are manage by the IDV toolkit, they are created and dispatched as a result of external notification 
that can be webhook (to setup a webhook check the [IDV builder https://github.com/identity-com/idv-builder] documentation) request or schedule request.   
