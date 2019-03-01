import { Pot, SoupState } from './pot'
import { smokeSpawner } from './smoke'
import { CustomerData } from './customer'
import { finishedPlaying } from './finishedGameUI'

@Component('customerProgressBar')
export class CustomerProgressBar {
  ratio: number = 1
  fullLength: number = 0.9
  movesUp: boolean = true
  color: Material
  speed: number = 1
  parent: Entity
  constructor(parent: Entity, speed: number = 1, movesUp: boolean = true) {
    this.parent = parent
    this.speed = speed
    this.movesUp = movesUp
  }
}

// component group grid positions
const custProgressBars = engine.getComponentGroup(CustomerProgressBar)

export class CustProgressBarUpdate implements ISystem {
  red: Material
  yellow: Material
  green: Material
  update(dt: number) {
    if (finishedPlaying) return

    for (let bar of custProgressBars.entities) {
      let transform = bar.getComponent(Transform)
      let data = bar.getComponent(CustomerProgressBar)
      let customer = data.parent.getComponent(CustomerData)

      if (data.speed == 0) {
        continue
      }

      if (data.ratio > 0) {
        data.ratio -= (dt / 100) * data.speed
      }

      let width = Scalar.Lerp(0, data.fullLength, data.ratio)
      transform.scale.x = width
      transform.position.x = -data.fullLength / 2 + width / 2
      if (data.ratio > 0.5) {
        bar.removeComponent(Material)
        bar.addComponentOrReplace(this.green)
      } else if (data.ratio > 0.2) {
        bar.removeComponent(Material)
        bar.addComponentOrReplace(this.yellow)
      } else if (data.ratio > 0) {
        bar.removeComponent(Material)
        bar.addComponentOrReplace(this.red)
      } else if (data.ratio < 0) {
        //Customer leaves
        /* if (bar.getParent()) {
          engine.removeEntity(bar.getParent(), true)
        } */
      }
    }
  }
  constructor(red: Material, yellow: Material, green: Material) {
    ;(this.red = red), (this.yellow = yellow), (this.green = green)
  }
}

export function createCustProgressBar(parent: Entity, speed: number = 1) {
  let background = new Entity()
  background.addComponent(new PlaneShape())
  background.setParent(parent)
  background.addComponent(
    new Transform({
      position: new Vector3(0.11, 1.9, 0),
      scale: new Vector3(0.82, 0.12, 1),
      rotation: Quaternion.Euler(0, 180, 90)
    })
  )
  engine.addEntity(background)

  let progressBar = new Entity()
  progressBar.addComponent(new PlaneShape())
  progressBar.setParent(background)
  progressBar.addComponent(
    new Transform({
      position: new Vector3(0, 0, -0.01),
      scale: new Vector3(1, 0.8, 1)
    })
  )
  progressBar.addComponent(new CustomerProgressBar(parent, speed))
  engine.addEntity(progressBar)

  return progressBar
}
