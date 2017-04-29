/**
 * Test for TheServer.
 * Runs with mocha.
 */
'use strict'

import TheServer from '../lib/TheServer'
import sugoCaller from 'sugo-caller'
import { ok, equal } from 'assert'
import co from 'co'
import arequest from 'arequest'
import aport from 'aport'

describe('the-server', () => {
  before(() => {
  })

  after(() => {
  })

  it('Jk server', () => co(function * () {
    let port = yield aport()
    let request = arequest.create({})
    let server = new TheServer({
      rpc: {
        fruitShop: (app, client) => ({
          buy (name, amount) {
            console.log('Buying', { name, amount })
            return { name, amount }
          }
        })
      },
      views: {
        index: (app, client) => ({
          index: () => 'This is index!',
          foo: () => 'This is foo'
        }),
        foo: (app, client) => ({
          bar: () => 'This is bar!'
        })
      }
    })
    yield server.listen(port)

    {
      let caller = sugoCaller({ port })
      let rpc = yield caller.connect('rpc')

      let fruitShop = rpc.get('fruitShop').with({
        sessionId: 'abc'
      })

      yield fruitShop.buy('orange', 100)

      yield caller.disconnect()
    }

    {
      let { statusCode, body } = yield request({
        url: `http://localhost:${port}/foo/bar`
      })
      equal(statusCode, 200)
      equal(body, 'This is bar!')
    }

    yield server.close()
  }))
})

/* global describe, before, after, it */
