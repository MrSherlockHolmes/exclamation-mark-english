const err = require('./errors.js')

function handleSentence(sentence) {
  let words = sentence.full.split(/\s+/g)

  sentence.subject = findNoun(words, 0)

  return sentence
}

function findNoun(words, baseIndex) {
  // findNoun finds a noun, and it's up to other functions to determine whether or not that noun is a subject or object.
  // it often recursively calls itself for multiple nouns in the same sentence (so, almost any sentence)

  let noun = { complete: false, definite: false, amount: 1 }

  let index = baseIndex
  words.some(word => {
    if(word == 'the') {
      // "the" is referring to a noun to be specified later, so let's make just the skeleton for now
      noun.definite = true
    } else {
      // since we don't fit elsewhere, we must be the noun itself
      if(noun.complete)
        // multiple nouns in the same sentence-- when this happens legitimately, we'll have recursively called ourselves on the other nouns, so this should never happen
        return err.throw(new err.SyntaxError(index, 'Multiple nouns provided illegitimately')) || true

      noun.complete = true
      noun.name = word
    }

    index += word.length
  })

  if(!noun.complete)
    return err.throw(new err.SyntaxError(index, 'Insufficient information provided about noun')) || true

  return noun
}

module.exports = function parse(chars) {
  let flags = {
    is: {
      sentence: false
    },
    expected: null,
    ignore: 0,
  }

  let tree = {
    sentences: []
  }

  for(let pos = 0; pos < chars.length; pos++) {
    let char = chars[pos]

    if(flags.expected) {
      if(char === flags.expected) flags.expected = null
      else return error(pos, `Expected "${flags.expected}", got "${char}"`)
    }

    if(flags.ignore) {
      flags.ignore--
      continue
    }

    if(flags.is.sentence) {
      // sentences end with "." or "!" ("?" is for questions)
      if(char === '.' || char === '!') {
        flags.is.sentence = false
        flags.expected = ' ' // space always comes after sentence termination
        flags.ignore = 1     // and should be ignored

        let sentence = { full: this.sentence }
        tree.sentences.push(handleSentence(sentence)) // TODO clauses
      } else if(pos == chars.length-1) {
        // programs must finish their sentences!
        return err.throw(new err.SyntaxError(pos, `Expected end of sentence, got "${char}"`))
      }

      this.sentence += char
    } else {
      // sentences start with uppercase letters or symbols
      if(char.toUpperCase() === char) {
        flags.is.sentence = true
        this.sentence = char.toLowerCase()
      } else {
        return err.throw(new err.SyntaxError(pos, `Sentences cannot begin with a lowercase character, got "${char}"`))
      }
    }
  }

  return tree
}
