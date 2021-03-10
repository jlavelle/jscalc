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

// A redux-style reducer that takes an action and produces a new state
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
      const newTokens = (() => {
        if (numberBuilder.length === 0) {
          if (tokens.length === 0) return []
          if (lastIsOperator(tokens)) return [...util.tail(tokens), Token.operator(x)]
          return [...tokens, Token.operator(x)]
        } else {
          return [...tokens, mkNumber(numberBuilder), Token.operator(x)]
        }
      })()

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

// Assumes that there is only one dot in the array to keep things simple, this is enforced in the reducer itself
export const mkNumber = util.compose(Token.number, Number, util.fold(util.String))

export const lastIsOperator = util.compose(x => x && Token.isOperator(x), util.last)

const tooManyDigits = xs => xs.filter(x => x !== ".").length >= 10

const errorOnOverflow = Either.bind(x => String(x).split(".")[0].split("").length > 10 ? Left("Error") : Right(x))

const evaluate = util.compose(errorOnOverflow, interpret, parse)

export const handleEquals = (tokens, numberBuilder) => {
  const answer = evaluate(numberBuilder.length === 0 ? stripTrailingOperator(tokens) : [...tokens, mkNumber(numberBuilder)])
  return Either.match({
    Left: e => ({ tokens: [], numberBuilder: [], error: Just(e) }),
    Right: x => ({ tokens: [ Token.number(x) ], numberBuilder: [], error: Nothing })
  })(answer)
}

const stripTrailingOperator = tokens => util.last(tokens) && util.last(tokens).tag === "operator"
  ? util.tail(tokens)
  : tokens
