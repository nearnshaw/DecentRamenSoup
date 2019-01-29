import {
  ObjectGrabberComponent,
  GrabableObjectComponent,
  IngredientType
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

export function ClickPot(GrabberEntity: Entity, pot: Pot) {
  let grabberComponent = GrabberEntity.get(ObjectGrabberComponent)
  if (grabberComponent.grabbedObject) {
    log('already holding something')
    return
    // let object = grabberComponent.grabbedObject
    // let grabbableObject = object.get(GrabableObjectComponent)
    // if (grabbableObject.type == IngredientType.Noodles){
    //     engine.removeEntity(object)
    //     pot.hasNoodles = true
    //     log("added noodles")
    // } else {
    //     log("holding something else")
    //     return
    // }
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
    engine.addEntity(trash)
    grabberComponent.grabbedObject = trash
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
    engine.addEntity(soupBowl)
    grabberComponent.grabbedObject = soupBowl
    pot.reset()
  }
}
