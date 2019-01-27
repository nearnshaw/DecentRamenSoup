import { GridPosition, gridPositions, getClosestShelf } from "./grid"

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
    // log("camera rotation: " + Camera.instance.rotation.eulerAngles)
    this.transform.position = Camera.instance.position
    this.transform.rotation = Camera.instance.rotation
  }

  public grabObject(grabbedObject: Entity, objectGrabber: Entity) {
    if (!this.objectGrabberComponent.grabbedObject) {
      log("grabbed object")
      if (grabbedObject.getParent().has(GridPosition)){
        let gridPosition = grabbedObject.getParent()
        gridPosition.get(GridPosition).object = null
      }
    
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

    let gridPosition = getClosestShelf(
      Camera.instance.position,
      this.calculateDirectionBasedOnYRotation(
        Camera.instance.rotation.eulerAngles.y
      )
    )
    
    if (gridPosition){
      gridPosition.get(GridPosition).object = this.objectGrabberComponent.grabbedObject
      this.objectGrabberComponent.grabbedObject.setParent(
          gridPosition
        )
      this.objectGrabberComponent.grabbedObject.get(
          Transform
        ).position = Vector3.Zero()
      this.objectGrabberComponent.grabbedObject.get(
          GrabableObjectComponent
        ).grabbed = false
      this.objectGrabberComponent.grabbedObject = null 
    } else {
      log("not possible to drop here")
    }  
  }

  calculateDirectionBasedOnYRotation(yRotation: number) {
    let direction = new Vector3()

    // To normalize the Z component of the direction vector
    if (yRotation < 90) {
      direction.z = 1 - yRotation / 90
    } else if (yRotation < 180) {
      direction.z = ((yRotation - 90) / 90) * -1
    } else if (yRotation < 270) {
      direction.z = (1 - (yRotation - 180) / 90) * -1
    } else {
      // >= 270
      direction.z = (yRotation - 270) / 90
    }

    // To normalize the X component of the direction vector
    if (yRotation < 90) {
      direction.x = yRotation / 90
    } else if (yRotation < 180) {
      direction.x = 1 - (yRotation - 90) / 90
    } else if (yRotation < 270) {
      direction.x = ((yRotation - 180) / 90) * -1
    } else {
      // >= 270
      direction.x = (1 - (yRotation - 270) / 90) * -1
    }

    let absoluteXValue = Math.abs(direction.x)
    let absoluteZValue = Math.abs(direction.z)
    if (
      absoluteXValue <= 0.75 &&
      absoluteXValue >= 0.25 &&
      absoluteZValue <= 0.75 &&
      absoluteZValue >= 0.25
    ) {
      direction.x = 1 * (direction.x < 0 ? -1 : 1)
      direction.z = 1 * (direction.z < 0 ? -1 : 1)
    }

    return direction
  }
}
