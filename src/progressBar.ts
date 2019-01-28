@Component("progressBar")
export class ProgressBar {
  ratio: number = 0
  fullLength: number = 0.5
  movesUp: boolean = true
  color: Material
  speed: number = 1
  constructor(speed: number = 1, movesUp: boolean = true){
    this.speed = speed
    this.movesUp = movesUp
  }
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
          data.ratio += dt/10 * data.speed
        }
        //log(data.ratio)
        let width = Scalar.Lerp(0, data.fullLength, data.ratio)
        transform.scale.x = width
        transform.position.x = - data.fullLength/2 + width/2
        if (data.ratio < 0.5){
          bar.remove(Material)
          bar.set(this.green)
        } 
        else if (data.ratio < 0.7){
          bar.remove(Material)
          bar.set(this.yellow)
        } else if (data.ratio < 1){
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


export function createProgressBar(parent: Entity, height: number = 1, speed: number = 1){
  let progressBar = new Entity()
  progressBar.add(new PlaneShape())
  progressBar.setParent(parent)
  progressBar.set(
    new Transform({
      position: new Vector3(0, height, 0),
      scale: new Vector3(0.8, 0.1, 1)
    })
  )
  progressBar.add(new ProgressBar())
  engine.addEntity(progressBar)
}