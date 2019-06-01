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
  hasIngredient: boolean
  progressBar: IEntity
  attachedEntity: IEntity

  constructor(attachedEntity: IEntity) {
    this.attachedEntity = attachedEntity
    this.reset()
  }

  reset() {
    this.state = SoupState.Raw

    updatePotMesh(this.attachedEntity, SoupState.Raw)

    this.hasIngredient = false

    if (this.progressBar) {
      engine.removeEntity(this.progressBar.getParent())
      this.progressBar = null
    }
  }
}

let emptyPotModel = new GLTFShape('models/CookingPotClean.glb')
let noodlesPotModel = new GLTFShape('models/CookingPotNoodles.glb')
let trashPotModel = new GLTFShape('models/CookingPotDirty.glb')

export function updatePotMesh(potEntity: IEntity, newMeshtype: SoupState) {
  switch (newMeshtype) {
    case SoupState.Raw:
      if (potEntity.hasComponent(GLTFShape)) {
        potEntity.removeComponent(GLTFShape)
      }
      potEntity.addComponent(emptyPotModel)
      break
    case SoupState.Cooked:
      potEntity.removeComponent(GLTFShape)

      potEntity.addComponent(noodlesPotModel)
      break
    case SoupState.Burned:
      potEntity.removeComponent(GLTFShape)

      potEntity.addComponent(trashPotModel)
      break
  }
}

// Called in the dropObject()
export function AddNoodles(DroppedObject: IEntity, pot: Pot) {
  let grabbableObject = DroppedObject.getComponent(GrabableObjectComponent)

  pot.hasIngredient = true
  if (grabbableObject.type == IngredientType.Noodles) {
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
  GrabberEntity: IEntity,
  pot: Pot,
  objectGrabberSystem: ObjectGrabberSystem
) {
  let grabberComponent = GrabberEntity.getComponent(ObjectGrabberComponent)

  if (!pot.hasIngredient) {
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
      soupBowl.addComponent(soupBowlShape)
      soupBowl.setParent(GrabberEntity)
      soupBowl.addComponent(
        new Transform({
          position: new Vector3(0, 1.25, 1)
        })
      )
      soupBowl.addComponent(
        new GrabableObjectComponent(IngredientType.CookedNoodles, true)
      )
      soupBowl.addComponent(
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
      trash.addComponent(trashShape)
      log('created trash bag')
      trash.setParent(GrabberEntity)
      trash.addComponent(
        new Transform({
          position: new Vector3(0, 1.25, 1)
        })
      )
      trash.addComponent(new GrabableObjectComponent(IngredientType.Trash, true))
      trash.addComponent(
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
