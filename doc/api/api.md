# the-server@4.2.1

HTTP server of the-framework

+ Functions
  + [create(args)](#the-server-function-create)
+ [`TheServer`](#the-server-classes) Class
  + [new TheServer(config)](#the-server-classes-the-server-constructor)
  + [server.load(ControllerClass, controllerName)](#the-server-classes-the-server-load)
  + [server.invokeControllerAction(cid, invocation, options)](#the-server-classes-the-server-invokeControllerAction)
  + [server.defineControllerCreator(ControllerClass, as)](#the-server-classes-the-server-defineControllerCreator)
  + [server.createControllerFor(controllerName, app, client)](#the-server-classes-the-server-createControllerFor)
  + [server.knownControllerNames()](#the-server-classes-the-server-knownControllerNames)
  + [server.appScope(values)](#the-server-classes-the-server-appScope)
  + [server.load(ControllerClass, controllerName)](#the-server-classes-the-server-load)
  + [server.invokeControllerAction(cid, invocation, options)](#the-server-classes-the-server-invokeControllerAction)
  + [server.defineControllerCreator(ControllerClass, as)](#the-server-classes-the-server-defineControllerCreator)
  + [server.createControllerFor(controllerName, app, client)](#the-server-classes-the-server-createControllerFor)
  + [server.knownControllerNames()](#the-server-classes-the-server-knownControllerNames)
  + [server.appScope(values)](#the-server-classes-the-server-appScope)

## Functions

<a class='md-heading-link' name="the-server-function-create" ></a>

### create(args) -> `TheServer`

Create a TheServer instance

| Param | Type | Description |
| ----- | --- | -------- |
| args | * |  |



<a class='md-heading-link' name="the-server-classes"></a>

## `TheServer` Class

HTTP server for the-framework




<a class='md-heading-link' name="the-server-classes-the-server-constructor" ></a>

### new TheServer(config)

Constructor of TheServer class

| Param | Type | Description |
| ----- | --- | -------- |
| config | Object |  |


<a class='md-heading-link' name="the-server-classes-the-server-load" ></a>

### server.load(ControllerClass, controllerName)

Load a controller

| Param | Type | Description |
| ----- | --- | -------- |
| ControllerClass | function | Controller class |
| controllerName | string | Name to instantiate with |


<a class='md-heading-link' name="the-server-classes-the-server-invokeControllerAction" ></a>

### server.invokeControllerAction(cid, invocation, options) -> `*`

Invoke a controller action

| Param | Type | Description |
| ----- | --- | -------- |
| cid | string | Client id |
| invocation | Object | Controller action invocation |
| options | Object | Optional settings |


<a class='md-heading-link' name="the-server-classes-the-server-defineControllerCreator" ></a>

### server.defineControllerCreator(ControllerClass, as) -> `function`

Define a controller creators

| Param | Type | Description |
| ----- | --- | -------- |
| ControllerClass | function | Class of controller |
| as | string | Name as |


<a class='md-heading-link' name="the-server-classes-the-server-createControllerFor" ></a>

### server.createControllerFor(controllerName, app, client) -> `Object`

Create an controller

| Param | Type | Description |
| ----- | --- | -------- |
| controllerName | string |  |
| app | Object | App scope |
| client | Object | Client scope |


<a class='md-heading-link' name="the-server-classes-the-server-knownControllerNames" ></a>

### server.knownControllerNames() -> `Array.<string>`

Get known controller names

<a class='md-heading-link' name="the-server-classes-the-server-appScope" ></a>

### server.appScope(values) -> `Object`

Define an app scope object

| Param | Type | Description |
| ----- | --- | -------- |
| values | Object | Values to set |


<a class='md-heading-link' name="the-server-classes-the-server-load" ></a>

### server.load(ControllerClass, controllerName)

Load a controller

| Param | Type | Description |
| ----- | --- | -------- |
| ControllerClass | function | Controller class |
| controllerName | string | Name to instantiate with |


<a class='md-heading-link' name="the-server-classes-the-server-invokeControllerAction" ></a>

### server.invokeControllerAction(cid, invocation, options) -> `*`

Invoke a controller action

| Param | Type | Description |
| ----- | --- | -------- |
| cid | string | Client id |
| invocation | Object | Controller action invocation |
| options | Object | Optional settings |


<a class='md-heading-link' name="the-server-classes-the-server-defineControllerCreator" ></a>

### server.defineControllerCreator(ControllerClass, as) -> `function`

Define a controller creators

| Param | Type | Description |
| ----- | --- | -------- |
| ControllerClass | function | Class of controller |
| as | string | Name as |


<a class='md-heading-link' name="the-server-classes-the-server-createControllerFor" ></a>

### server.createControllerFor(controllerName, app, client) -> `Object`

Create an controller

| Param | Type | Description |
| ----- | --- | -------- |
| controllerName | string |  |
| app | Object | App scope |
| client | Object | Client scope |


<a class='md-heading-link' name="the-server-classes-the-server-knownControllerNames" ></a>

### server.knownControllerNames() -> `Array.<string>`

Get known controller names

<a class='md-heading-link' name="the-server-classes-the-server-appScope" ></a>

### server.appScope(values) -> `Object`

Define an app scope object

| Param | Type | Description |
| ----- | --- | -------- |
| values | Object | Values to set |




