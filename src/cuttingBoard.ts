import {
  GrabableObjectComponent,
  IngredientType,
  ObjectGrabberComponent,
  ObjectGrabberSystem
} from './grabableObjects'

// export const enum RollState {
//     full,
//     sliced
//   }

export const cutsNeeded: number = 5

@Component('cutter')
export class CuttingBoard {
  hasRoll: boolean = false
  cuts: number = 0
  //state: RollState = RollState.full

  reset() {
    //this.state = RollState.full
    this.hasRoll = false
    this.cuts = 0
  }
}

export function AddSushi(DroppedObject: Entity, cuttingBoadrd: CuttingBoard) {
  let grabbableObject = DroppedObject.get(GrabableObjectComponent)
  if (grabbableObject.type == IngredientType.SushiRoll) {
    cuttingBoadrd.hasRoll = true
    cuttingBoadrd.cuts = 0
    log('added roll')
  } else if (grabbableObject.type == IngredientType.SlicedSushi) {
    cuttingBoadrd.hasRoll = true
    cuttingBoadrd.cuts = cutsNeeded
    log('roll is already cut')
  }
  engine.removeEntity(DroppedObject)
}

export function ClickBoard(
  GrabberEntity: Entity,
  cuttingBoadrd: CuttingBoard,
  objectGrabberSystem: ObjectGrabberSystem
) {
  let grabberComponent = GrabberEntity.get(ObjectGrabberComponent)
  if (grabberComponent.grabbedObject) {
    log('already holding something')
    return
  }
  if (!cuttingBoadrd.hasRoll) {
    log('board is empty')
    return
  }

  if (cuttingBoadrd.cuts > cutsNeeded) {
    let trash = new Entity()
    trash.add(new BoxShape())
    trash.setParent(GrabberEntity)
    trash.add(
      new Transform({
        position: new Vector3(0, 1, 1)
      })
    )
    trash.add(new GrabableObjectComponent(IngredientType.Trash, true))
    trash.add(
      new OnClick(e => {
        objectGrabberSystem.grabObject(trash)
      })
    )
    engine.addEntity(trash)
    grabberComponent.grabbedObject = trash
    cuttingBoadrd.reset()
    return
  } else if (cuttingBoadrd.cuts < cutsNeeded) {
    log('still need to cut the roll')
    return
  } else if (cuttingBoadrd.cuts == cutsNeeded) {
    let sushiPlate = new Entity()
    sushiPlate.add(new ConeShape())
    sushiPlate.setParent(GrabberEntity)
    sushiPlate.add(
      new Transform({
        position: new Vector3(0, 1, 1)
      })
    )
    sushiPlate.add(
      new GrabableObjectComponent(IngredientType.SlicedSushi, true)
    )
    sushiPlate.add(
      new OnClick(e => {
        objectGrabberSystem.grabObject(sushiPlate)
      })
    )
    engine.addEntity(sushiPlate)
    grabberComponent.grabbedObject = sushiPlate
    cuttingBoadrd.reset()
  }
}

export function cutRoll(cuttingBoard: CuttingBoard) {
  cuttingBoard.cuts += 1
  log('roll has ', cuttingBoard.cuts, ' cuts')
}
