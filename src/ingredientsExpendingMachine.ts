import { GrabableObjectComponent, ObjectGrabberSystem } from "./grabableObjects"

@Component("ingredientExpendingMachineComponent")
export class IngredientExpendingMachineComponent {
  ingredientType: number
  lastCreatedIngredient: Entity
  spawningPosition: Vector3
  objectGrabberSystemReference: ObjectGrabberSystem
  objectGrabberEntityReference: Entity

  constructor(
    type,
    expendingPosition,
    objectGrabberSystem: ObjectGrabberSystem,
    objectGrabberEntity: Entity
  ) {
    if (type < 0 || type > 2) {
      type = 1
    }

    this.ingredientType = type
    this.spawningPosition = expendingPosition

    this.objectGrabberSystemReference = objectGrabberSystem
    this.objectGrabberEntityReference = objectGrabberEntity
  }

  public createIngredient() {
    if (this.lastCreatedIngredient) return

    this.lastCreatedIngredient = new Entity()

    this.lastCreatedIngredient.add(
      new GrabableObjectComponent(this.ingredientType)
    )

    this.lastCreatedIngredient.set(
      new Transform({
        position: new Vector3().copyFrom(this.spawningPosition)
      })
    )

    this.lastCreatedIngredient.add(new SphereShape())

    engine.addEntity(this.lastCreatedIngredient)

    this.lastCreatedIngredient.add(
      new OnClick(e => {
        this.objectGrabberSystemReference.grabObject(
          this.lastCreatedIngredient,
          this.objectGrabberEntityReference
        )

        this.lastCreatedIngredient = null
      })
    )
  }
}
