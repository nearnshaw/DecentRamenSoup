import {
  GrabableObjectComponent,
  IngredientType,
  ObjectGrabberComponent,
  ObjectGrabberSystem
} from './grabableObjects'
import { GridPosition } from './grid';

// export const enum RollState {
//     full,
//     sliced
//   }

export const cutsNeeded: number = 5

@Component('cutterBoard')
export class CuttingBoard {
  hasRoll: boolean = false
  cuts: number = 0
  rollChild: IEntity
  cutting: boolean = false
  cutTime: number = 0.7
  totalCutTime: number = 0.7
  //state: RollState = RollState.full

  reset() {
    //this.state = RollState.full
    this.hasRoll = false
    this.cuts = 0
    this.rollChild = null
    this.cutting = false
    this.cutTime = this.totalCutTime
  }
}

// component group for all cutters
export const cutters = engine.getComponentGroup(CuttingBoard)

export class CutSystem implements ISystem {
  update(dt: number) {
    for (let cutter of cutters.entities) {
      const cuttingBoard = cutter.getComponent(CuttingBoard)
      if (cuttingBoard.cutting) {
        cuttingBoard.cutTime -= dt
        if (cuttingBoard.cutTime < 0) {
          cuttingBoard.cutTime = cuttingBoard.totalCutTime
          cuttingBoard.cutting = false
          let animator = cutter.getComponent(Animator)
          animator.getClip('State1').pause()
          animator.getClip('State2').pause()
          animator.getClip('State3').pause()
          animator.getClip('State4').pause()
          animator.getClip('State5').pause()
        }
      }
    }
  }
}

// reusable shape components
const sushiPlateShape = new GLTFShape('models/PlateSushi.glb')
const trashShape = new GLTFShape('models/GarbageFood.glb')

export function AddSushi(DroppedObject: IEntity, cuttingBoadrd: CuttingBoard) {
  let grabbableObject = DroppedObject.getComponent(GrabableObjectComponent)
  if (grabbableObject.type == IngredientType.SushiRoll) {
    cuttingBoadrd.hasRoll = true
    cuttingBoadrd.cuts = 0
    cuttingBoadrd.rollChild = DroppedObject
    cuttingBoadrd.rollChild.removeComponent(OnClick)
    log('added roll')
  } else if (grabbableObject.type == IngredientType.SlicedSushi) {
    cuttingBoadrd.hasRoll = true
    cuttingBoadrd.cuts = cutsNeeded
    cuttingBoadrd.rollChild = DroppedObject
    cuttingBoadrd.rollChild.removeComponent(OnClick)
    log('roll is already cut')
  }
  DroppedObject.getComponent(Transform).rotation.setEuler(0, 90, 0)
  //engine.removeEntity(DroppedObject)
}

export function ClickBoard(
  GrabberEntity: IEntity,
  cutter: IEntity,
  objectGrabberSystem: ObjectGrabberSystem
) {
  let cuttingBoadrd = cutter.getComponent(CuttingBoard)
  let grabberComponent = GrabberEntity.getComponent(ObjectGrabberComponent)
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
    trash.addComponent(trashShape)
    trash.setParent(GrabberEntity)
    trash.addComponent(
      new Transform({
        position: new Vector3(0, 1.25, 1)
      })
    )
    trash.addComponent(new GrabableObjectComponent(IngredientType.Trash, true))
    trash.addComponent(
      new OnClick(e => {
        objectGrabberSystem.grabObject(trash)
      })
    )
    engine.addEntity(trash)
    grabberComponent.grabbedObject = trash
    cutter.getParent().getComponent(GridPosition).object = null
    // let firstChildIndex = Object.keys(cutter.children)[0]
    // engine.removeEntity(cutter.children[firstChildIndex])
    engine.removeEntity(cuttingBoadrd.rollChild)
    cuttingBoadrd.reset()
    return
  } else if (cuttingBoadrd.cuts < cutsNeeded) {
    log('still need to cut the roll')
    return
  } else if (cuttingBoadrd.cuts == cutsNeeded) {
    let sushiPlate = new Entity()
    sushiPlate.addComponent(sushiPlateShape)
    sushiPlate.setParent(GrabberEntity)
    sushiPlate.addComponent(
      new Transform({
        position: new Vector3(0, 1.25, 1)
      })
    )
    sushiPlate.addComponent(
      new GrabableObjectComponent(IngredientType.SlicedSushi, true)
    )
    sushiPlate.addComponent(
      new OnClick(e => {
        objectGrabberSystem.grabObject(sushiPlate)
      })
    )
    engine.addEntity(sushiPlate)
    grabberComponent.grabbedObject = sushiPlate
    engine.removeEntity(cuttingBoadrd.rollChild)
    cutter.getParent().getComponent(GridPosition).object = null
    // let firstChildIndex = Object.keys(cutter.children)[0]
    // engine.removeEntity(cutter.children[firstChildIndex])
    cuttingBoadrd.reset()
  }
}

export function cutRoll(cuttingBoard: IEntity) {
  let cutter = cuttingBoard.getComponent(CuttingBoard)
  cutter.cuts += 1
  cutter.cutting = true
  let animator = cuttingBoard.getComponent(Animator)
  switch (cutter.cuts) {
    case 1:
      animator.getClip('State1').play()
      break
    case 2:
      animator.getClip('State2').play()
      break
    case 3:
      animator.getClip('State3').play()
      break
    case 4:
      animator.getClip('State4').play()
      break
    case 5:
      animator.getClip('State5').play()
      break
    case 6:
      animator.getClip('State1').play()
      animator.getClip('State2').play()
      animator.getClip('State3').play()
      animator.getClip('State4').play()
      animator.getClip('State5').play()
      break
  }

  //cuttingBoard.rollChild
  log('roll has ', cutter.cuts, ' cuts')
}
