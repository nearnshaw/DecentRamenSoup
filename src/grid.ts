@Component("gridPosition")
export class GridPosition {
  object: Entity = null
}

// component group grid positions
export const gridPositions = engine.getComponentGroup(GridPosition)

// create grid
let shelvesHeight: number[][] = [
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
]

let shelves: Entity[][] = new Array(shelvesHeight.length)
for (let index = 0; index < shelvesHeight.length; index++) {
  shelves[index] = new Array(shelvesHeight[index].length)
}

let gridStartingPosition = new Vector3(13.5, 0.1, 6.5)
let xMax = 6
let zMax = 9
for (let x = 0; x < xMax; x++) {
  for (let z = 0; z < zMax; z++) {
    let shelf = new Entity()
    let y = shelvesHeight[x][z]
    shelf.add(
      new Transform({
        position: new Vector3(
          gridStartingPosition.x + x,
          gridStartingPosition.y + y,
          gridStartingPosition.z + z
        )
      })
    )
    shelf.add(new GridPosition())
    engine.addEntity(shelf)
    shelves[x][z] = shelf

    let testEnt = new Entity()
    testEnt.setParent(shelf)
    testEnt.add(new BoxShape())
    testEnt.add(
      new Transform({
        scale: new Vector3(0.1, 0.05, 0.1)
      })
    )
    engine.addEntity(testEnt)
  }
}

export function getClosestShelf(position: Vector3, direction: Vector3) {
  direction.y = 0

  /*log(
    "incoming position: " +
      new Vector3().copyFrom(position).subtract(gridStartingPosition)
  )
  log("incoming direction: " + direction)*/

  let finalPositionToCheck: Vector3 = new Vector3()
    .copyFrom(position)
    .scale(1.025) // to cope with the camera's offset position
    .add(direction)

  // log("final position to check: " + finalPositionToCheck)

  let gridPosition: Vector2 = GetGridPosition(finalPositionToCheck)
  // log("grid position: " + gridPosition)

  return shelves[gridPosition.x][gridPosition.y]
}

// Get distance
/* 
  Note:
  This function really returns distance squared, as it's a lot more efficient to calculate.
  The square root operation is expensive and isn't really necessary if we compare the result to squared values.
  We also use {x,z} not {x,y}. The y-coordinate is how high up it is.
  */
export function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return a * a + b * b
}

export function GetGridPosition(worldPosition: Vector3) {
  let gridPosition = new Vector2()

  worldPosition = worldPosition.subtract(gridStartingPosition)

  if (worldPosition.x < 0) {
    worldPosition.x = 0
  } else if (worldPosition.x >= shelves.length) {
    worldPosition.x = shelves.length - 1
  }

  if (worldPosition.z < 0) {
    worldPosition.z = 0
  } else if (worldPosition.z >= shelves[0].length) {
    worldPosition.z = shelves[0].length - 1
  }

  gridPosition.x = worldPosition.x
  gridPosition.y = worldPosition.z

  gridPosition.x = Math.floor(gridPosition.x)
  gridPosition.y = Math.floor(gridPosition.y)

  gridPosition.x = Math.min(gridPosition.x, shelves.length - 1)
  gridPosition.y = Math.min(gridPosition.y, shelves[gridPosition.x].length - 1)

  return gridPosition
}
