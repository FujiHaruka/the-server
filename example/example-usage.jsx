'use strict'

import React from 'react'
import TheServer from 'the-server'

{
  let server = new TheServer({
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
    html: ({ children }) => '<html><body>{children}</body></html>'
  })

  server.listen(3000)
}

