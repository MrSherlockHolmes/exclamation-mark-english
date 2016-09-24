const readline = require('readline')
const chalk = require('chalk')
const cardinal = require('cardinal')
const pretty = require('js-object-pretty-print').pretty
const rl = readline.createInterface({ input: process.stdin })

const parse = require('./parse')

!function repl() {
  process.stdout.write('> ' + chalk.styles.yellow.open)
  rl.question('', input => {
    process.stdout.write(chalk.styles.yellow.close)

    let parsed = parse(input)

    if(parsed) {
      // pretty-print w/ highlighting
      console.log('\n' + cardinal.highlight(pretty(parsed, 2)))
    }

    repl()
  })
}()
