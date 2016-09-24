let err = {}

const chalk = require('chalk')

err.Error = class {
  constructor(position, text) {
    this.errorname = 'Error'

    this.does = () => {
      console.error(
        ' '.repeat(position + 2)
        + chalk.red('^\n')
        + chalk.red(`${this.errorname}: `)
        + text
      )
    }
  }
}
err.SyntaxError = class extends err.Error {
  constructor(position, text) {
    super(position, text)

    this.errorname = 'SyntaxError'
  }
}

err.throw = function(error) {
  error.does()
}

module.exports = err
