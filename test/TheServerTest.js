/**
 * Test for TheServer.
 * Runs with mocha.
 */
'use strict'

const TheServer = require('../lib/TheServer')
const sugoCaller = require('sugo-caller')
const { ok, equal, deepEqual } = require('assert')
const arequest = require('arequest')
const aport = require('aport')
const { TheNotAcceptableError } = require('the-error')

describe('the-server', () => {
  before(() => {
  })

  after(() => {
  })

  it('The server', async function () {
    let port = await aport()
    let server = new TheServer({
      injectors: {
        store: () => ({ isStore: true })
      }
    })

    class SayCtrl extends TheServer.Ctrl {
      sayHi () {
        return 'hi'
      }
    }

    class FruitShopCtrl extends TheServer.Ctrl {
      buy (name, amount) {
        const s = this
        const { app, client, session } = s
        let { total = 0 } = session
        session.total = total + amount
        return { name, amount, total: session.total }
      }

      somethingWrong () {
        let error = new TheNotAcceptableError('Something is wrong!')
        throw error
      }

      clear () {
        const s = this
        s.session.total = 0
      }

      subscribe () {
        const s = this
      }

      callSayHi () {
        const s = this
        let say = s.useController('say')
        return say.sayHi()
      }
    }

    server.load(FruitShopCtrl, 'fruitShop')
    server.load(SayCtrl, 'say')

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

      await fruitShop01.clear()
      await fruitShop02.clear()

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

      {
        let caught = await fruitShop01.somethingWrong().catch((e) => e)
        equal(caught.name, 'NotAcceptableError')
      }

      equal(
        await fruitShop01.callSayHi(),
        'hi'
      )

      await caller.disconnect()
    }

    await server.close()
  })

  it('With endpoints', async () => {
    let port = await aport()
    let server = new TheServer({
      endpoints: {
        '/foo/bar/:id': (ctx) => {
          ctx.body = { rendered: true, id: ctx.params.id }
        }
      }
    })
    await server.listen(port)

    {
      let { body, statusCode } = await arequest(
        `http://localhost:${port}/foo/bar/3`
      )
      equal(statusCode, 200)
      deepEqual(body, { rendered: true, id: '3' })
    }

    await server.close()
  })

  it('Via http', async () => {
    let port = await aport()
    let server = new TheServer({})

    class SomeCtrl extends TheServer.Ctrl {
      doSomething (v1, v2) {
        return 'Yes it is something:' + v1 + v2
      }

      doSomethingWrong () {
        throw new Error('No!')
      }
    }

    server.load(SomeCtrl, 'some')
    await server.listen(port)

    {
      let { body, statusCode } = await arequest(
        `http://localhost:${port}/rpc/some/do-something/foo/bar`
      )
      equal(statusCode, 200)
      equal(body, 'Yes it is something:foobar')
    }

    {
      let { body, statusCode } = await arequest(
        `http://localhost:${port}/rpc/some/do-something-wrong/foo/bar`
      )
      equal(statusCode, 400)
      equal(body, 'No!')
    }

    await server.close()
  })
})

/* global describe, before, after, it */
