import test from "ava"
import util from "../src/util.js"
import { Action, reducer, initialState, mkNumber, lastIsOperator, handleEquals } from "../src/state.js"
import { display } from "../src/display.js"
import { Token } from "../src/expr.js"

const { Either, Maybe } = util
const { Left, Right } = Either
const { Just } = Maybe
const { digit, dot, operator, equals } = Action

test("mkNumber", t => {
  t.deepEqual(Token.number(123.456), mkNumber(["1", "2", "3", ".", "4", "5", "6"]))
})

test("lastIsOperator", t => {
  t.deepEqual(true, lastIsOperator([Token.number(1), Token.number(2), Token.operator("add")]))
  t.deepEqual(false, lastIsOperator([Token.operator("add"), Token.number(7)]))
})

// Apply the reducer to an array of [action, display] pairs, checking that the display is correct
const foldActions = ads => init => ads.reduce((acc, [a, _]) => reducer(a)(acc), init)

const checkDisplay = t => ads => init => ads.reduce((acc, [a, d]) => {
  const reduced = reducer(a)(acc)
  t.deepEqual(d, display(reduced), )
  return reduced
}, init)

const testCases = [
  [
    // Note that there is a mistake in the spec for the exercise, it incorrectly
    // says this should be 29.5
    "Rational Addition",
    [
      [digit(2), "2"],
      [digit(3), "23"],
      [dot, "23."],
      [digit(5), "23.5"],
      [operator("add"), "23.5"],
      [digit(7), "7"],
      [equals, "30.5"]
    ],
    Right(30.5)
  ],
  [
    "Chained Operations",
    [
      [digit(2), "2"],
      [operator("add"), "2"],
      [digit(3), "3"],
      [operator("subtract"), "5"],
      [digit(1), "1"],
      [digit(7), "17"],
      [equals, "-12"]
    ],
    Right(-12)
  ],
  [
    "Chained and Ordered Operations",
    [
      [digit(2), "2"],
      [operator("add"), "2"],
      [digit(3), "3"],
      [operator("multiply"), "3"],
      [digit(8), "8"],
      [equals, "26"]
    ],
    Right(26)
  ],
  [
    "Division by Zero",
    [
      [digit(2), "2"],
      [operator("divide"), "2"],
      [digit(0), "0"],
      [equals, "Undefined"]
    ],
    Left(Just("Undefined"))
  ],
  [
    "Overflow 10 digits",
    [
      [digit(2), "2"],
      [digit(0), "20"],
      [digit(0), "200"],
      [digit(0), "2000"],
      [digit(0), "20000"],
      [operator("multiply"), "20000"],
      [digit(9), "9"],
      [digit(9), "99"],
      [digit(9), "999"],
      [digit(9), "9999"],
      [digit(9), "99999"],
      [operator("multiply"), "1999980000"], // Another mistake in the spec here
      [digit(9), "9"],
      [equals, "Error"]
    ],
    Left(Just("Error"))
  ],
  [
    "Silly Input",
    [
      [digit(1), "1"],
      [dot, "1."],
      [dot, "1."],
      [dot, "1."],
      [digit(2), "1.2"],
      [operator("multiply"), "1.2"],
      [operator("subtract"), "1.2"],
      [operator("add"), "1.2"],
      [digit(1), "1"],
      [dot, "1."],
      [digit(2), "1.2"],
      [equals, "2.4"]
    ],
    Right(2.4)
  ],
  [
    "Continue After Equals",
    [
      [digit(1), "1"],
      [operator("add"), "1"],
      [digit(1), "1"],
      [equals, "2"],
      [operator("add"), "2"],
      [digit(2), "2"],
      [equals, "4"]
    ],
    Right(4)
  ]
]

testCases.forEach(testCase => {
  const [name, ads, expected] = testCase
  test(name + " - Reducer", t => {
    const r = foldActions(ads)(initialState())
    Either.match({
      Left: e => t.deepEqual(e, r.error),
      Right: x => t.deepEqual(x, r.tokens[0].value)
    })(expected)
  })
})

testCases.forEach(testCase => {
  const [name, ads] = testCase
  test(name + " - Display", t => {
    checkDisplay(t)(ads)(initialState())
  })
})

// For a specific bug encountered in the display code
test("display - 20000 * 99999 issue", t => {
  const state = {
    tokens: [Token.number(20000), Token.multiply, Token.number(99999), Token.multiply],
    numberBuilder: [],
    error: Maybe.Nothing
  }
  t.snapshot(handleEquals(util.tail(state.tokens), state.numberBuilder))
  t.deepEqual("1999980000", display(state))
})
