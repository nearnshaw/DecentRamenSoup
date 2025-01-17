import { Pot, SoupState, updatePotMesh } from './pot'
import { smokeSpawner } from './smoke'
import { finishedPlaying } from './finishedGameUI'

@Component('progressBar')
export class PotProgressBar {
  ratio: number = 0
  fullLength: number = 0.9
  movesUp: boolean = true
  color: Material
  speed: number = 1
  parent: IEntity
  smokeInterval = 3
  nextSmoke = this.smokeInterval
  // parent type (pot / customer)
  constructor(parent: IEntity, speed: number = 1, movesUp: boolean = true) {
    this.parent = parent
    this.speed = speed
    this.movesUp = movesUp
  }
}

// component group grid positions
const progressBars = engine.getComponentGroup(PotProgressBar)

export class ProgressBarUpdate implements ISystem {
  red: Material
  yellow: Material
  green: Material
  update(dt: number) {
    if (finishedPlaying) return

    for (let bar of progressBars.entities) {
      let transform = bar.getComponent(Transform)
      let data = bar.getComponent(PotProgressBar)
      let pot = data.parent.getComponent(Pot)
      if (!pot.hasIngredient && bar.getParent()) {
        engine.removeEntity(bar.getParent())
      }

      if (data.ratio < 1) {
        data.ratio += (dt / 20) * data.speed
      }

      let width = Scalar.Lerp(0, data.fullLength, data.ratio)
      transform.scale.x = width
      transform.position.x = -data.fullLength / 2 + width / 2
      if (data.ratio < 0.5) {
        bar.removeComponent(Material)
        bar.addComponentOrReplace(this.yellow)
      } else if (data.ratio < 0.7) {
        bar.removeComponent(Material)
        bar.addComponentOrReplace(this.green)

        pot.state = SoupState.Cooked
        updatePotMesh(pot.attachedEntity, SoupState.Cooked)

        data.smokeInterval *= 0.99
      } else if (data.ratio < 1) {
        bar.removeComponent(Material)
        bar.addComponentOrReplace(this.red)
        data.smokeInterval *= 0.98
      } else if (data.ratio > 1) {
        pot.state = SoupState.Burned
        updatePotMesh(pot.attachedEntity, SoupState.Burned)

        if (bar.getParent()) {
          engine.removeEntity(bar.getParent())
          data = null
        }
      }

      if (data) {
        data.nextSmoke -= dt

        if (data.nextSmoke < 0) {
          data.nextSmoke = data.smokeInterval
          smokeSpawner.SpawnSmokePuff(data.parent)
        }
      }
    }
  }
  constructor(red: Material, yellow: Material, green: Material) {
    ;(this.red = red), (this.yellow = yellow), (this.green = green)
  }
}

export function createPotProgressBar(
  parent: IEntity,
  yRotation: number = 0,
  speed: number = 1,
  height: number = 1
) {
  let background = new Entity()
  background.addComponent(new PlaneShape())
  background.setParent(parent)
  background.addComponent(
    new Transform({
      position: new Vector3(0, height, 0),
      scale: new Vector3(0.82, 0.15, 1),
      rotation: Quaternion.Euler(0, yRotation, 0)
    })
  )
  engine.addEntity(background)

  let progressBar = new Entity()
  progressBar.addComponent(new PlaneShape())
  progressBar.setParent(background)
  progressBar.addComponent(
    new Transform({
      position: new Vector3(0, 0, -0.05),
      scale: new Vector3(0.95, 0.8, 1)
    })
  )
  progressBar.addComponent(new PotProgressBar(parent))
  engine.addEntity(progressBar)

  return progressBar
}
