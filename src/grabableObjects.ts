import { GridPosition, gridPositions, getClosestPos } from "./grid"

export const enum IngredientType {
  Noodles,
  Sushi
}

@Component("grabableObjectComponent")
export class GrabableObjectComponent {
  grabbed: boolean = false
  type: IngredientType = IngredientType.Noodles

  constructor(type: IngredientType) {
    this.type = type
  }
}

@Component("objectGrabberComponent")
export class ObjectGrabberComponent {
  grabbedObject: Entity = null
}

export class ObjectGrabberSystem implements ISystem {
  transform: Transform
  objectGrabberComponent: ObjectGrabberComponent

  constructor(objectGrabber: Entity) {
    this.transform = objectGrabber.get(Transform)
    this.objectGrabberComponent = objectGrabber.get(ObjectGrabberComponent)

    Input.instance.subscribe("BUTTON_A_DOWN", e => {
      this.dropObject()
    })
  }

  update() {
    this.transform.position = Camera.instance.position
    this.transform.rotation = Camera.instance.rotation
  }

  public grabObject(grabbedObject: Entity, objectGrabber: Entity) {
    if (!this.objectGrabberComponent.grabbedObject) {
      grabbedObject.get(GrabableObjectComponent).grabbed = true
      grabbedObject.setParent(objectGrabber)
      grabbedObject.get(Transform).position.set(0, 1, 1)

      this.objectGrabberComponent.grabbedObject = grabbedObject
    } else {
      log("already holding")
    }
  }

  dropObject() {
    if (!this.objectGrabberComponent.grabbedObject) return

    this.objectGrabberComponent.grabbedObject.get(
      GrabableObjectComponent
    ).grabbed = false

    // TODO: Re-add this when the grid has been moved into a new file
    this.objectGrabberComponent.grabbedObject.setParent(
      getClosestPos(Camera.instance)
    )

    this.objectGrabberComponent.grabbedObject.get(
      Transform
    ).position = Vector3.Zero()

    this.objectGrabberComponent.grabbedObject = null
  }
}
