import { ProgressBarUpdate, ProgressBar, createProgressBar } from "./progressBar"
import { GridPosition, gridPositions, getClosestShelf, gridObject } from "./grid"
import { IngredientExpendingMachineComponent } from "./ingredientsExpendingMachine"
import {
  GrabableObjectComponent,
  ObjectGrabberComponent,
  ObjectGrabberSystem,
  IngredientType
} from "./grabableObjects"
import { ButtonData, PushButton, buttons } from "./button"
import { CustomerData, DishType, OrderFood } from "./customer";
import { ShowSpeechBubbles } from "./speechBubble";

// object to get buttonUp and buttonDown events
const input = Input.instance

// object to get user position and rotation
const camera = Camera.instance


// instance grid

// 
let shelvesHeight: number[][] = [
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
]

let gridStartingPosition = new Vector3(13.5, 0.1, 6.5)
let xMax = 6
let zMax = 9


//let shelves = instanceGrid(gridStartingPosition, xMax, zMax, shelvesHeight)

let shelves = new gridObject(gridStartingPosition, xMax, zMax, shelvesHeight)



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

// start object grabber system
let objectGrabberSystem = new ObjectGrabberSystem(objectGrabber, shelves)
engine.addSystem(objectGrabberSystem)


// System to push button up and down
engine.addSystem(new PushButton())

engine.addSystem(new OrderFood())

engine.addSystem(new ShowSpeechBubbles())

// ----------------------------
// colors for progress bars

let greenMaterial = new Material()
greenMaterial.albedoColor = Color3.Green()

let yellowMaterial = new Material()
yellowMaterial.albedoColor = Color3.Yellow()

let redMaterial = new Material()
redMaterial.albedoColor = Color3.Red()

engine.addSystem(
  new ProgressBarUpdate(redMaterial, yellowMaterial, greenMaterial)
)
// ----------------------------
let box = new Entity()
box.add(new BoxShape())
box.get(BoxShape).withCollisions = true
box.add(new GrabableObjectComponent(IngredientType.Noodles))
box.add(greenMaterial)
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
box2.add(yellowMaterial)
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



// --------------------------------


// scenery 3D model
let environment = new Entity()
environment.add(new GLTFShape("models/Environment.glb"))
environment.add(
  new Transform({
    position: new Vector3(10, 0, 10)
  })
)
engine.addEntity(environment)


// fixed pots

let potModel = new GLTFShape("models/CookingPot.glb")

let pot1 = new Entity()
pot1.add(potModel)
pot1.setParent(shelves.grid[4][7])
engine.addEntity(pot1)

let pot2 = new Entity()
pot2.add(potModel)
pot2.setParent(shelves.grid[2][7])
engine.addEntity(pot2)

createProgressBar(pot1)


const noodlesButton = new Entity()
noodlesButton.setParent(shelves.grid[5][3])
noodlesButton.add(
  new Transform({
    position: new Vector3(-0.3, -0.5, 0),
    rotation: Quaternion.Euler(90, 90, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
noodlesButton.add(new CylinderShape())
noodlesButton.set(redMaterial)
noodlesButton.add(new ButtonData(-0.3, -0.2))
let noodleExpendingComp = new IngredientExpendingMachineComponent(
  1,
  new Vector3(0, 0, 0),
  objectGrabberSystem,
  objectGrabber,
  shelves.grid[5][3]
)
noodlesButton.add(noodleExpendingComp)
noodlesButton.add(
  new OnClick(e => {
    noodleExpendingComp.createIngredient()
    noodlesButton.get(ButtonData).pressed = true
  })
)

engine.addEntity(noodlesButton)


let customer1 = new Entity()
customer1.add(new Transform({
  position: new Vector3(12.5, 1, 9.5),
  scale: new Vector3(0.5, 0.5, 0.5),
  rotation: Quaternion.Euler(0, 270, 0)
}))
customer1.add(new BoxShape)
customer1.add(greenMaterial)
customer1.add(new CustomerData(DishType.Noodles, 1))
engine.addEntity(customer1)