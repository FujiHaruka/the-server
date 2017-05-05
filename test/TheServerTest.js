/**
 * Test for TheServer.
 * Runs with mocha.
 */
'use strict'

const TheServer = require('../lib/TheServer')
const sugoCaller = require('sugo-caller')
const { ok, equal } = require('assert')
const aport = require('aport')

describe('the-server', () => {
  before(() => {
  })

  after(() => {
  })

  it('The server', async function () {
    let port = await aport()
    let server = new TheServer({
      controllers: {
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
      let controllers = await caller.connect('controllers')

      let fruitShop = controllers.get('fruitShop').with({
        sessionId: 'abc'
      })

      await fruitShop.buy('orange', 100)

      await caller.disconnect()
    }

    await server.close()
  })
})

/* global describe, before, after, it */
