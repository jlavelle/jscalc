import util from "./util.js"
import { Token, interpret, parse } from "./expr.js"

const { Nothing, Just } = util.Maybe
const Either = util.Either
const { Left, Right } = Either

// Messages that the UI can send
export const Action = (() => {
  const mkAction = tag => value => ({ tag, value })
  const match = pattern => x => pattern[x.tag](x.value)

  return {
    match,
    digit: mkAction("digit"),
    dot: mkAction("dot")(),
    operator: mkAction("operator"),
    equals: mkAction("equals")(),
    clear: mkAction("clear")()
  }
})()

export const initialState = () => ({
  tokens: [], // An array of tokens that will be parsed and interpreted when = is pressed, e.g. [number(2), add, number(2)]
  numberBuilder: [], // An array of (string) digits that may contain a dot, will eventually be parsed into a number token
  error: Nothing
})

export const reducer = action => ({tokens, numberBuilder}) => {
  return Action.match({
    digit: x => ({
      tokens,
      numberBuilder: tooManyDigits(numberBuilder) ? numberBuilder : [...numberBuilder, String(x)],
      error: Nothing
    }),
    dot: () => ({
      tokens,
      numberBuilder: hasDot(numberBuilder) ? numberBuilder : [...numberBuilder, "."],
      error: Nothing
    }),
    // Replaces old operator with new operator if two operator buttons are pressed in a row
    operator: x => {
      const newTokens = lastIsOperator(tokens) && numberBuilder.length === 0
        ? [...util.tail(tokens), Token.operator(x)]
        : [...tokens, mkNumber(numberBuilder), Token.operator(x)]
      return {
        tokens: newTokens,
        numberBuilder: [],
        error: Nothing
      }
    },
    equals: () => handleEquals(tokens, numberBuilder),
    clear: () => initialState()
  })(action)
}

const hasDot = util.any(x => x === ".")

// Assume that there is only one dot in the array to keep things simple, this is enforced in the reducer itself
export const mkNumber = util.compose(Token.number, Number, util.fold(util.String))

export const lastIsOperator = util.compose(x => x && Token.isOperator(x), util.last)

const tooManyDigits = xs => xs.filter(x => x !== ".").length > 10

const errorOnOverflow = Either.bind(x => tooManyDigits(String(x).split("")) ? Left("Error") : Right(x))

const evaluate = util.compose(errorOnOverflow, interpret, parse)

export const handleEquals = (tokens, numberBuilder) => {
  const answer = evaluate(numberBuilder.length === 0 ? tokens : [...tokens, mkNumber(numberBuilder)])
  return Either.match({
    Left: e => ({ tokens: [], numberBuilder: [], error: Just(e) }),
    Right: x => ({ tokens: [ Token.number(x) ], numberBuilder: [], error: Nothing })
  })(answer)
}
