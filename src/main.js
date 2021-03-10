import { initialState, reducer } from "./state.js"
import { display } from "./display.js"
import { initialize, redraw } from "./view.js"

const main = () => {
  let state = initialState()
  const send = action => {
    state = reducer(action)(state)
    redraw(document)(display(state))
  }
  initialize(document)(send)
}

main()
