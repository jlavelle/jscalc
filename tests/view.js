import test from "ava"
import jsdom from "jsdom"
import { calculator, view } from "../src/view.js"

const { JSDOM } = jsdom

const dom = new JSDOM(`<!doctype html>`)
const document = dom.window.document

test("calculator", t => {
  t.snapshot(calculator(() => {}))
})

// Just to make sure there are no exceptions
test("view", t => {
  t.snapshot(view(document)(() => {}))
})
