/**
 * Define koa middleware function to do serverside rendering
 * @function serverRendering
 * @param {function} Component - React component to render
 * @param {Object} [options={}] - Optional settings
 * @returns {function} Koa middleware function
 */
'use strict'

const {renderToStaticMarkup} = require('react-dom/server')
const {createElement: c} = require('react')
const path = require('path')
const adigest = require('adigest')
const {mkdirpAsync, writeFileAsync, readFileAsync} = require('asfs')
const rimraf = require('rimraf')

const d = (module) => (module && module.default) || module

/** @function serverRendering */
function serverRendering (Html, options = {}) {
  const {
    cacheDir,
    defaultStatus = 200,
    appScope
  } = options

  const htmlCacheDir = path.join(cacheDir, 'the-html-cache')

  const render = async (match, props) => {
    const key = adigest(match, {
      algorithm: 'md5'
    })
    const cacheFilename = path.join(htmlCacheDir, key.substring(0, 2), `${key}.cache.html`)
    const cached = await readFileAsync(cacheFilename).catch(() => null)
    if (cached) {
      return String(cached)
    }
    const element = c(
      d(Html),
      props
    )
    const generated = renderToStaticMarkup(element)

      // No wait for flush
    ;(async () => {
      await mkdirpAsync(path.dirname(cacheFilename))
      await writeFileAsync(cacheFilename, generated)
    })().catch((e) => console.error(e))

    return generated
  }

  async function middleware (ctx, next) {
    const extname = path.extname(ctx.path)
    const mayHTML = !extname || ['.html', '.htm'].includes(extname)
    if (!mayHTML) {
      next()
      return
    }

    const renderingContext = Object.assign({
      path: ctx.path,
      url: ctx.url,
      lang: ctx.lang,
    }, ctx.injections)

    const match = {url: ctx.url, lang: ctx.lang}
    ctx.body = await render(match, {appScope, renderingContext})
    ctx.status = renderingContext.status || defaultStatus
  }

  middleware.clearCacheSync = () => rimraf.sync(htmlCacheDir)

  return middleware
}

module.exports = serverRendering
