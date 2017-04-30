'use strict'

const React = require('react')
const TheServer = require('the-server')
const { createElement: c } = React

{
  let server = new TheServer({
    /**
     * Redis config
     */
    redis: { host: '127.0.0.1', port: '6379', db: 1 },
    /**
     * Directory path to serve static files
     */
    static: 'public',
    /**
     * RPC modules
     */
    rpc: {
      fruitShop: (app, client) => ({
        search (query) {
          return [ /* ... */ ]
        },
        buy (product, amount) {
          let { sessionId } = client
          /* ... */
        }
      })
    },
    html: ({ children }) => c(
      'html',
      {},
      c('body', {}, children)
    )
  })

  server.listen(3000)
}

