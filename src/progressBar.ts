@Component("progressBar")
export class ProgressBar {
  ratio: number = 0
  fullLength: number = 0.5
  movesUp: boolean = true
  color: Material
}

// component group grid positions
const progressBars = engine.getComponentGroup(ProgressBar);

export class ProgressBarUpdate implements ISystem {
    red: Material
    yellow: Material
    green: Material
    update(dt: number) {
      for (let bar of progressBars.entities){
        let transform = bar.get(Transform)
        let data = bar.get(ProgressBar)
        if(data.ratio < 1){
          data.ratio += dt/10
        }
        //log(data.ratio)
        let width = Scalar.Lerp(0, data.fullLength, data.ratio)
        transform.scale.x = width
        transform.position.x = - data.fullLength/2 + width/2
        if (data.ratio > 0.5){
          bar.remove(Material)
          bar.set(this.green)
        } 
        else if (data.ratio > 0.5){
          bar.remove(Material)
          bar.set(this.yellow)
        } else if (data.ratio > 0.8){
          bar.remove(Material)
          bar.set(this.red)
        } else if (data.ratio > 1){
          engine.removeEntity(bar)
        }
      }
    }
    constructor(red: Material, yellow: Material, green: Material ){
        this.red = red,
        this.yellow = yellow,
        this.green = green
    }
  }