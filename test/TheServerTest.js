/**
 * Test for TheServer.
 * Runs with mocha.
 */
'use strict'

const TheServer = require('../lib/TheServer')
const sugoCaller = require('sugo-caller')
const {ok, equal, deepEqual} = require('assert')
const arequest = require('arequest')
const asleep = require('asleep')
const aport = require('aport')
const theClient = require('the-client').default
const {TheNotAcceptableError} = require('the-error')
const React = require('react')

describe('the-server', function () {
  this.timeout(8000)
  before(() => {
  })

  after(() => {
  })

  it('Listen and Close', async function () {
    const port = await aport()
    const server = new TheServer({})

    await server.listen(port)
    await asleep(500)
    await server.close().catch((err) => {
      console.error('!!!', err)
    })
  })

  it('The server', async function () {
    const port = await aport()
    const server = new TheServer({
      injectors: {
        store: () => ({isStore: true})
      }
    })

    class SayCtrl extends TheServer.Ctrl {
      sayHi () {
        return 'hi'
      }

      controllerDidAttach () {
        console.log('Say did attach')
      }

      controllerWillDetach () {
        console.log('Say will detach')
      }

      controllerMethodWillInvoke (invocation) {
        console.log('will invoke', invocation)
      }

      controllerMethodDidInvoke (invocation) {
        console.log('did invoke', invocation)
      }
    }

    class FruitShopCtrl extends TheServer.Ctrl {
      async buy (name, amount) {
        const {app, client, session} = this
        let {total = 0} = session
        session.total = total + amount
        return {name, amount, total: session.total}
      }

      somethingWrong () {
        const error = new TheNotAcceptableError('Something is wrong!')
        throw error
      }

      clear () {
        this.session.total = 0
      }

      async callSayHi () {
        const say = this.useController('say')
        const hi = await say.sayHi()
        this.callbacks.onHi(hi)
        asleep(300)
        return hi
      }
    }

    server.load(FruitShopCtrl, 'fruitShop')
    server.loadFromMapping({say: SayCtrl})

    await server.listen(port)

    {
      const caller = sugoCaller({port})
      const controllers = await caller.connect('rpc')

      server.connectionPool.createConnection('caller-01')
      server.connectionPool.createConnection('caller-02')

      const fruitShop01 = controllers.get('fruitShop').with({
        cid: 'client01',
        callerKey: 'caller-01'
      })
      const fruitShop02 = controllers.get('fruitShop').with({
        cid: 'client02',
        callerKey: 'caller-02'
      })

      await fruitShop01.clear()
      await fruitShop02.clear()

      deepEqual(
        await fruitShop01.buy('orange', 100),
        {name: 'orange', amount: 100, total: 100}
      )

      deepEqual(
        await fruitShop02.buy('banana', 1),
        {name: 'banana', amount: 1, total: 1}
      )

      deepEqual(
        await fruitShop01.buy('orange', 400),
        {name: 'orange', amount: 400, total: 500}
      )

      {
        const caught = await fruitShop01.somethingWrong().catch((e) => e)
        equal(caught.name, 'NotAcceptableError')
      }

      equal(
        await fruitShop01.callSayHi(),
        'hi'
      )

      server.connectionPool.destroyConnection('caller-01')
      server.connectionPool.destroyConnection('caller-02')

      await caller.disconnect()
    }

    await server.close()
  })

  it('With endpoints adn html', async () => {
    let port = await aport()
    let server = new TheServer({
      endpoints: {
        '/foo/bar/:id': (ctx) => {
          ctx.body = {rendered: true, id: ctx.params.id}
        }
      },
      html: ({}) => React.createElement('html', {id: 'hoge'}),
      cacheDIr: `${__dirname}/../tmp/testing-cache`
    })
    await server.listen(port)

    {
      {
        const {body, statusCode} = await arequest(`http://localhost:${port}/the/ping`)
        equal(statusCode, 200)
        equal(body, 'pong')
      }
      {
        const {body, statusCode} = await arequest(`http://localhost:${port}/the/info`)
        equal(statusCode, 200)
        ok(body.alive)
        ok(body.uptime)
      }
    }
    {
      const times = []
      {
        const startAt = new Date()
        let {body, statusCode} = await arequest(
          `http://localhost:${port}/a?hoge`
        )
        equal(statusCode, 200)
        equal(body, '<html id="hoge"></html>')
        times.push(new Date() - startAt)
      }

      {
        const startAt = new Date()
        let {body, statusCode} = await arequest(
          `http://localhost:${port}/a?hoge`
        )
        equal(statusCode, 200)
        equal(body, '<html id="hoge"></html>')
        times.push(new Date() - startAt)
      }

      {
        const startAt = new Date()
        let {body, statusCode} = await arequest(
          `http://localhost:${port}/a?hoge`
        )
        equal(statusCode, 200)
        equal(body, '<html id="hoge"></html>')
        times.push(new Date() - startAt)
      }

      console.log('html times:', times)
    }

    {
      let {body, statusCode} = await arequest(
        `http://localhost:${port}/foo/bar/3`
      )
      equal(statusCode, 200)
      deepEqual(body, {rendered: true, id: '3'})
    }

    await server.close()
  })

  it('Via http', async () => {
    let port = await aport()
    let request = arequest.create({jar: true})
    let server = new TheServer({})

    class SomeCtrl extends TheServer.Ctrl {
      doSomething (v1, v2) {
        let {count = 0} = this.session
        count++
        this.session.count = count
        return 'Yes it is something:' + v1 + v2 + count
      }

      doSomethingWrong () {
        throw new Error('No!')
      }

    }

    server.load(SomeCtrl, 'some')
    await server.listen(port)

    {
      let {body, statusCode} = await request(
        `http://localhost:${port}/rpc/some/do-something/foo/bar`
      )
      equal(statusCode, 200)
      equal(body, 'Yes it is something:foobar1')
    }

    {
      let {body, statusCode} = await request(
        `http://localhost:${port}/rpc/some/do-something/foo/bar`
      )
      equal(statusCode, 200)
      equal(body, 'Yes it is something:foobar2')
    }

    {
      let {body, statusCode} = await request(
        `http://localhost:${port}/rpc/some/do-something-wrong/foo/bar`
      )
      equal(statusCode, 400)
      equal(body, '`some.doSomethingWrong()` No!')
    }

    await server.close()
  })

  it('Use Event Emit', async function () {
    let port = await aport()
    let server = new TheServer({
      injectors: {
        store: () => ({isStore: true})
      }
    })

    class LifeCtrl extends TheServer.Ctrl {
      async listenToHeartBeat (options = {}) {
        const {interval = 10, timeout = 1000} = options
        const {session} = this
        let {count = 0} = session
        let startAt = new Date()
        while (new Date() - startAt < Number(timeout)) {
          count += 1
          session.count = count
          this.emit('heartbeat:alive', {count})
          this.callbacks.onHeartBeat(count)
          await asleep(interval)
        }
        return count + 1
      }
    }

    server.load(LifeCtrl, 'life')

    await server.listen(port)

    await asleep(10)
    {
      let client01 = theClient({cid: 'client01', port})
      let client02 = theClient({cid: 'client02', port})
      let life01 = await client01.use('life')
      let life02 = await client02.use('life')

      life01.on('the:ctrl:callback', (data) => {
        equal(data.controller, 'life')
      })

      await asleep(10)

      let eventsFor01 = []
      let eventsFor02 = []
      life01.on('heartbeat:alive', (data) => {
        eventsFor01.push(data)
      })
      life02.on('heartbeat:alive', (data) => {
        eventsFor02.push(data)
      })

      await life01.listenToHeartBeat()

      ok(!life01.reloadSession)
      ok(!life01.saveSession)

      await asleep(150)
      await client01.disconnect()
      await client02.disconnect()

      ok(eventsFor01.length > 10)
      equal(eventsFor02.length, 0)
    }

    await server.close()
  })
})

/* global describe, before, after, it */
