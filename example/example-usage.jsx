'use strict'

import React from 'react'
import TheServer from 'the-server'

const TheServerStyles = TheServer.styles({})

class ExampleComponent extends React.PureComponent {
  render () {
    return (
      <TheServer id='my-component'
                        styles={ TheServerStyles }
      />
    )
  }
}

export default ExampleComponent
