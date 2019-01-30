import {
  GrabableObjectComponent,
  ObjectGrabberSystem,
  IngredientType
} from "./grabableObjects"


// reusable shape components
const noodlesShape = new GLTFShape("models/CookingPot.glb")
const rollShape = new GLTFShape("models/CookingPot.glb")


@Component("ingredientExpendingMachineComponent")
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

    ent.add(
      new GrabableObjectComponent(this.ingredientType)
    )

    ent.set(
      new Transform({
        position: new Vector3().copyFrom(this.spawningPosition)
        //,scale: new Vector3(0.5, 0.5, 0.5)
      })
    )
    switch (this.ingredientType) {
      case IngredientType.Noodles:
        ent.add(noodlesShape)
        break
      case IngredientType.SushiRoll:
        ent.add(rollShape)
        break
    }
    ent.setParent(this.parentEntity)

    engine.addEntity(ent)

    ent.add(
      new OnClick(e => {
        this.objectGrabberSystemReference.grabObject(
          ent
        )
        this.lastCreatedIngredient = null
      })
    )
    this.lastCreatedIngredient = ent
  }
}


