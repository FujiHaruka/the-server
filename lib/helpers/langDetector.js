/**
 * Define koa middleware function to detect locale
 * @function langDetector
 * @param {string[]} [locales='en'] - Supported locales
 * @parma {Object} [options={}] - Optional setting
 * @returns {function}
 */
'use strict'

const { Locales } = require('locale')

/** @lends langDetector */
function langDetector (locales, options = {}) {
  let {
    queryKey = 'locale'
  } = options

  let supported = new Locales(locales, locales[ 0 ])
  return function middleware (ctx, next) {
    let specified = ctx.query[ queryKey ] || ctx.get('accept-language')
    let detected = new Locales(specified).best(supported)
    ctx.lang = detected.language
    next()
  }
}

module.exports = langDetector
