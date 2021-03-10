import { initialState, reducer } from "./state.js"
import { display } from "./display.js"
import { initialize, redraw } from "./view.js"

const main = () => {
  console.log("here")
  let state = initialState()
  const send = action => {
    console.log(action)
    state = reducer(action)(state)
    redraw(document)(display(state))
  }
  initialize(document)(send)
}
console.log("her")
main()
