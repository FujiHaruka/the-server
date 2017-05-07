# the-server@2.0.13

HTTP server of the-framework

+ Functions
  + [create(args)](#the-server-function-create)
+ [`TheServer`](#the-server-classes) Class
  + [new TheServer()](#the-server-classes-the-server-constructor)
  + [server.register(ControllerClass, controllerName, options)](#the-server-classes-the-server-register)
  + [server.invokeControllerAction(cid, invocation, options)](#the-server-classes-the-server-invokeControllerAction)
  + [server.defineControllerCreator(ControllerClass)](#the-server-classes-the-server-defineControllerCreator)
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

### new TheServer()

Constructor of TheServer class



<a class='md-heading-link' name="the-server-classes-the-server-register" ></a>

### server.register(ControllerClass, controllerName, options)

Register a controller

| Param | Type | Description |
| ----- | --- | -------- |
| ControllerClass | function | Controller class |
| controllerName | string | Name to instantiate with |
| options | Object |  |


<a class='md-heading-link' name="the-server-classes-the-server-invokeControllerAction" ></a>

### server.invokeControllerAction(cid, invocation, options) -> `*`

Invoke a controller action

| Param | Type | Description |
| ----- | --- | -------- |
| cid | string | Client id |
| invocation | Object | Controller action invocation |
| options | Object | Optional settings |


<a class='md-heading-link' name="the-server-classes-the-server-defineControllerCreator" ></a>

### server.defineControllerCreator(ControllerClass) -> `function`

Define a controller creators

| Param | Type | Description |
| ----- | --- | -------- |
| ControllerClass | function | Class of controller |


<a class='md-heading-link' name="the-server-classes-the-server-appScope" ></a>

### server.appScope(values) -> `Object`

Define an app scope object

| Param | Type | Description |
| ----- | --- | -------- |
| values | Object | Values to set |




