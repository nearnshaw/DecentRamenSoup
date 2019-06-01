import {
  ProgressBarUpdate,
  PotProgressBar,
  createPotProgressBar
} from './potProgressBar'
import {
  GridPosition,
  gridPositions,
  getClosestShelf,
  gridObject,
  tileType
} from './grid'
import { IngredientExpendingMachineComponent } from './ingredientsExpendingMachine'
import {
  GrabableObjectComponent,
  ObjectGrabberComponent,
  ObjectGrabberSystem,
  IngredientType,
  DropObjects
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
import { ClickBoard, CuttingBoard, cutRoll, CutSystem } from './cuttingBoard'
import { SmokeVelocity, SmokeSystem, smokeSpawner } from './smoke'
import { ThrowSmoke, SmokeHole } from './smokeHole'
import { CustProgressBarUpdate } from './customerProgressBar'
import { finishGame } from './finishedGameUI'
import { Trash } from './trashCan'
import { goodBubbleMaterial } from './speechBubble'

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
objectGrabber.addComponent(
  new Transform({
    position: camera.position,
    rotation: camera.rotation
  })
)
objectGrabber.addComponent(new ObjectGrabberComponent())
engine.addEntity(objectGrabber)

// start object grabber system
let objectGrabberSystem = new ObjectGrabberSystem(objectGrabber, shelves)
engine.addSystem(objectGrabberSystem)

// System to push button up and down
engine.addSystem(new PushButton())

engine.addSystem(new Walk())

engine.addSystem(new SmokeSystem())

engine.addSystem(new ThrowSmoke())

engine.addSystem(new DropObjects())

engine.addSystem(new CutSystem())

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
environment.addComponent(new GLTFShape('models/Environment.glb'))
environment.addComponent(
  new Transform({
    position: new Vector3(10, 0, 10)
    ,rotation: Quaternion.Euler(0,180,0)
  })
)
engine.addEntity(environment)

// smoke holes

// let smokeHole1 = new Entity()
// smokeHole1.addComponent(
//   new Transform({
//     position: new Vector3(11, -1, 12)
//   })
// )
// smokeHole1.addComponent(new SmokeHole())
// engine.addEntity(smokeHole1)

let easterEgg = new Entity()
easterEgg.addComponent(new TextShape("You don't want to know what's behind the kitchen"))
easterEgg.getComponent(TextShape).textWrapping = true
easterEgg.getComponent(TextShape).width = 35
easterEgg.getComponent(TextShape).height = 5
easterEgg.getComponent(TextShape).fontSize = 1.5
easterEgg.getComponent(TextShape).lineCount = 3
//easterEgg.getComponent(TextShape). = true
easterEgg.addComponent(
  new Transform({
    position: new Vector3(19, 2, 4),
    rotation: Quaternion.Euler(0, 90, 0)
  })
)
engine.addEntity(easterEgg)

// pots
let pot1 = shelves.grid[4][7]
pot1.addComponent(new Pot(pot1))
pot1.getComponent(Transform).rotation.setEuler(0, 90, 0)
pot1.addComponent(
  new OnClick(e => {
    ClickPot(objectGrabber, pot1.getComponent(Pot), objectGrabberSystem)
  })
)
pot1.getComponent(GridPosition).type = tileType.Pot

const buttonShape = new GLTFShape('models/Button.glb')
const potButton1 = new Entity()
potButton1.setParent(pot1)
potButton1.addComponent(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 0, 270),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
potButton1.addComponent(buttonShape)
potButton1.addComponent(new ButtonData(0.3, 0.2))
potButton1.addComponent(
  new OnClick(e => {
    potButton1.getComponent(ButtonData).pressed = true
    let potComponent = pot1.getComponent(Pot)

    if (!potComponent.hasIngredient || potComponent.state == SoupState.Burned) {
      log("can't turn on pot")
      return
    }

    potComponent.progressBar = createPotProgressBar(pot1, 270, 0.3, 1)
  })
)
engine.addEntity(potButton1)

let pot2 = shelves.grid[2][7]
pot2.addComponent(new Pot(pot2))
pot2.getComponent(Transform).rotation.setEuler(0, 90, 0)
pot2.addComponent(
  new OnClick(e => {
    ClickPot(objectGrabber, pot2.getComponent(Pot), objectGrabberSystem)
  })
)
pot2.getComponent(GridPosition).type = tileType.Pot

const potButton2 = new Entity()
potButton2.setParent(pot2)
potButton2.addComponent(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 0, 270),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
potButton2.addComponent(buttonShape)
potButton2.addComponent(new ButtonData(0.3, 0.2))
potButton2.addComponent(
  new OnClick(e => {
    potButton2.getComponent(ButtonData).pressed = true
    if (!pot2.getComponent(Pot).hasIngredient) {
      log('empty pot')
      return
    }

    pot2.getComponent(Pot).progressBar = createPotProgressBar(pot2, 270, 0.3, 1)
  })
)
engine.addEntity(potButton2)

// trash can

let trash = shelves.grid[5][0]
trash.getComponent(GridPosition).type = tileType.Trash
trash.addComponent(new Trash())
// trash.addComponent(
//   new OnClick(e => {

//   })
// )

// cutter machines
//let cutterModel = new GLTFShape('models/placeholders/LeverRed.gltf')

let cutter1 = new Entity()

shelves.grid[3][7].getComponent(Transform).rotation.setEuler(0, 90, 0)
shelves.grid[3][7].getComponent(GridPosition).type = tileType.Cutter

cutter1.setParent(shelves.grid[3][7])
cutter1.addComponent(new GLTFShape('models/Cutter.gltf'))
cutter1.addComponent(new CuttingBoard())
cutter1.addComponent(
  new Transform({
    scale: new Vector3(0.01, 0.01, 0.01),
    rotation: Quaternion.Euler(0, 90, 0),
    position: new Vector3(0, -0.1, 0)
  })
)

cutter1.addComponent(
  new OnClick(e => {
    ClickBoard(objectGrabber, cutter1, objectGrabberSystem)
  })
)
engine.addEntity(cutter1)

const cutterButton1 = new Entity()
cutterButton1.setParent(shelves.grid[3][7])
cutterButton1.addComponent(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 0, 270),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
cutterButton1.addComponent(buttonShape)
cutterButton1.addComponent(new ButtonData(0.3, 0.25, 0.3))
cutterButton1.addComponent(
  new OnClick(e => {
    cutterButton1.getComponent(ButtonData).pressed = true
    if (!cutter1.getComponent(CuttingBoard).hasRoll) {
      log('no roll to cut')
      return
    }
    cutRoll(cutter1)
  })
)
engine.addEntity(cutterButton1)

let cut1 = new AnimationState('State1')
let cut2 = new AnimationState('State2')
let cut3 = new AnimationState('State3')
let cut4 = new AnimationState('State4')
let cut5 = new AnimationState('State5')

let cutter1Anim = new Animator()

cutter1Anim.addClip(cut1)
cutter1Anim.addClip(cut2)
cutter1Anim.addClip(cut3)
cutter1Anim.addClip(cut4)
cutter1Anim.addClip(cut5)

cutter1.addComponent(cutter1Anim)

// cutter1
//   .getComponent(GLTFShape)
//   .getClip('State1')
//   .play()

//   cutter1
//   .getComponent(GLTFShape)
//   .getClip('State2')
//   .play()

let cutter2 = new Entity()

shelves.grid[1][7].getComponent(Transform).rotation.setEuler(0, 90, 0)
shelves.grid[1][7].getComponent(GridPosition).type = tileType.Cutter

cutter2.setParent(shelves.grid[1][7])
//cutter2.addComponent(new GLTFShape('models/Cutter3.glb'))
cutter2.addComponent(new GLTFShape('models/Cutter.gltf'))
cutter2.addComponent(new CuttingBoard())
cutter2.addComponent(
  new Transform({
    scale: new Vector3(0.01, 0.01, 0.01),
    rotation: Quaternion.Euler(0, 90, 0),
    position: new Vector3(0, -0.1, 0)
  })
)

//cutter2.getComponent(Transform).scale.setAll(0.01)
cutter2.addComponent(
  new OnClick(e => {
    ClickBoard(objectGrabber, cutter2, objectGrabberSystem)
  })
)
engine.addEntity(cutter2)

const cutterButton2 = new Entity()
cutterButton2.setParent(shelves.grid[1][7])
cutterButton2.addComponent(
  new Transform({
    position: new Vector3(0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 0, 270),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
cutterButton2.addComponent(buttonShape)
cutterButton2.addComponent(new ButtonData(0.3, 0.25, 0.3))
cutterButton2.addComponent(
  new OnClick(e => {
    cutterButton2.getComponent(ButtonData).pressed = true
    if (!cutter2.getComponent(CuttingBoard).hasRoll) {
      log('no roll to cut')
      return
    }
    cutRoll(cutter2)
  })
)
engine.addEntity(cutterButton2)

let cut1b = new AnimationState('State1')
let cut2b = new AnimationState('State2')
let cut3b = new AnimationState('State3')
let cut4b = new AnimationState('State4')
let cut5b = new AnimationState('State5')

let cutter2Anim = new Animator()

cutter2Anim.addClip(cut1)
cutter2Anim.addClip(cut2)
cutter2Anim.addClip(cut3)
cutter2Anim.addClip(cut4)
cutter2Anim.addClip(cut5)

cutter2.addComponent(cutter2Anim)

// expending machines
let nooldlesExpendingMachineModel = new GLTFShape('models/ExpenderNoodles.glb')
let noodlesExpendingMachine = new Entity()
noodlesExpendingMachine.addComponent(nooldlesExpendingMachineModel)
noodlesExpendingMachine.addComponent(
  new Transform({
    position: shelves.grid[5][3].getComponent(Transform).position,
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
shelves.grid[5][3].getComponent(GridPosition).type = tileType.Expender
engine.addEntity(noodlesExpendingMachine)
const noodlesButton = new Entity()
noodlesButton.setParent(shelves.grid[5][3])
noodlesButton.addComponent(
  new Transform({
    position: new Vector3(-0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 0, 90),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
noodlesButton.addComponent(buttonShape)
noodlesButton.addComponent(new ButtonData(-0.3, -0.2))
let noodleExpendingComp = new IngredientExpendingMachineComponent(
  IngredientType.Noodles,
  new Vector3(0, 0, 0),
  objectGrabberSystem,
  objectGrabber,
  shelves.grid[5][3]
)
noodlesButton.addComponent(noodleExpendingComp)
noodlesButton.addComponent(
  new OnClick(e => {
    noodlesButton.getComponent(ButtonData).pressed = true
    noodleExpendingComp.createIngredient()
  })
)
engine.addEntity(noodlesButton)

let sushiExpendingMachineModel = new GLTFShape('models/ExpenderRolls.glb')
let sushiExpendingMachine = new Entity()
sushiExpendingMachine.addComponent(sushiExpendingMachineModel)
sushiExpendingMachine.addComponent(
  new Transform({
    position: shelves.grid[5][1].getComponent(Transform).position,
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
shelves.grid[5][1].getComponent(GridPosition).type = tileType.Expender
engine.addEntity(sushiExpendingMachine)
const sushiButton = new Entity()
sushiButton.setParent(shelves.grid[5][1])
sushiButton.addComponent(
  new Transform({
    position: new Vector3(-0.3, -0.3, 0),
    rotation: Quaternion.Euler(90, 0, 90),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
)
sushiButton.addComponent(buttonShape)
sushiButton.addComponent(new ButtonData(-0.3, -0.2))
let sushiExpendingComp = new IngredientExpendingMachineComponent(
  IngredientType.SushiRoll,
  new Vector3(0, 0, 0),
  objectGrabberSystem,
  objectGrabber,
  shelves.grid[5][1]
)
sushiButton.addComponent(sushiExpendingComp)
sushiButton.addComponent(
  new OnClick(e => {
    sushiButton.getComponent(ButtonData).pressed = true
    sushiExpendingComp.createIngredient()
  })
)

engine.addEntity(sushiButton)

// customer plates

let plate1 = shelves.grid[0][3]
plate1.addComponent(new CustomerPlate())
plate1.getComponent(GridPosition).type = tileType.Plate

let plate2 = shelves.grid[0][4]
plate2.addComponent(new CustomerPlate())
plate2.getComponent(GridPosition).type = tileType.Plate

let plate3 = shelves.grid[0][5]
plate3.addComponent(new CustomerPlate())
plate3.getComponent(GridPosition).type = tileType.Plate

let plate4 = shelves.grid[0][6]
plate4.addComponent(new CustomerPlate())
plate4.getComponent(GridPosition).type = tileType.Plate

// customers
export let customersSystem: CustomersSystem = new CustomersSystem()
engine.addSystem(customersSystem)

// createCustomer(new Vector3(12.5, 0.75, 9.5), plate1)
export class GameStartSystem implements ISystem {
  startedGame: boolean = false

  update() {
    if (this.startedGame) return

    if (camera.position.x > 12.5) {
      this.startedGame = true

      createCustomer(new Vector3(12.5, 0.75, 9.5), plate1.getComponent(CustomerPlate))
    }
  }
}
engine.addSystem(new GameStartSystem())

// passers by
//createWalker('models/walkers/Creep.gltf', 'Armature_Walking', true, 0.25)

//createWalker('models/walkers/BlockDog.gltf', 'Walking', false, 0.25)

// Dishes instructions
// Noodles
let noodlesIndicationsEntity = new Entity()
let noodlesIndicationsText: TextShape = new TextShape(
  'Noodles Ramen: NOODLES -> COOKING POT -> TIME'
)
noodlesIndicationsText.textWrapping = false
noodlesIndicationsText.color = Color3.Black()
noodlesIndicationsText.fontSize = 1.5
noodlesIndicationsText.width = 12
noodlesIndicationsEntity.addComponent(noodlesIndicationsText)
noodlesIndicationsEntity.addComponent(
  new Transform({
    position: new Vector3(13.9, 3.2, 10.5),
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
engine.addEntity(noodlesIndicationsEntity)
let noodlesIndicationsBackground = new Entity()
engine.addEntity(noodlesIndicationsBackground)
noodlesIndicationsBackground.setParent(noodlesIndicationsEntity)
let backgroundPlaneShape = new PlaneShape()
noodlesIndicationsBackground.addComponent(backgroundPlaneShape)
noodlesIndicationsBackground.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0.02),
    scale: new Vector3(3, 0.3, 0.1)
  })
)

// sushi
let sushiIndicationsEntity = new Entity()
let sushiIndicationsText: TextShape = new TextShape(
  'Sliced Sushi: SUSHI -> CUTTING TABLE -> 5 CUTS'
)
sushiIndicationsText.textWrapping = false
sushiIndicationsText.color = Color3.Black()
sushiIndicationsText.fontSize = 1.5
sushiIndicationsText.width = 12
sushiIndicationsEntity.addComponent(sushiIndicationsText)
sushiIndicationsEntity.addComponent(
  new Transform({
    position: new Vector3(13.9, 2.8, 10.5),
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
engine.addEntity(sushiIndicationsEntity)
let sushiIndicationsBackground = new Entity()
engine.addEntity(sushiIndicationsBackground)
sushiIndicationsBackground.setParent(sushiIndicationsEntity)
sushiIndicationsBackground.addComponent(backgroundPlaneShape)
sushiIndicationsBackground.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0.02),
    scale: new Vector3(3, 0.3, 0.1)
  })
)


shelves.grid[0][2].getComponent(GridPosition).type = tileType.Shelf
shelves.grid[0][7].getComponent(GridPosition).type = tileType.Shelf
shelves.grid[5][7].getComponent(GridPosition).type = tileType.Shelf
shelves.grid[5][6].getComponent(GridPosition).type = tileType.Shelf
shelves.grid[5][5].getComponent(GridPosition).type = tileType.Shelf
shelves.grid[5][4].getComponent(GridPosition).type = tileType.Shelf
shelves.grid[5][2].getComponent(GridPosition).type = tileType.Shelf
