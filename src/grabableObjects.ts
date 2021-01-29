import {
  GridPosition,
  gridPositions,
  getClosestShelf,
  gridObject,
  tileType
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

let grabbedPosition = new Vector3(0, -0.25, 1)

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
  grabbedObject: IEntity = null
}

export class DropObjects implements ISystem {
  update(dt: number) {
    for (let object of grabbableObjects.entities) {
      let ObjectComponent = object.getComponent(GrabableObjectComponent)
      let transform = object.getComponent(Transform)

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
  objectGrabber: IEntity
  targetPosition: Vector3
  targetRotation: Quaternion
  constructor(objectGrabber: IEntity, gridObject: gridObject) {
    this.transform = objectGrabber.getComponent(Transform)
    this.gridObject = gridObject
    this.objectGrabber = objectGrabber
    this.objectGrabberComponent = objectGrabber.getComponent(ObjectGrabberComponent)

    Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, true, e => {

		if (e.hit) {
			let ent = engine.entities[e.hit.entityId]
		  	if (ent.hasComponent(GrabableObjectComponent)){
				this.grabObject(ent)
			}
		}
	})
	
	Input.instance.subscribe("BUTTON_UP", ActionButton.PRIMARY, false, e => {
		log("pointer Up", e)
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

  public grabObject(grabbedObject: IEntity) {
    if (finishedPlaying) return

    if (!this.objectGrabberComponent.grabbedObject) {
      log('grabbed object')
      if (grabbedObject.getParent().hasComponent(GridPosition)) {
        let gridPosition = grabbedObject.getParent()
        gridPosition.getComponent(GridPosition).object = null
      }

      grabbedObject.getComponent(GrabableObjectComponent).grabbed = true
      grabbedObject.setParent(this.objectGrabber)
      grabbedObject.getComponent(Transform).position = grabbedPosition

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

    let shelfComponent = shelf.getComponent(GridPosition)
    let grabbedObject = this.objectGrabberComponent.grabbedObject

    if (shelf && !shelfComponent.object) {
      let type = shelf.getComponent(GridPosition).type
      let plate: CustomerPlate = null
      let potComponent: Pot = null
      switch (type){
        case tileType.Plate:
          plate = shelf.getComponent(CustomerPlate)
          if (
            !plate.ownerCustomer ||
            plate.ownerCustomer.receivedDish ||
            !plate.ownerCustomer.shape.visible
          ) {
            log('Not possible to drop here right now')
            return
          } else {
            log('delivered order')

            plate.dish = grabbedObject.getComponent(GrabableObjectComponent).type
  
            deliverOrder(plate)
            engine.removeEntity(grabbedObject)
  
            //shelfComponent.object = null
          }
          break
        case tileType.Pot:
          potComponent = shelf.getComponent(Pot)
          if (potComponent.hasIngredient) {
            log("that pot already has noodles. Can't drop object here")
            return
          } else {
            log('dropped something in a pot')
            AddNoodles(grabbedObject, potComponent)
            engine.removeEntity(grabbedObject)
            //shelfComponent.object = null
          }    
          break
        case tileType.Cutter:
          log("put something on a cutter")
          // get the key for the first child (the cutter enttiy)
          let firstChildIndex = Object.keys(shelf.children)[0]
          let board = shelf.children[firstChildIndex].getComponent(CuttingBoard)
          AddSushi(
            grabbedObject,
            board
          )
          shelfComponent.object = grabbedObject
          board.rollChild = shelfComponent.object
          this.objectGrabberComponent.grabbedObject = null
          shelfComponent.object.setParent(shelf)
          shelfComponent.object.getComponent(Transform).position = new Vector3(0, 0.3, 0)
          shelfComponent.object.getComponent(GrabableObjectComponent).grabbed = false
          shelfComponent.object.getComponent(GrabableObjectComponent).falling = true
          shelfComponent.object.getComponent(GrabableObjectComponent).origin = 0.3
          shelfComponent.object.getComponent(GrabableObjectComponent).fraction = 0
          
          
          //engine.removeEntity(shelfComponent.object)
          //shelfComponent.object = null
          break
        case tileType.Trash: 
          log('throwing trash')
          engine.removeEntity(grabbedObject)
          shelfComponent.object = null
          break
        case tileType.Shelf:
          shelfComponent.object = grabbedObject
          this.objectGrabberComponent.grabbedObject = null
          shelfComponent.object.setParent(shelf)
          shelfComponent.object.getComponent(Transform).position = new Vector3(0, 0.3, 0)
          shelfComponent.object.getComponent(GrabableObjectComponent).grabbed = false
          shelfComponent.object.getComponent(GrabableObjectComponent).falling = true
          shelfComponent.object.getComponent(GrabableObjectComponent).origin = 0.3
          shelfComponent.object.getComponent(GrabableObjectComponent).fraction = 0
          break
        case tileType.Floor:
          shelfComponent.object = grabbedObject
          this.objectGrabberComponent.grabbedObject = null
          shelfComponent.object.setParent(shelf)
          shelfComponent.object.getComponent(Transform).position = new Vector3(0, 0.3, 0)
          shelfComponent.object.getComponent(GrabableObjectComponent).grabbed = false
          shelfComponent.object.getComponent(GrabableObjectComponent).falling = true
          shelfComponent.object.getComponent(GrabableObjectComponent).origin = 0.3
          shelfComponent.object.getComponent(GrabableObjectComponent).fraction = 0
          break
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
