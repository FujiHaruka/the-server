'use strict'

const React = require('react')
const theServer = require('the-server')
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
  class FruitShopCtrl {
    search (query) {
      const { app, client } = this
      return [ /* ... */ ]
    }

    buy (product, amount) {
      const { app, client } = this
      let { sessionId } = client
      /* ... */
    }
  }

  // Register controller with name
  // Controller instance will be created for each client
  server.register(FruitShopCtrl, 'fruitShop')

  server.listen(3000)
}

