/**
 * Define koa middleware function to detect locale
 * @function langDetector
 * @param {string[]} [locales='en'] - Supported locales
 * @returns {function}
 */
'use strict'

const { Locales } = require('locale')

/** @lends langDetector */
function langDetector (locales) {
  let supported = new Locales(locales, locales[ 0 ])
  return function middleware (ctx, next) {
    let detector = new Locales(ctx.get('accept-language'))
    let detected = detector.best(supported)
    let specified = ctx.query.locale
    ctx.lang = specified || detected.language
    next()
  }
}

module.exports = langDetector
