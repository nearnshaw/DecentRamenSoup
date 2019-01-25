import { ProgressBarUpdate, ProgressBar } from "./progressBar"
import { GridPosition, gridPositions, getClosestPos } from "./grid"
import { IngredientExpendingMachineComponent } from "./ingredientsExpendingMachine"
import {
  GrabableObjectComponent,
  ObjectGrabberComponent,
  ObjectGrabberSystem,
  IngredientType
} from "./grabableObjects"

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

const objectGrabberSystem = new ObjectGrabberSystem(
  objectGrabber,
  input,
  camera
)

engine.addSystem(objectGrabberSystem)

// ----------------------------
// colors for progress bars

let greenMaterial = new Material()
greenMaterial.albedoColor = new Color3(0.67, 1, 0.75)

let yellowMaterial = new Material()
greenMaterial.albedoColor = new Color3(1, 1, 0.25)

let redMaterial = new Material()
greenMaterial.albedoColor = Color3.Red()

engine.addSystem(
  new ProgressBarUpdate(redMaterial, yellowMaterial, greenMaterial)
)
// ----------------------------
let box = new Entity()
box.add(new BoxShape())
box.get(BoxShape).withCollisions = true
box.add(new GrabableObjectComponent(IngredientType.Noodles))
box.add(redMaterial)
box.set(
  new Transform({
    position: new Vector3(10, 0.5, 7),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
box.add(
  new OnClick(e => {
    objectGrabberSystem.grabObject(box, objectGrabber)
  })
)
engine.addEntity(box)

let box2 = new Entity()
box2.add(new BoxShape())
box2.get(BoxShape).withCollisions = true
box2.add(new GrabableObjectComponent(IngredientType.Sushi))
box2.add(greenMaterial)
box2.set(
  new Transform({
    position: new Vector3(10, 0.5, 5),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
box2.add(
  new OnClick(e => {
    objectGrabberSystem.grabObject(box2, objectGrabber)
  })
)
engine.addEntity(box2)

let progressBar1 = new Entity()
progressBar1.add(new PlaneShape())
progressBar1.setParent(box2)
progressBar1.set(
  new Transform({
    position: new Vector3(0, 1, 0),
    scale: new Vector3(0.8, 0.1, 1)
  })
)
progressBar1.set(greenMaterial)
progressBar1.add(new ProgressBar())
engine.addEntity(progressBar1)

// --------------------------------

let noodlesExpendingMachine = new Entity()
noodlesExpendingMachine.set(
  new Transform({
    position: new Vector3(10, 1, 10)
  })
)
noodlesExpendingMachine.set(new BoxShape())

let noodleExpendingComponent = new IngredientExpendingMachineComponent(
  1,
  new Vector3(0, 1, 0),
  objectGrabberSystem,
  objectGrabber,
  noodlesExpendingMachine
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
environment.add(
  new Transform({
    position: new Vector3(10, 0, 10)
  })
)
engine.addEntity(environment)
