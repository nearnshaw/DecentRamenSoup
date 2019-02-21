import { CuttingBoard } from "./cuttingBoard";


export const enum tileType {
  Floor,
  Shelf,
  Expender,
  Trash,
  Pot,
  Cutter,
  Plate
}

@Component("gridPosition")
export class GridPosition {
  object: Entity = null
  type: tileType = tileType.Floor
}

// component group grid positions
export const gridPositions = engine.getComponentGroup(GridPosition)



export class gridObject{
  grid: Entity[][]
  gridStartingPosition : Vector3
  xMax: number
  zMax: number
  shelvesHeight: number[][]
  constructor(gridStartingPosition: Vector3, xMax: number, zMax: number, shelvesHeight: number[][]){
    this.gridStartingPosition = gridStartingPosition,
    this.xMax = xMax,
    this.zMax = zMax
    this.shelvesHeight = shelvesHeight
    this.grid = new Array(shelvesHeight.length)
    for (let index = 0; index < this.shelvesHeight.length; index++) {
      this.grid[index] = new Array(this.shelvesHeight[index].length)
    }

    for (let x = 0; x < this.xMax; x++) {
      for (let z = 0; z < this.zMax; z++) {
        let shelf = new Entity()
        let y = this.shelvesHeight[x][z]
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
        this.grid[x][z] = shelf
    
        // let testEnt = new Entity()
        // testEnt.setParent(shelf)
        // testEnt.add(new BoxShape())
        // testEnt.add(
        //   new Transform({
        //     scale: new Vector3(0.05, 0.05, 0.05)
        //   })
        // )
        // engine.addEntity(testEnt)
      }
    }

  }
}



export function getClosestShelf(position: Vector3, direction: Vector3, gridObject: gridObject) {
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

  let gridPosition: Vector2 = GetGridPosition(finalPositionToCheck, gridObject)
  // log("grid position: " + gridPosition)

  if (gridObject.grid[gridPosition.x][gridPosition.y].get(GridPosition).object &&
  gridObject.grid[gridPosition.x][gridPosition.y].get(GridPosition).type !== tileType.Cutter){
    log("position already occupied")
    return null
  }

  return gridObject.grid[gridPosition.x][gridPosition.y]
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

export function GetGridPosition(worldPosition: Vector3, gridObject: gridObject) {
  let gridPosition = new Vector2()

  worldPosition = worldPosition.subtract(gridObject.gridStartingPosition)

  if (worldPosition.x < 0) {
    worldPosition.x = 0
  } else if (worldPosition.x >= gridObject.grid.length) {
    worldPosition.x = gridObject.grid.length - 1
  }

  if (worldPosition.z < 0) {
    worldPosition.z = 0
  } else if (worldPosition.z >= gridObject.grid[0].length) {
    worldPosition.z = gridObject.grid[0].length - 1
  }

  gridPosition.x = worldPosition.x
  gridPosition.y = worldPosition.z

  gridPosition.x = Math.floor(gridPosition.x)
  gridPosition.y = Math.floor(gridPosition.y)

  gridPosition.x = Math.min(gridPosition.x, gridObject.grid.length - 1)
  gridPosition.y = Math.min(gridPosition.y, gridObject.grid[gridPosition.x].length - 1)

  return gridPosition
}