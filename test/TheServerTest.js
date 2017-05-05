/**
 * Test for TheServer.
 * Runs with mocha.
 */
'use strict'

const TheServer = require('../lib/TheServer')
const sugoCaller = require('sugo-caller')
const { ok, equal, deepEqual } = require('assert')
const aport = require('aport')

describe('the-server', () => {
  before(() => {
  })

  after(() => {
  })

  it('The server', async function () {
    let port = await aport()
    let server = new TheServer({})

    class FruitShopCtrl extends TheServer.Ctrl {
      constructor ({ app, client }) {
        super({ app, client })
        const s = this
        s.total = 0
      }

      buy (name, amount) {
        const s = this
        const { app, client } = s
        let { cid } = client
        s.total += amount
        return { name, amount, total: s.total }
      }
    }

    server.register(FruitShopCtrl, 'fruitShop')

    await server.listen(port)

    {
      let caller = sugoCaller({ port })
      let controllers = await caller.connect('rpc')

      let fruitShop01 = controllers.get('fruitShop').with({
        cid: 'client01'
      })
      let fruitShop02 = controllers.get('fruitShop').with({
        cid: 'client02'
      })

      deepEqual(
        await fruitShop01.buy('orange', 100),
        { name: 'orange', amount: 100, total: 100 }
      )

      deepEqual(
        await fruitShop02.buy('banana', 1),
        { name: 'banana', amount: 1, total: 1 }
      )

      deepEqual(
        await fruitShop01.buy('orange', 400),
        { name: 'orange', amount: 400, total: 500 }
      )

      await caller.disconnect()
    }

    await server.close()
  })
})

/* global describe, before, after, it */
