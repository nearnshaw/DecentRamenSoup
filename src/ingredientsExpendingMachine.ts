import {
  GrabableObjectComponent,
  ObjectGrabberSystem,
  IngredientType
} from './grabableObjects'

// reusable shape components
const noodlesShape = new GLTFShape('models/NoodlesRaw.glb')
const rollShape = new GLTFShape('models/SushiRoll.glb')

@Component('ingredientExpendingMachineComponent')
export class IngredientExpendingMachineComponent {
  ingredientType: IngredientType
  lastCreatedIngredient: Entity
  spawningPosition: Vector3
  objectGrabberSystemReference: ObjectGrabberSystem
  objectGrabberEntityReference: Entity
  parentEntity: Entity

  constructor(
    type: IngredientType,
    expendingPosition: Vector3,
    objectGrabberSystem: ObjectGrabberSystem,
    objectGrabberEntity: Entity,
    parentEntity: Entity
  ) {
    this.ingredientType = type
    this.spawningPosition = expendingPosition

    this.objectGrabberSystemReference = objectGrabberSystem
    this.objectGrabberEntityReference = objectGrabberEntity
    this.parentEntity = parentEntity
  }

  public createIngredient() {
    if (this.lastCreatedIngredient) return

    let ent = new Entity()

    ent.addComponent(new GrabableObjectComponent(this.ingredientType, false, true, 0.5))

    ent.addComponent(
      new Transform({
        position: new Vector3().copyFrom(this.spawningPosition)
        //,scale: new Vector3(0.5, 0.5, 0.5)
      })
    )
    switch (this.ingredientType) {
      case IngredientType.Noodles:
        ent.addComponent(noodlesShape)
        break
      case IngredientType.SushiRoll:
        ent.addComponent(rollShape)
        break
    }
    ent.setParent(this.parentEntity)

    engine.addEntity(ent)

    ent.addComponent(
      new OnPointerDown(e => {
        this.objectGrabberSystemReference.grabObject(ent)
        this.lastCreatedIngredient = null
      })
    )
    this.lastCreatedIngredient = ent
  }
}
