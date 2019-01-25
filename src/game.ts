import { IngredientExpendingMachineComponent } from "IngredientsExpendingMachine"
import {
  GrabableObjectComponent,
  ObjectGrabberComponent,
  ObjectGrabberSystem
} from "GrabableObjects"

@Component("gridPosition")
export class GridPosition {
  object: Entity = null
  //height: number = 0
}

// component group grid positions
const gridPositions = engine.getComponentGroup(GridPosition)

@Component("progressBar")
export class ProgressBar {
  ratio: number = 0
  fullLength: number = 0.5
  movesUp: boolean = true
  color: Material = greenMaterial
}

// component group grid positions
const progressBars = engine.getComponentGroup(ProgressBar)

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

export class ProgressBarUpdate implements ISystem {
  update(dt: number) {
    for (let bar of progressBars.entities) {
      let transform = bar.get(Transform)
      let data = bar.get(ProgressBar)
      if (data.ratio < 1) {
        data.ratio += dt / 10
      }
      log(data.ratio)
      let width = Scalar.Lerp(0, data.fullLength, data.ratio)
      transform.scale.x = width
      transform.position.x = -data.fullLength / 2 + width / 2
      if (data.ratio > 0.5) {
        bar.remove(Material)
        bar.set(greenMaterial)
      } else if (data.ratio > 0.5) {
        bar.remove(Material)
        bar.set(yellowMaterial)
      } else if (data.ratio > 0.8) {
        bar.remove(Material)
        bar.set(redMaterial)
      } else if (data.ratio > 1) {
        engine.removeEntity(bar)
      }
    }
  }
}

engine.addSystem(new ProgressBarUpdate())

// ----------------------------
// colors for progress bars

let greenMaterial = new Material()
greenMaterial.albedoColor = new Color3(0.67, 1, 0.75)

let yellowMaterial = new Material()
greenMaterial.albedoColor = new Color3(1, 1, 0.25)

let redMaterial = new Material()
greenMaterial.albedoColor = Color3.Red()

// ----------------------------
let box = new Entity()
box.add(new BoxShape())
box.get(BoxShape).withCollisions = true
box.add(new GrabableObjectComponent())
box.add(redMaterial)
box.set(
  new Transform({
    position: new Vector3(5, 0.5, 5),
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
box2.add(new GrabableObjectComponent())
box2.add(greenMaterial)
box2.set(
  new Transform({
    position: new Vector3(3, 0.5, 5),
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
progressBar1.setParent(box)
progressBar1.set(
  new Transform({
    position: new Vector3(0, 1, 0),
    scale: new Vector3(0.8, 0.1, 1)
  })
)
progressBar1.set(greenMaterial)
progressBar1.add(new ProgressBar())
engine.addEntity(progressBar1)

// ----------------------------

// create grid
let shelves: number[][] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0]
]
let xOffset = 10
let zOffset = 5

let xMax = 7
let zMax = 7
let xPos = 0
let zPos = 0
for (let x = 0; x < xMax; x++) {
  for (let z = 0; z < zMax; z++) {
    let gridPos = new Entity()
    let y = shelves[x][z]
    gridPos.add(
      new Transform({
        position: new Vector3(x + xOffset, y, z + zOffset)
      })
    )
    gridPos.add(new GridPosition())
    engine.addEntity(gridPos)

    let testEnt = new Entity()
    testEnt.setParent(gridPos)
    testEnt.add(new BoxShape())
    testEnt.add(
      new Transform({
        scale: new Vector3(0.5, 0.1, 0.5)
      })
    )
    engine.addEntity(testEnt)
  }
}

// get closest when dropping
function getClosestPos() {
  let closestDist = 100
  let closestGridPos = null
  for (let place of gridPositions.entities) {
    let pos = place.get(Transform).position
    let d = distance(camera.position, pos)
    if (d < closestDist) {
      closestDist = d
      closestGridPos = place
    }
  }
  return closestGridPos
}

// Get distance
/* 
Note:
This function really returns distance squared, as it's a lot more efficient to calculate.
The square root operation is expensive and isn't really necessary if we compare the result to squared values.
We also use {x,z} not {x,y}. The y-coordinate is how high up it is.
*/
function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return a * a + b * b
}

// --------------------------------

let noodlesExpendingMachine = new Entity()
noodlesExpendingMachine.set(
  new Transform({
    position: new Vector3(5, 1, 5)
  })
)
noodlesExpendingMachine.set(new BoxShape())

let noodleExpendingComponent = new IngredientExpendingMachineComponent(
  1,
  new Vector3(5, 2, 5),
  objectGrabberSystem,
  objectGrabber
)
noodlesExpendingMachine.set(noodleExpendingComponent)

noodlesExpendingMachine.add(
  new OnClick(e => {
    noodleExpendingComponent.createIngredient()
  })
)

engine.addEntity(noodlesExpendingMachine)
