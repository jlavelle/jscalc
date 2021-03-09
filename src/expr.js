// Functions to parse and interpret expressions

import util from "./util.js"

const Either = util.Either
const { Left, Right } = Either

export const Token = (() => {
  const mkToken = tag => value => ({ tag, value })
  const operator = mkToken("operator")

  const precedence = op => {
    const prec = {
      add: 1,
      subtract: 1,
      multiply: 2,
      divide: 2
    }
    return prec[op]
  }

  return {
    precedence,
    isNumber: ({ tag }) => tag === "number",
    isOperator: ({ tag }) => tag === "operator",
    number: mkToken("number"),
    operator,
    add: operator("add"),
    subtract: operator("subtract"),
    multiply: operator("multiply"),
    divide: operator("divide")
  }
})()

export const Expr = (() => {
  const mkExpr = tag => left => right => operator => ({ tag, left, right, operator })

  const match = pattern => t => {
    switch (t.tag) {
      case "val":
        return pattern[t.tag](t.left)
      case "binary":
        return pattern[t.tag](t.left)(t.right)(t.operator)
      default:
        return util.panic(`Unknown Expr tag ${t.tag}`)
    }
  }

  return {
    match,
    val: val => mkExpr("val")(val)()(),
    binary: mkExpr("binary")
  }
})()

// Builds an Expr tree given an array of tokens. Based on the shunting-yard algorithm.
export const parse = tokens => {

  const higherPrec = a => b => {
    return Token.precedence(a) <= Token.precedence(b)
  }

  const addOps = (operands, operators) => operators.reduce((acc, operator) => {
    const [r, l, ...rest] = acc
    return [Expr.binary(l)(r)(operator), ...rest]
  }, operands)

  const go = ({operands, operators}, token) => {
    if (token.tag === "number") {
      return { operands: [Expr.val(token.value), ...operands], operators }
    } else {
      const preceding = util.takeWhile(higherPrec(token.value))(operators)
      return {
        operands: addOps(operands, preceding),
        operators: [token.value, ...operators.slice(preceding.length)]
      }
    }
  }

  const res = tokens.reduce(go, { operands: [], operators: [] })

  return addOps(res.operands, res.operators)[0]
}

export const interpret = expr => {
  const operators = {
    add: a => b => Right(a + b),
    subtract: a => b => Right(a - b),
    multiply: a => b => Right(a * b),
    divide: a => b => b === 0 ? Left("Undefined") : Right(a / b)
  }

  const rec = e => {
    return Expr.match({
      val: x => Right(x),
      binary: l => r => op => Either.chain(rec(l))(lc => Either.chain(rec(r))(rc => operators[op](lc)(rc)))
    })(e)
  }

  return rec(expr)
}
