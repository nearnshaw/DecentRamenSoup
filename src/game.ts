import {
  ProgressBarUpdate,
  PotProgressBar,
  createPotProgressBar
} from './potProgressBar'
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
  CustomersSystem,
  createCustomer,
  CustomerPlate
} from './customer'
import { LerpData, createWalker, Walk } from './walkers'
import { Pot, ClickPot, SoupState } from './pot'
import { ClickBoard, CuttingBoard, cutRoll } from './cuttingBoard'
import { SmokeVelocity, SmokeSystem, smokeSpawner } from './smoke'
import { ThrowSmoke, SmokeHole } from './smokeHole'
import { CustProgressBarUpdate } from './customerProgressBar'
import { finishGame } from './finishedGameUI'

// object to get buttonUp and buttonDown events
const input = Input.instance

// object to get user position and rotation
const camera = Camera.instance

// instance grid
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

engine.addSystem(new Walk())

engine.addSystem(new SmokeSystem())

engine.addSystem(new ThrowSmoke())

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

engine.addSystem(
  new CustProgressBarUpdate(redMaterial, yellowMaterial, greenMaterial)
)

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

// smoke holes

let smokeHole1 = new Entity()
smokeHole1.add(
  new Transform({
    position: new Vector3(11, -1, 12)
  })
)
smokeHole1.add(new SmokeHole())
engine.addEntity(smokeHole1)

let easterEgg = new Entity()
easterEgg.add(new TextShape("You don't want to know what's behind the kitchen"))
easterEgg.get(TextShape).textWrapping = true
easterEgg.get(TextShape).height = 2
easterEgg.add(
  new Transform({
    position: new Vector3(19, 2, 4),
    rotation: Quaternion.Euler(0, 90, 0)
  })
)
engine.addEntity(easterEgg)

