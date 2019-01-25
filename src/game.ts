import { ProgressBarUpdate, ProgressBar } from "./progressBar";
import { GridPosition, gridPositions, getClosestPos } from "./grid";

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
  // lifter: Entity ?
}

// object to get buttonUp and buttonDown events
const input = Input.instance

// object to get user position and rotation
const camera = Camera.instance

// ----------------------------

let objectGrabber = new Entity()
objectGrabber.add(
  new Transform({
    position: camera.position,
    rotation: camera.rotation
  })
)
objectGrabber.add(new ObjectGrabberComponent())
engine.addEntity(objectGrabber)

export class ObjectGrabberSystem implements ISystem {
  transform = objectGrabber.get(Transform)
  objectGrabberComponent = objectGrabber.get(ObjectGrabberComponent)

  constructor() {
    input.subscribe("BUTTON_A_DOWN", e => {
      this.dropObject()
    })
  }

  update() {
    this.transform.position = camera.position
    this.transform.rotation = camera.rotation
  }

  public grabObject(grabbedObject: Entity) {
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

    this.objectGrabberComponent.grabbedObject.setParent(getClosestPos(camera))
    this.objectGrabberComponent.grabbedObject.get(
      Transform
    ).position = Vector3.Zero()

    this.objectGrabberComponent.grabbedObject = null
  }
}

const objectGrabberSystem = new ObjectGrabberSystem()

engine.addSystem(objectGrabberSystem)






// ----------------------------
// colors for progress bars

let greenMaterial = new Material()
greenMaterial.albedoColor = new Color3(0.67, 1, 0.75)

let yellowMaterial = new Material()
greenMaterial.albedoColor = new Color3(1, 1, 0.25)

let redMaterial = new Material()
greenMaterial.albedoColor = Color3.Red()

engine.addSystem(new ProgressBarUpdate(redMaterial, yellowMaterial, greenMaterial))

// ----------------------------
let box = new Entity()
box.add(new BoxShape())
box.get(BoxShape).withCollisions = true
box.add(new GrabableObjectComponent())
box.add(redMaterial)
box.set(
  new Transform({
    position: new Vector3(10, 0.5, 7),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
box.add(
  new OnClick(e => {
    objectGrabberSystem.grabObject(box)
  })
)
engine.addEntity(box);

let box2 = new Entity()
box2.add(new BoxShape())
box2.get(BoxShape).withCollisions = true
box2.add(new GrabableObjectComponent())
box2.add(greenMaterial)
box2.set(
  new Transform({
    position: new Vector3(10, 0.5, 5),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
box2.add(
  new OnClick(e => {
    objectGrabberSystem.grabObject(box2)
  })
)
engine.addEntity(box2)


let progressBar1 = new Entity()
progressBar1.add(new PlaneShape())
progressBar1.setParent(box2)
progressBar1.set(new Transform({
  position: new Vector3(0, 1, 0),
  scale: new Vector3(0.8, 0.1, 1)
}))
progressBar1.set(greenMaterial)
progressBar1.add(new ProgressBar())
engine.addEntity(progressBar1)


// --------------------------------

@Component("ingredientExpendingMachineComponent")
export class IngredientExpendingMachineComponent {
  ingredientType: number
  lastCreatedIngredient: Entity
  spawningPosition: Vector3

  constructor(type, expendingPosition) {
    if (type < 0 || type > 2) {
      type = 1
    }

    this.ingredientType = type
    this.spawningPosition = expendingPosition
  }

  public createIngredient() {
    if (this.lastCreatedIngredient) return

    this.lastCreatedIngredient = new Entity()

    this.lastCreatedIngredient.add(
      new GrabableObjectComponent(this.ingredientType)
    )

    log("expending position used: " + this.spawningPosition)

    this.lastCreatedIngredient.set(
      new Transform({
        position: new Vector3().copyFrom(this.spawningPosition)
      })
    )

    this.lastCreatedIngredient.add(new SphereShape())

    engine.addEntity(this.lastCreatedIngredient)

    this.lastCreatedIngredient.add(
      new OnClick(e => {
        objectGrabberSystem.grabObject(this.lastCreatedIngredient)

        this.lastCreatedIngredient = null
      })
    )
  }
}

let noodlesExpendingMachine = new Entity()
noodlesExpendingMachine.set(
  new Transform({
    position: new Vector3(5, 1, 5)
  })
)
noodlesExpendingMachine.set(new BoxShape())

let noodleExpendingComponent = new IngredientExpendingMachineComponent(
  1,
  new Vector3(5, 2, 5)
)
noodlesExpendingMachine.set(noodleExpendingComponent)

noodlesExpendingMachine.add(
  new OnClick(e => {
    noodleExpendingComponent.createIngredient()
  })
)

engine.addEntity(noodlesExpendingMachine)

// scenery 3D model
let environment = new Entity()
environment.add(new GLTFShape("models/Environment.glb"))
environment.add(new Transform({
  position: new Vector3(10, 0, 10)
}))
engine.addEntity(environment)