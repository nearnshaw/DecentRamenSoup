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
  state: SoupState
  hasNoodles: boolean
  progressBar: Entity
  attachedEntity: Entity

  constructor(attachedEntity: Entity) {
    this.attachedEntity = attachedEntity
    this.reset()
  }

  reset() {
    this.state = SoupState.Raw

    updatePotMesh(this.attachedEntity, SoupState.Raw)

    this.hasNoodles = false

    if (this.progressBar) {
      engine.removeEntity(this.progressBar.getParent(), true)
      this.progressBar = null
    }
  }
}

let emptyPotModel = new GLTFShape('models/CookingPotClean.glb')
let noodlesPotModel = new GLTFShape('models/CookingPotNoodles.glb')
let trashPotModel = new GLTFShape('models/CookingPotDirty.glb')

export function updatePotMesh(potEntity: Entity, newMeshtype: SoupState) {
  switch (newMeshtype) {
    case SoupState.Raw:
      if (potEntity.has(GLTFShape)) {
        potEntity.remove(GLTFShape)
      }
      potEntity.add(emptyPotModel)
      break
    case SoupState.Cooked:
      potEntity.remove(GLTFShape)

      potEntity.add(noodlesPotModel)
      break
    case SoupState.Burned:
      potEntity.remove(GLTFShape)

      potEntity.add(trashPotModel)
      break
  }
}

// Called in the dropObject()
export function AddNoodles(DroppedObject: Entity, pot: Pot) {
  let grabbableObject = DroppedObject.get(GrabableObjectComponent)
  if (grabbableObject.type == IngredientType.Noodles) {
    pot.hasNoodles = true
    updatePotMesh(pot.attachedEntity, SoupState.Cooked)
    log('added noodles')
  } else {
    pot.state = SoupState.Burned
    updatePotMesh(pot.attachedEntity, SoupState.Burned)
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
