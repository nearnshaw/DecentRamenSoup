import {
  GridPosition,
  gridPositions,
  getClosestShelf,
  gridObject
} from './grid'
import { Pot, AddNoodles } from './pot'
import { CustomerPlate, deliverOrder } from './customer'
import { CuttingBoard, AddSushi } from './cuttingBoard'

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

  constructor(type: IngredientType, grabbed: boolean = false) {
    this.type = type
    this.grabbed = grabbed
  }
}

@Component('objectGrabberComponent')
export class ObjectGrabberComponent {
  grabbedObject: Entity = null
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
    if (!this.objectGrabberComponent.grabbedObject) {
      log('grabbed object')
      if (grabbedObject.getParent().has(GridPosition)) {
        let gridPosition = grabbedObject.getParent()
        gridPosition.get(GridPosition).object = null
      }

      grabbedObject.get(GrabableObjectComponent).grabbed = true
      grabbedObject.setParent(this.objectGrabber)
      grabbedObject.get(Transform).position.set(0, 1, 1)

      this.objectGrabberComponent.grabbedObject = grabbedObject
    } else {
      log('already holding')
    }
  }

  dropObject() {
    if (!this.objectGrabberComponent.grabbedObject) return

    let gridPosition = getClosestShelf(
      Camera.instance.position,
      this.calculateDirectionBasedOnYRotation(
        Camera.instance.rotation.eulerAngles.y
      ),
      this.gridObject
    )

    if (gridPosition) {
      let plate: CustomerPlate = null
      if (gridPosition.has(CustomerPlate)) {
        plate = gridPosition.get(CustomerPlate)

        if (
          !plate.ownerCustomer ||
          plate.ownerCustomer.receivedDish ||
          !plate.ownerCustomer.shape.visible
        ) {
          log('Not possible to drop here right now')
          return
        }
      }

      gridPosition.get(
        GridPosition
      ).object = this.objectGrabberComponent.grabbedObject

      this.objectGrabberComponent.grabbedObject.setParent(gridPosition)

      this.objectGrabberComponent.grabbedObject.get(
        Transform
      ).position = Vector3.Zero()

      this.objectGrabberComponent.grabbedObject.get(
        GrabableObjectComponent
      ).grabbed = false

      if (gridPosition.has(Pot)) {
        log('dropped something in a pot')

        AddNoodles(
          this.objectGrabberComponent.grabbedObject,
          gridPosition.get(Pot)
        )

        gridPosition.get(GridPosition).object = null
      } else if (gridPosition.has(CuttingBoard)) {
        log('dropped something in a cutting board')

        AddSushi(
          this.objectGrabberComponent.grabbedObject,
          gridPosition.get(CuttingBoard)
        )

        gridPosition.get(GridPosition).object = null
      } else if (plate) {
        log('delivered order')

        plate.dish = this.objectGrabberComponent.grabbedObject.get(
          GrabableObjectComponent
        ).type

        deliverOrder(plate)
        engine.removeEntity(this.objectGrabberComponent.grabbedObject)

        gridPosition.get(GridPosition).object = null
      }

      this.objectGrabberComponent.grabbedObject = null
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
