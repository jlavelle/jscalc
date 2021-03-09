import test from "ava"
import util from "../src/util.js"

test("fold", t => {
  t.deepEqual("abc", util.fold(util.String)(["a", "b", "c"]))
})
