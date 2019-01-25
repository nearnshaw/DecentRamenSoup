import {
  GrabableObjectComponent,
  ObjectGrabberSystem,
  IngredientType
} from "./grabableObjects"

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
      })
    )

    ent.add(new SphereShape())

    ent.setParent(this.parentEntity)

    engine.addEntity(ent)

    ent.add(
      new OnClick(e => {
        this.objectGrabberSystemReference.grabObject(
          ent,
          this.objectGrabberEntityReference
        )
        this.lastCreatedIngredient = null
      })
    )
    this.lastCreatedIngredient = ent
  }
}
