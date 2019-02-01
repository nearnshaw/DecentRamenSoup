import {
  GridPosition,
  gridPositions,
  getClosestShelf,
  gridObject
} from './grid'
import { Pot, AddNoodles } from './pot'
import { CustomerPlate, deliverOrder } from './customer'
import { CuttingBoard, AddSushi } from './cuttingBoard'
import { finishedPlaying } from './finishedGameUI'
import { Trash } from './trashCan'

export const enum IngredientType {
  Noodles,
  SushiRoll,
  CookedNoodles,
  SlicedSushi,
  Trash,
  COUNT
}

@Component('grabableObjectComponent')
export class GrabableObjectComponent {
  grabbed: boolean = false
  type: IngredientType = IngredientType.Noodles
  falling: boolean = false
  origin: number = 0.4
  target: number = 0
  fraction: number = 0
  constructor(
    type: IngredientType,
    grabbed: boolean = false,
    falling: boolean = false,
    origin: number = 0
  ) {
    this.type = type
    this.grabbed = grabbed
    this.falling = falling
    if (falling) {
      this.origin = origin
    }
  }
}

// component group for all grabbable objects
export const grabbableObjects = engine.getComponentGroup(
  GrabableObjectComponent
)

@Component('objectGrabberComponent')
export class ObjectGrabberComponent {
  grabbedObject: Entity = null
}

export class DropObjects implements ISystem {
  update(dt: number) {
    for (let object of grabbableObjects.entities) {
      let ObjectComponent = object.get(GrabableObjectComponent)
      let transform = object.get(Transform)

      if (ObjectComponent.falling) {
        ObjectComponent.fraction += dt * 3
        if (ObjectComponent.fraction > 1) {
          ObjectComponent.falling = false
        }
        transform.position.y = Scalar.Lerp(
          ObjectComponent.origin,
          ObjectComponent.target,
          ObjectComponent.fraction
        )
      }
    }
  }
}

export class ObjectGrabberSystem implements ISystem {
  transform: Transform
  objectGrabberComponent: ObjectGrabberComponent
  gridObject: gridObject
  objectGrabber: Entity
  targetPosition: Vector3
  targetRotation: Quaternion
  constructor(objectGrabber: Entity, gridObject: gridObject) {
    this.transform = objectGrabber.get(Transform)
    this.gridObject = gridObject
    this.objectGrabber = objectGrabber
    this.objectGrabberComponent = objectGrabber.get(ObjectGrabberComponent)

    Input.instance.subscribe('BUTTON_A_DOWN', e => {
      this.dropObject()
    })
  }

  update(deltaTime: number) {
    this.targetPosition = Camera.instance.position
    this.targetRotation = Camera.instance.rotation

    let lerpingSpeed = 15
    this.transform.position = Vector3.Lerp(
      this.transform.position,
      this.targetPosition,
      deltaTime * lerpingSpeed
    )

    this.transform.rotation = Quaternion.Slerp(
      this.transform.rotation,
      this.targetRotation,
      deltaTime * lerpingSpeed
    )
  }

  public grabObject(grabbedObject: Entity) {
    if (finishedPlaying) return

    if (!this.objectGrabberComponent.grabbedObject) {
      log('grabbed object')
      if (grabbedObject.getParent().has(GridPosition)) {
        let gridPosition = grabbedObject.getParent()
        gridPosition.get(GridPosition).object = null
      }

      grabbedObject.get(GrabableObjectComponent).grabbed = true
      grabbedObject.setParent(this.objectGrabber)
      grabbedObject.get(Transform).position.set(0, 1.25, 1)

      this.objectGrabberComponent.grabbedObject = grabbedObject
    } else {
      log('already holding')
    }
  }

  dropObject() {
    if (finishedPlaying || !this.objectGrabberComponent.grabbedObject) return

    let shelf = getClosestShelf(
      Camera.instance.position,
      this.calculateDirectionBasedOnYRotation(
        Camera.instance.rotation.eulerAngles.y
      ),
      this.gridObject
    )

    let shelfComponent = shelf.get(GridPosition)

    if (shelf && (shelfComponent.Cutter || !shelfComponent.object)) {
      let plate: CustomerPlate = null
      if (shelf.has(CustomerPlate)) {
        plate = shelf.get(CustomerPlate)

        if (
          !plate.ownerCustomer ||
          plate.ownerCustomer.receivedDish ||
          !plate.ownerCustomer.shape.visible
        ) {
          log('Not possible to drop here right now')
          return
        }
      }

      shelfComponent.object = this.objectGrabberComponent.grabbedObject
      this.objectGrabberComponent.grabbedObject = null

      shelfComponent.object.setParent(shelf)
      shelfComponent.object.get(Transform).position = new Vector3(0, 0.3, 0)
      shelfComponent.object.get(GrabableObjectComponent).grabbed = false
      shelfComponent.object.get(GrabableObjectComponent).falling = true
      shelfComponent.object.get(GrabableObjectComponent).origin = 0.3
      shelfComponent.object.get(GrabableObjectComponent).fraction = 0

      if (shelf.has(Pot)) {
        let potComponent = shelf.get(Pot)
        if (potComponent.hasIngredient) {
          log("that pot already has noodles. Can't drop object here")
          return
        }

        log('dropped something in a pot')

        AddNoodles(shelfComponent.object, potComponent)
        engine.removeEntity(shelfComponent.object)
        shelfComponent.object = null
      } else if (shelf.get(GridPosition).Cutter) {
        log('dropped something in a cutting board')

        AddSushi(
          shelfComponent.object,
          shelf.get(GridPosition).Cutter.get(CuttingBoard)
        )
        //engine.removeEntity(shelfComponent.object)
        //shelfComponent.object = null
      } else if (plate) {
        log('delivered order')

        plate.dish = shelfComponent.object.get(GrabableObjectComponent).type

        deliverOrder(plate)
        engine.removeEntity(shelfComponent.object)

        shelfComponent.object = null
      } else if (shelf.has(Trash)) {
        log('throwing trash')
        engine.removeEntity(shelfComponent.object)
        shelfComponent.object = null
      }
    } else {
      log('not possible to drop here')
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
