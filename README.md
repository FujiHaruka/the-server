the-server
==========

<!---
This file is generated by ape-tmpl. Do not update manually.
--->

<!-- Badge Start -->
<a name="badges"></a>

[![Build Status][bd_travis_shield_url]][bd_travis_url]
[![npm Version][bd_npm_shield_url]][bd_npm_url]
[![JS Standard][bd_standard_shield_url]][bd_standard_url]

[bd_repo_url]: https://github.com/the-labo/the-server
[bd_travis_url]: http://travis-ci.org/the-labo/the-server
[bd_travis_shield_url]: http://img.shields.io/travis/the-labo/the-server.svg?style=flat
[bd_travis_com_url]: http://travis-ci.com/the-labo/the-server
[bd_travis_com_shield_url]: https://api.travis-ci.com/the-labo/the-server.svg?token=
[bd_license_url]: https://github.com/the-labo/the-server/blob/master/LICENSE
[bd_codeclimate_url]: http://codeclimate.com/github/the-labo/the-server
[bd_codeclimate_shield_url]: http://img.shields.io/codeclimate/github/the-labo/the-server.svg?style=flat
[bd_codeclimate_coverage_shield_url]: http://img.shields.io/codeclimate/coverage/github/the-labo/the-server.svg?style=flat
[bd_gemnasium_url]: https://gemnasium.com/the-labo/the-server
[bd_gemnasium_shield_url]: https://gemnasium.com/the-labo/the-server.svg
[bd_npm_url]: http://www.npmjs.org/package/the-server
[bd_npm_shield_url]: http://img.shields.io/npm/v/the-server.svg?style=flat
[bd_standard_url]: http://standardjs.com/
[bd_standard_shield_url]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

<!-- Badge End -->


<!-- Description Start -->
<a name="description"></a>

HTTP server of the-framework

<!-- Description End -->


<!-- Overview Start -->
<a name="overview"></a>



<!-- Overview End -->


<!-- Sections Start -->
<a name="sections"></a>

<!-- Section from "doc/guides/01.Installation.md.hbs" Start -->

<a name="section-doc-guides-01-installation-md"></a>

Installation
-----

```bash
$ npm install the-server --save
```


<!-- Section from "doc/guides/01.Installation.md.hbs" End -->

<!-- Section from "doc/guides/02.Usage.md.hbs" Start -->

<a name="section-doc-guides-02-usage-md"></a>

Usage
---------

```javascript
'use strict'

const React = require('react')
const theServer = require('the-server')
const {Ctrl} = theServer
const {createElement: c} = React

{
  const server = theServer({
    /**
     * Redis config
     */
    redis: {host: '127.0.0.1', port: '6379', db: 1},
    /**
     * Directory path to serve static files
     */
    static: 'public',
    /**
     * View renderer
     * @param children
     */
    html: ({children}) => c(
      'html',
      {},
      c('body', {}, children)
    )
  })

  // Define Controller Class
  class FruitShopCtrl extends Ctrl {
    async addToCart (name, amount = 1) {
      const {session} = this
      let {cart = {}} = session
      cart[name] = (cart[name] || 0) + amount
      session.cart = cart
    }

    async buy () {
      const {session} = this
      let {cart = {}} = session
      /* ... */
    }
  }

  // Register controller with name
  // Controller instance will be created for each method call
  server.register(FruitShopCtrl, 'fruitShop')

  server.listen(3000)
}

```


<!-- Section from "doc/guides/02.Usage.md.hbs" End -->

<!-- Section from "doc/guides/10.API Guide.md.hbs" Start -->

<a name="section-doc-guides-10-a-p-i-guide-md"></a>

API Guide
-----

+ [the-server@2.9.0](./doc/api/api.md)
  + [create(args)](./doc/api/api.md#the-server-function-create)
  + [TheServer](./doc/api/api.md#the-server-class)


<!-- Section from "doc/guides/10.API Guide.md.hbs" End -->


<!-- Sections Start -->


<!-- LICENSE Start -->
<a name="license"></a>

License
-------
This software is released under the [MIT License](https://github.com/the-labo/the-server/blob/master/LICENSE).

<!-- LICENSE End -->


<!-- Links Start -->
<a name="links"></a>

Links
------

+ [THE Labo][t_h_e_labo_url]

[t_h_e_labo_url]: https://github.com/the-labo

<!-- Links End -->
