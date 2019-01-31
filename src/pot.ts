import {
  ObjectGrabberComponent,
  GrabableObjectComponent,
  IngredientType,
  ObjectGrabberSystem
} from './grabableObjects'

export const enum SoupState {
  Raw,
  Cooked,
  Burned
}

@Component('pot')
export class Pot {
  state: SoupState = SoupState.Raw
  hasNoodles: boolean = false
  progressBar: Entity

  reset() {
    this.state = SoupState.Raw
    this.hasNoodles = false

    if (this.progressBar) {
      engine.removeEntity(this.progressBar.getParent(), true)
      this.progressBar = null
    }
  }
}

// Called in the dropObject()
export function AddNoodles(DroppedObject: Entity, pot: Pot) {
  let grabbableObject = DroppedObject.get(GrabableObjectComponent)
  if (grabbableObject.type == IngredientType.Noodles) {
    pot.hasNoodles = true
    log('added noodles')
  } else {
    pot.state = SoupState.Burned
    log('ruined soup')
  }

  engine.removeEntity(DroppedObject)
}

// reusable shape components
const soupBowlShape = new GLTFShape('models/PlateNoodles.glb')
const trashShape = new GLTFShape('models/GarbageFood.glb')

// Called in the OnClick component of the pot entity
export function ClickPot(
  GrabberEntity: Entity,
  pot: Pot,
  objectGrabberSystem: ObjectGrabberSystem
) {
  let grabberComponent = GrabberEntity.get(ObjectGrabberComponent)

  if (!pot.hasNoodles) {
    log('pot is empty')
    return
  }

  switch (pot.state) {
    case SoupState.Cooked:
      if (grabberComponent.grabbedObject) {
        log('already holding something')
        return
      }

      let soupBowl = new Entity()
      log('created soup bowl')
      soupBowl.add(soupBowlShape)
      soupBowl.setParent(GrabberEntity)
      soupBowl.add(
        new Transform({
          position: new Vector3(0, 1, 1)
        })
      )
      soupBowl.add(
        new GrabableObjectComponent(IngredientType.CookedNoodles, true)
      )
      soupBowl.add(
        new OnClick(e => {
          objectGrabberSystem.grabObject(soupBowl)
        })
      )
      engine.addEntity(soupBowl)
      grabberComponent.grabbedObject = soupBowl

      pot.reset()
      break
    case SoupState.Burned:
      if (grabberComponent.grabbedObject) {
        log('already holding something')
        return
      }

      let trash = new Entity()
      trash.add(trashShape)
      log('created trash bag')
      trash.setParent(GrabberEntity)
      trash.add(
        new Transform({
          position: new Vector3(0, 1, 1)
        })
      )
      trash.add(new GrabableObjectComponent(IngredientType.Trash, true))
      trash.add(
        new OnClick(e => {
          objectGrabberSystem.grabObject(trash)
        })
      )
      engine.addEntity(trash)
      grabberComponent.grabbedObject = trash

      pot.reset()
      break
    default:
      log('food is raw')
      break
  }
}
