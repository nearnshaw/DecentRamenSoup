import {
  ProgressBarUpdate,
  ProgressBar,
  createProgressBar
} from './progressBar'
import {
  GridPosition,
  gridPositions,
  getClosestShelf,
  gridObject
} from './grid'
import { IngredientExpendingMachineComponent } from './ingredientsExpendingMachine'
import {
  GrabableObjectComponent,
  ObjectGrabberComponent,
  ObjectGrabberSystem,
  IngredientType
} from './grabableObjects'
import { ButtonData, PushButton, buttons } from './button'
import {
  CustomerData,
  DishType,
  CustomersSystem,
  createCustomer
} from './customer'
import { ShowSpeechBubbles } from './speechBubble'
import { LerpData, createWalker, Walk } from './walkers'
import { Pot, ClickPot, SoupState } from './pot'

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

engine.addSystem(new CustomersSystem())

engine.addSystem(new ShowSpeechBubbles())

engine.addSystem(new Walk())
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
    objectGrabberSystem.grabObject(box)
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
    objectGrabberSystem.grabObject(box2)
  })
)
engine.addEntity(box2)

// --------------------------------

// scenery 3D model
let environment = new Entity()
environment.add(new GLTFShape('models/Environment.glb'))
environment.add(
  new Transform({
    position: new Vector3(10, 0, 10)
  })
)
engine.addEntity(environment)

// fixed pots

let potModel = new GLTFShape('models/CookingPot.glb')

let pot1 = shelves.grid[4][7]
pot1.add(potModel)
pot1.add(new Pot())
pot1.get(Transform).rotation.setEuler(0, 90, 0)
pot1.add(
  new OnClick(e => {
    ClickPot(objectGrabber, pot1.get(Pot))
  })
)

// pot1.get(Pot).hasNoodles = true
// pot1.get(Pot).state = SoupState.Burned

let pot2 = shelves.grid[2][7]
pot2.add(potModel)
pot2.add(new Pot())
pot2.add(
  new OnClick(e => {
    ClickPot(objectGrabber, pot2.get(Pot))
  })
)

createProgressBar(pot1)

// buttons

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
  IngredientType.Noodles,
  new Vector3(0, 0, 0),
  objectGrabberSystem,
  objectGrabber,
  shelves.grid[5][3]
)
noodlesButton.add(noodleExpendingComp)
noodlesButton.add(
  new OnClick(e => {
    noodlesButton.get(ButtonData).pressed = true
    noodleExpendingComp.createIngredient()
  })
)

engine.addEntity(noodlesButton)

const potButton1 = new Entity()
potButton1.setParent(pot1)
potButton1.add(
  new Transform({
    position: new Vector3(0.3, -0.5, 0),
    rotation: Quaternion.Euler(90, 270, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
potButton1.add(new CylinderShape())
potButton1.set(redMaterial)
potButton1.add(new ButtonData(-0.3, -0.2))
potButton1.add(
  new OnClick(e => {
    potButton1.get(ButtonData).pressed = true
    createProgressBar(pot1, false, 0.3, 0.2)
  })
)

engine.addEntity(potButton1)

// customers
let customer1 = createCustomer(new Vector3(12.5, 0.75, 9.5))
let customer2 = createCustomer(new Vector3(12.5, 0.75, 10.5))
let customer3 = createCustomer(new Vector3(12.5, 0.75, 11.5))
let customer4 = createCustomer(new Vector3(12.5, 0.75, 12.5))

// passers by

//createWalker('models/walkers/gnark.gltf', "walk", true, 0.5)

createWalker('models/walkers/Creep.gltf', 'Armature_Walking', true, 0.25)

createWalker('models/walkers/BlockDog.gltf', 'Walking', false, 0.25)
