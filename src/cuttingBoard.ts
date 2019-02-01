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

@Component('cutterBoard')
export class CuttingBoard {
  hasRoll: boolean = false
  cuts: number = 0
  rollChild: Entity
  //state: RollState = RollState.full

  reset() {
    //this.state = RollState.full
    this.hasRoll = false
    this.cuts = 0
  }
}

// reusable shape components
const sushiPlateShape = new GLTFShape('models/PlateSushi.glb')
const trashShape = new GLTFShape('models/GarbageFood.glb')

export function AddSushi(DroppedObject: Entity, cuttingBoadrd: CuttingBoard) {
  let grabbableObject = DroppedObject.get(GrabableObjectComponent)
  if (grabbableObject.type == IngredientType.SushiRoll) {
    cuttingBoadrd.hasRoll = true
    cuttingBoadrd.cuts = 0
    cuttingBoadrd.rollChild = DroppedObject
    log('added roll')
  } else if (grabbableObject.type == IngredientType.SlicedSushi) {
    cuttingBoadrd.hasRoll = true
    cuttingBoadrd.cuts = cutsNeeded
    cuttingBoadrd.rollChild = DroppedObject
    log('roll is already cut')
  }
  //engine.removeEntity(DroppedObject)
}

export function ClickBoard(
  GrabberEntity: Entity,
  cutter: Entity,
  objectGrabberSystem: ObjectGrabberSystem
) {
  let cuttingBoadrd = cutter.get(CuttingBoard)
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
    trash.add(trashShape)
    trash.setParent(GrabberEntity)
    trash.add(
      new Transform({
        position: new Vector3(0, 1.25, 1)
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
    engine.removeEntity(cuttingBoadrd.rollChild)
    cuttingBoadrd.reset()
    return
  } else if (cuttingBoadrd.cuts < cutsNeeded) {
    log('still need to cut the roll')
    return
  } else if (cuttingBoadrd.cuts == cutsNeeded) {
    let sushiPlate = new Entity()
    sushiPlate.add(sushiPlateShape)
    sushiPlate.setParent(GrabberEntity)
    sushiPlate.add(
      new Transform({
        position: new Vector3(0, 1.25, 1)
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
    engine.removeEntity(cuttingBoadrd.rollChild)
    cuttingBoadrd.reset()
  }
}

export function cutRoll(cuttingBoard: Entity) {
    let cutter = cuttingBoard.get(CuttingBoard)
    cutter.cuts += 1
    let gltf = cuttingBoard.get(GLTFShape)
    switch (cutter.cuts) {
        case 1:
          gltf.getClip('State1').play()
          break
        case 2:
          gltf.getClip('State2').play()
          break
        case 3:
          gltf.getClip('State3').play()
          break
        case 4:
          gltf.getClip('State4').play()
          break
        case 5:
          gltf.getClip('State5').play()
          break
        case 6:
            gltf.getClip('State1').play()
            gltf.getClip('State2').play()
            gltf.getClip('State3').play()
            gltf.getClip('State4').play()
            gltf.getClip('State5').play()
            break
    }


  //cuttingBoard.rollChild
  log('roll has ', cutter.cuts, ' cuts')
}
