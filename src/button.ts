@Component('buttonData')
export class ButtonData {
  pressed: boolean
  xUp: number = 0
  xDown: number = 0
  fraction: number
  timeDown: number
  constructor(xUp: number, xDown: number){
    this.xUp = xUp
    this.xDown = xDown
    this.pressed = false
    this.fraction = 0
    this.timeDown = 2
  }
}

export const buttons = engine.getComponentGroup(ButtonData)


export class PushButton implements ISystem {
    update(dt: number) {
      for (let button of buttons.entities) {
        let transform = button.get(Transform)
        let state = button.get(ButtonData)
        if (state.pressed == true) {
          if (state.fraction < 1) {
            transform.position.x = Scalar.Lerp(
              state.xUp,
              state.xDown,
              state.fraction
            )
            state.fraction += 1/8
          }
          state.timeDown -= dt
          if (state.timeDown < 0) {
            state.pressed = false
            state.timeDown = 2
          }
        } else if (state.pressed == false && state.fraction > 0) {
          transform.position.x = Scalar.Lerp(
            state.xUp,
            state.xDown,
            state.fraction
          )
          state.fraction -= 1/8
        }
      }
    }
  }