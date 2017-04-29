/**
 * Define scoped actor
 * @function scopedActor
 * @param {Object} scope - Scope variables
 * @param {Object.<string, function>} creators - Object creators
 * @returns {SugoActor} - A sugo actor instance
 */
'use strict'

import sugoActor from 'sugo-actor'
import { bound, scoped } from 'sugo-module-scoped'

const sureCreator = (creator) => {
  let type = typeof creator
  switch (type) {
    case 'function': {
      return creator
    }
    default: {
      throw new Error(`Creator should be an function, but given: ${type} ${JSON.stringify(creator)}`)
    }
  }
}

/** @lends scopedActor */
function scopedActor (scope, creators) {
  let modules = {}
  for (let name of Object.keys(creators)) {
    let creator = sureCreator(creators[ name ])
    modules[ name ] = bound(scoped(creator, { defaults: [ scope ] }), scope)
  }
  return sugoActor({
    modules
  })
}

export default scopedActor
