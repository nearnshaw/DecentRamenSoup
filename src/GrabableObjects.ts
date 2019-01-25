@Component("grabableObjectComponent")
export class GrabableObjectComponent {
  grabbed: boolean = false
  type: number = 1 // 1 = Noodles | 2 = Sushi

  constructor(type = 1) {
    if (type < 0 || type > 2) {
      type = 1
    }

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
  cameraReference: Camera

  constructor(objectGrabber: Entity, input: Input, camera: Camera) {
    this.transform = objectGrabber.get(Transform)
    this.objectGrabberComponent = objectGrabber.get(ObjectGrabberComponent)

    input.subscribe("BUTTON_A_DOWN", e => {
      this.dropObject()
    })

    this.cameraReference = camera
  }

  update() {
    this.transform.position = this.cameraReference.position
    this.transform.rotation = this.cameraReference.rotation
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
    /* this.objectGrabberComponent.grabbedObject.setParent(
      getClosestPos(cameraReference.position)
    ) */

    this.objectGrabberComponent.grabbedObject.get(
      Transform
    ).position = Vector3.Zero()

    this.objectGrabberComponent.grabbedObject = null
  }
}
