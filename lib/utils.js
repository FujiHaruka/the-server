/**
 * Utility functions
 * @namespace utils
 */
'use strict'

const asleep = require('asleep')
const aport = require('aport')

function polyfill () {
  try {
    require('babel-polyfill')
  } catch (e) {
    // Do Nothing
  }
}

module.exports = Object.freeze({
  asleep,
  aport,
  polyfill
})
