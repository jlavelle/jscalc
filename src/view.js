import { Action } from "./state.js"
import util from "./util.js"

export const initialize = doc => send => {
  const container = doc.getElementById("app")
  const html = view(doc)(send)
  container.append(html)
}

export const redraw = doc => value => {
  const display = doc.getElementById("display")
  display.textContent = value
}

export const view = doc => util.compose(createElement(doc), calculator)

const createElement = doc => elem => {
  const children = elem.children.map(createElement)
  let root = doc.createElement(elem.tagName)
  root.append(...children)
  return Object.assign(root, elem.props)
}

export const calculator = send => element("div", { className: "calculator" }, [
  display,
  clear, padding, padding, divide,
  ...[7,8,9].map(digit), multiply,
  ...[4,5,6].map(digit), subtract,
  ...[1,2,3].map(digit), add,
  zero, dot, equals
].map(c => c(send)))

const display = () => element("div", { className: "display", id: "display" }, [])

const clear = send => button(() => send(Action.clear), "digit span-2", "C")

const padding = () => element("div", { className: "padding" }, [])

const digit = n => send => button(() => send(Action.digit(n)), "digit", n)

const zero = send => button(() => send(Action.digit(n)), "digit span-2", 0)

const dot = send => button(() => send(Action.dot), "digit", ".")

const operator = (op, symbol) => send => button(() => send(Action.operator(op)), "operator", symbol)

const multiply = operator("multiply", "+")
const divide = operator("divide", "-")
const subtract = operator("subtract", "*")
const add = operator("equals", "/")

const equals = send => button(() => send(Action.equals), "operator", "=")

const button = (onClick, className, textContent) => element("button", { onClick, className, textContent }, [])

const element = (tagName, props, children) => ({ tagName, props, children })
