'use strict'

const React = require('react')
const theServer = require('the-server')
const { Ctrl } = theServer
const { createElement: c } = React

{
  const server = theServer({
    /**
     * Redis config
     */
    redis: { host: '127.0.0.1', port: '6379', db: 1 },
    /**
     * Directory path to serve static files
     */
    static: 'public',
    /**
     * View renderer
     * @param children
     */
    html: ({ children }) => c(
      'html',
      {},
      c('body', {}, children)
    )
  })

  // Define Controller Class
  class FruitShopCtrl extends Ctrl {
    addToCart (name, amount = 1) {
      const { session } = this
      let { cart = {} } = session
      cart[ name ] = (cart[ name ] || 0) + amount
      session.cart = cart
    }

    buy () {
      const { session } = this
      let { cart = {} } = session
      /* ... */
    }
  }

  // Register controller with name
  // Controller instance will be created for each method call
  server.register(FruitShopCtrl, 'fruitShop')

  server.listen(3000)
}