// fixed pots
let pot1 = shelves.grid[4][7]
pot1.add(new Pot(pot1))
pot1.get(Transform).rotation.setEuler(0, 90, 0)
pot1.add(
  new OnClick(e => {
    ClickPot(objectGrabber, pot1.get(Pot), objectGrabberSystem)
  })
)
const potButton1 = new Entity()
potButton1.setParent(pot1)
potButton1.add(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 270, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
potButton1.add(new CylinderShape())
potButton1.set(redMaterial)
potButton1.add(new ButtonData(0.3, 0.2))
potButton1.add(
  new OnClick(e => {
    potButton1.get(ButtonData).pressed = true
    if (!pot1.get(Pot).hasNoodles) {
      log('empty pot')
      return
    }

    pot1.get(Pot).progressBar = createPotProgressBar(pot1, 270, 0.3, 1)
  })
)
engine.addEntity(potButton1)

let pot2 = shelves.grid[2][7]
pot2.add(new Pot(pot2))
pot2.get(Transform).rotation.setEuler(0, 90, 0)
pot2.add(
  new OnClick(e => {
    ClickPot(objectGrabber, pot2.get(Pot), objectGrabberSystem)
  })
)
const potButton2 = new Entity()
potButton2.setParent(pot2)
potButton2.add(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 270, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
potButton2.add(new CylinderShape())
potButton2.set(redMaterial)
potButton2.add(new ButtonData(0.3, 0.2))
potButton2.add(
  new OnClick(e => {
    potButton2.get(ButtonData).pressed = true
    if (!pot2.get(Pot).hasNoodles) {
      log('empty pot')
      return
    }

    pot2.get(Pot).progressBar = createPotProgressBar(pot2, 270, 0.3, 1)
  })
)
engine.addEntity(potButton2)

// cutter machines
let cutterModel = new GLTFShape('models/placeholders/LeverRed.gltf')

let cutter1 = shelves.grid[3][7]
cutter1.add(cutterModel)
cutter1.add(new CuttingBoard())
cutter1.get(Transform).rotation.setEuler(0, 90, 0)
cutter1.add(
  new OnClick(e => {
    ClickBoard(objectGrabber, cutter1.get(CuttingBoard), objectGrabberSystem)
  })
)
const cutterButton1 = new Entity()
cutterButton1.setParent(cutter1)
cutterButton1.add(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 270, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
cutterButton1.add(new CylinderShape())
cutterButton1.set(redMaterial)
cutterButton1.add(new ButtonData(0.3, 0.25, 0.3))
cutterButton1.add(
  new OnClick(e => {
    cutterButton1.get(ButtonData).pressed = true
    if (!cutter1.get(CuttingBoard).hasRoll) {
      log('no roll to cut')
      return
    }
    cutRoll(cutter1.get(CuttingBoard))
  })
)
engine.addEntity(cutterButton1)

let cutter2 = shelves.grid[1][7]
cutter2.add(cutterModel)
cutter2.add(new CuttingBoard())
cutter2.get(Transform).rotation.setEuler(0, 90, 0)
cutter2.add(
  new OnClick(e => {
    ClickBoard(objectGrabber, cutter2.get(CuttingBoard), objectGrabberSystem)
  })
)
const cutterButton2 = new Entity()
cutterButton2.setParent(cutter2)
cutterButton2.add(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 270, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
cutterButton2.add(new CylinderShape())
cutterButton2.set(redMaterial)
cutterButton2.add(new ButtonData(0.3, 0.25, 0.3))
cutterButton2.add(
  new OnClick(e => {
    cutterButton2.get(ButtonData).pressed = true
    if (!cutter2.get(CuttingBoard).hasRoll) {
      log('no roll to cut')
      return
    }
    cutRoll(cutter2.get(CuttingBoard))
  })
)
engine.addEntity(cutterButton2)

// expending machines
let nooldlesExpendingMachineModel = new GLTFShape('models/ExpenderNoodles.glb')
let noodlesExpendingMachine = new Entity()
noodlesExpendingMachine.add(nooldlesExpendingMachineModel)
noodlesExpendingMachine.add(
  new Transform({
    position: shelves.grid[5][3].get(Transform).position,
    rotation: Quaternion.Euler(0, 90, 0)
  })
)
engine.addEntity(noodlesExpendingMachine)
const noodlesButton = new Entity()
noodlesButton.setParent(shelves.grid[5][3])
noodlesButton.add(
  new Transform({
    position: new Vector3(-0.3, -0.3, 0),
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

let sushiExpendingMachineModel = new GLTFShape('models/ExpenderRolls.glb')
let sushiExpendingMachine = new Entity()
sushiExpendingMachine.add(sushiExpendingMachineModel)
sushiExpendingMachine.add(
  new Transform({
    position: shelves.grid[5][1].get(Transform).position,
    rotation: Quaternion.Euler(0, 90, 0)
  })
)
engine.addEntity(sushiExpendingMachine)
const sushiButton = new Entity()
sushiButton.setParent(shelves.grid[5][1])
sushiButton.add(
  new Transform({
    position: new Vector3(-0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 90, 0),
    scale: new Vector3(0.05, 0.2, 0.05)
  })
)
sushiButton.add(new CylinderShape())
sushiButton.set(redMaterial)
sushiButton.add(new ButtonData(-0.3, -0.2))
let sushiExpendingComp = new IngredientExpendingMachineComponent(
  IngredientType.SushiRoll,
  new Vector3(0, 0, 0),
  objectGrabberSystem,
  objectGrabber,
  shelves.grid[5][1]
)
sushiButton.add(sushiExpendingComp)
sushiButton.add(
  new OnClick(e => {
    sushiButton.get(ButtonData).pressed = true
    sushiExpendingComp.createIngredient()
  })
)

engine.addEntity(sushiButton)

// customer plates

let plate1 = new CustomerPlate()
shelves.grid[0][3].add(plate1)

let plate2 = new CustomerPlate()
shelves.grid[0][4].add(plate2)

let plate3 = new CustomerPlate()
shelves.grid[0][5].add(plate3)

let plate4 = new CustomerPlate()
shelves.grid[0][6].add(plate4)

// customers
export let customersSystem: CustomersSystem = new CustomersSystem()
engine.addSystem(customersSystem)

createCustomer(new Vector3(12.5, 0.75, 9.5), plate1)

// passers by

//createWalker('models/walkers/gnark.gltf', "walk", true, 0.5)

createWalker('models/walkers/Creep.gltf', 'Armature_Walking', true, 0.25)

createWalker('models/walkers/BlockDog.gltf', 'Walking', false, 0.25)
