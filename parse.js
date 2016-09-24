const err = require('./errors.js')

function handleSentence(sentence) {
  let words = sentence.full.split(/\s+/g)

  sentence.subject = findThing(words, 0)

  return sentence
}

function findThing(words, baseIndex) {
  // findThing finds a thing, and it's up to other functions to determine whether or not that thing is a subject or object.
  // it often recursively calls itself for multiple things in the same sentence (so, almost any sentence)

  let thing = { complete: false, definite: false, amount: 1 }

  let index = baseIndex
  words.forEach(word => {
    if(word == 'the') {
      // "the" is referring to a thing to be specified later, so let's make just the skeleton for now
      thing.definite = true
    } else {
      // since we don't fit elsewhere, we must be the thing itself
      if(thing.complete)
        // multiple things in the same sentence-- when this happens legitimately, we'll have recursively called ourselves on the other things, so this should never happen
        return err.throw(new err.SyntaxError(index, 'Multiple things provided illegitimately'))

      thing.complete = true
      thing.name = word
    }

    index += word.length
  })

  if(!thing.complete)
    return err.throw(new err.SyntaxError(index, 'Insufficient information provided about thing'))

  return thing
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
