import test from "ava"
import { Token, parse, interpret } from "../src/expr.js"
import util from "../src/util.js"

const { Either } = util
const { Left, Right } = Either
const { number, add, subtract, multiply, divide } = Token

const num = parse([number(1.2)])
const basic = parse([number(1), add, number(1)])
const mixed = parse([number(3), multiply, number(6), subtract, number(9), divide, number(12)])
const associativity = parse([number(1), subtract, number(3), subtract, number(9)])
const big = parse([number(3), add, number(4), subtract, number(6), subtract, number(9), divide, number(10), multiply, number(6), subtract, number(8)])

test("parse - number", t => {
  t.snapshot(num)
})

test("parse - basic", t => {
  t.snapshot(basic)
})

test("parse - mixed", t => {
  t.snapshot(mixed)
})

test("parse - associativity", t => {
  t.snapshot(associativity)
})

test("parse - big", t => {
  t.snapshot(big)
})

test("interpret - number", t => {
  t.deepEqual(Right(1.2), interpret(num))
})

test("interpret - basic", t => {
  t.deepEqual(Right(2), interpret(basic))
})

test("interpret - mixed", t => {
  t.deepEqual(Right(17.25), interpret(mixed))
})

test("interpret - associativity", t => {
  t.deepEqual(Right(-11), interpret(associativity))
})

test("interpret - big", t => {
  t.deepEqual(Right(-12.4), interpret(big))
})

test("interpret - divide by zero", t => {
  t.deepEqual(Left("Undefined"), interpret(parse([number(1), add, number(1), divide, number(0)])))
})
