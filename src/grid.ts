@Component("gridPosition")
export class GridPosition {
  object: Entity = null
  //height: number = 0
}

// component group grid positions
export const gridPositions = engine.getComponentGroup(GridPosition)


// create grid
let shelves: number[][] = [
    [0, 0, 0, 0, 0, 0, 0 ,0],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ]
  let xOffset = 12.5
  let zOffset = 6.5
  let yOffset = 0.1
  
  let xMax = 7
  let zMax = 9
  let xPos = 0
  let zPos = 0
  for (let x = 0; x < xMax; x++) {
    for (let z = 0; z < zMax; z++) {
      let gridPos = new Entity()
      let y = shelves[x][z]
      gridPos.add(
        new Transform({
          position: new Vector3(x + xOffset, y + yOffset, z + zOffset)
        })
      )
      gridPos.add(new GridPosition())
      engine.addEntity(gridPos)
      let testEnt = new Entity()
      testEnt.setParent(gridPos)
      testEnt.add(new BoxShape())
      testEnt.add(
        new Transform({
          scale: new Vector3(0.1, 0.05, 0.1)
        })
      )
      engine.addEntity(testEnt)
    }
  }



  // get closest when dropping
export function getClosestPos(camera: Camera) {
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
  export function distance(pos1: Vector3, pos2: Vector3): number {
    const a = pos1.x - pos2.x
    const b = pos1.z - pos2.z
    return a * a + b * b
  }