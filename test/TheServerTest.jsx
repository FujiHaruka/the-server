/**
 * Test for TheServer.
 * Runs with mocha.
 */
'use strict'

import TheServer from '../lib/TheServer'
import sugoCaller from 'sugo-caller'
import { ok, equal } from 'assert'
import arequest from 'arequest'
import aport from 'aport'

describe('the-server', () => {
  before(() => {
  })

  after(() => {
  })

  it('The server', async () => {
    let port = await aport()
    let server = new TheServer({
      rpc: {
        fruitShop: (app, client) => ({
          buy (name, amount) {
            console.log('Buying', { name, amount })
            return { name, amount }
          }
        })
      }
    })
    await server.listen(port)

    {
      let caller = sugoCaller({ port })
      let rpc = await caller.connect('rpc')

      let fruitShop = rpc.get('fruitShop').with({
        sessionId: 'abc'
      })

      await fruitShop.buy('orange', 100)

      await caller.disconnect()
    }

    await server.close()
  })
})

/* global describe, before, after, it */
