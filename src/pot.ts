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
  reset() {
    this.state = SoupState.Raw
    this.hasNoodles = false
  }
}

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

export function ClickPot(GrabberEntity: Entity, pot: Pot, objectGrabberSystem: ObjectGrabberSystem) {
  let grabberComponent = GrabberEntity.get(ObjectGrabberComponent)
  if (grabberComponent.grabbedObject) {
    log('already holding something')
    return
  }
  if (!pot.hasNoodles) {
    log('pot is empty')
    return
  }
  if (pot.state == SoupState.Burned) {
    let trash = new Entity()
    trash.add(new BoxShape())
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
    return
  }
  if (pot.state == SoupState.Raw) {
    log('food is raw')
    return
  }
  if (pot.state == SoupState.Cooked) {
    let soupBowl = new Entity()
    soupBowl.add(new ConeShape())
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
  }
}
