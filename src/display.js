// Function to compute the number to display based on the current state

import util from "./util.js"
import { Token } from "./expr.js"
import { handleEquals } from "./state.js"

const Maybe = util.Maybe

export const display = ({ tokens, numberBuilder, error }) => {
  return Maybe.match({
    Just: e => e,
    Nothing: () => {
      // This behavior is different from typical simple calculator behavior, but it seems to be what
      // the spec requires based on the examples.
      return numberBuilder.length === 0
        ? intermediateDisplay(tokens, numberBuilder)
        : numDisplay(tokens, numberBuilder)
    }
  })(error)
}

export const intermediateDisplay = (tokens, numberBuilder) => {
  const last = lastOperator(util.tail(tokens))
  return Maybe.match({
    Nothing: () => numDisplay(tokens, numberBuilder),
    Just: op => Token.precedence(op.value) === Token.precedence(util.last(tokens).value)
      ? display(handleEquals(stripTrailingOperator(tokens), numberBuilder))
      : numDisplay(tokens, numberBuilder)
  })(last)
}

export const numDisplay = (tokens, numberBuilder) => numberBuilder.length === 0
  ? Maybe.maybe("")(x => String(util.roundSig(10)(x.value)))(lastNumber(tokens))
  : util.fold(util.String)(numberBuilder)

const lastOperator = util.lastBy(Token.isOperator)

const lastNumber = util.lastBy(Token.isNumber)

const stripTrailingOperator = tokens => util.last(tokens) && util.last(tokens).tag === "operator"
  ? util.tail(tokens)
  : tokens
