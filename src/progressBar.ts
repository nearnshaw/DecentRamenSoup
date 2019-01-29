import { Pot, SoupState } from "./pot";
import { smokeSpawner } from "./smoke";

@Component("progressBar")
export class ProgressBar {
  ratio: number = 0
  fullLength: number = 0.9
  movesUp: boolean = true
  color: Material
  speed: number = 1
  parent: Entity
  smokeInterval = 3
  nextSmoke = this.smokeInterval
  // parent type (pot / customer)
  constructor(parent: Entity, speed: number = 1, movesUp: boolean = true){
    this.parent = parent
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
        let pot = data.parent.get(Pot)
        if(!pot.hasNoodles){
          engine.removeEntity(bar.getParent(), true)
        }
        if(data.ratio < 1){
          data.ratio += dt/20 * data.speed
        }
        let width = Scalar.Lerp(0, data.fullLength, data.ratio)
        transform.scale.x = width
        transform.position.x = - data.fullLength/2 + width/2
        if (data.ratio < 0.5){
          bar.remove(Material)
          bar.set(this.yellow)
        } 
        else if (data.ratio < 0.7){
          bar.remove(Material)
          bar.set(this.green)
          pot.state = SoupState.Cooked
          data.smokeInterval *= 0.98
        } else if (data.ratio < 1){
          bar.remove(Material)
          bar.set(this.red)
          data.smokeInterval *= 0.97
        } else if (data.ratio > 1){
          pot.state = SoupState.Burned
          
          engine.removeEntity(bar.getParent(), true)

        }
        data.nextSmoke -= dt
        if (data.nextSmoke < 0){
          data.nextSmoke = data.smokeInterval
          smokeSpawner.SpawnSmokePuff(data.parent)
        }
      }
    }
    constructor(red: Material, yellow: Material, green: Material ){
        this.red = red,
        this.yellow = yellow,
        this.green = green
    }
  }


export function createProgressBar(parent: Entity, yRotation: number = 0, speed: number = 1, height: number = 1){
  

  let background = new Entity()
  background.add(new PlaneShape())
  background.setParent(parent)
  background.set(
    new Transform({
      position: new Vector3(0, height, 0),
      scale: new Vector3(0.82, 0.15, 1),
      rotation: Quaternion.Euler(0, yRotation, 0)
    })
  )
  engine.addEntity(background)

  let progressBar = new Entity()
  progressBar.add(new PlaneShape())
  progressBar.setParent(background)
  progressBar.set(
    new Transform({
      position: new Vector3(0, 0, -0.05),
      scale: new Vector3(0.95, 0.8, 1)
    })
  )
  progressBar.add(new ProgressBar(parent))
  engine.addEntity(progressBar)

}