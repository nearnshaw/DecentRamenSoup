import { goodBubbleMaterial, badBubbleMaterial } from './speechBubble'

const startedGameDate = Date.now()

export class FinishedGameUI implements ISystem {
  uiPanelTransform: Transform
  targetPosition: Vector3
  targetRotation: Quaternion

  constructor(playerScore: number) {
    let parentEntity = new Entity()
    engine.addEntity(parentEntity)
    this.uiPanelTransform = new Transform({
      position: Camera.instance.position,
      rotation: Camera.instance.rotation
    })
    parentEntity.set(this.uiPanelTransform)

    let background = new Entity()
    background.add(new PlaneShape())
    background.add(badBubbleMaterial)
    background.setParent(parentEntity)
    background.set(
      new Transform({
        position: new Vector3(0, 1.3, 0.5),
        // scale: new Vector3(0.8, 0.8, 1),
        rotation: Quaternion.Euler(0, 180, 0)
      })
    )
    engine.addEntity(background)

    let textEntity = new Entity()
    let gameTimeInMilliseconds = Date.now() - startedGameDate
    let gameTimeMinutes = gameTimeInMilliseconds / 1000 / 60
    let gameTimeSeconds = (gameTimeInMilliseconds / 1000) % 60

    textEntity.add(
      new TextShape(
        'GAME OVER!' +
          '\n You survived for ' +
          Math.floor(gameTimeMinutes) +
          ' minutes and ' +
          Math.floor(gameTimeSeconds) +
          ' seconds.' +
          '\n SCORE: ' +
          playerScore
      )
    )
    textEntity.get(TextShape).textWrapping = true
    textEntity.get(TextShape).fontSize = 60
    textEntity.get(TextShape).hAlign = 'left'
    textEntity.set(
      new Transform({
        position: new Vector3(0.03, 1.45, 0.45),
        scale: new Vector3(0.7, 0.5, 1),
        rotation: Quaternion.Euler(0, 0, 0)
      })
    )

    textEntity.setParent(parentEntity)
    engine.addEntity(textEntity)
  }

  update(deltaTime: number) {
    this.targetPosition = Camera.instance.position
    this.targetRotation = Camera.instance.rotation

    let lerpingSpeed = 15
    this.uiPanelTransform.position = Vector3.Lerp(
      this.uiPanelTransform.position,
      this.targetPosition,
      deltaTime * lerpingSpeed
    )

    this.uiPanelTransform.rotation = Quaternion.Slerp(
      this.uiPanelTransform.rotation,
      this.targetRotation,
      deltaTime * lerpingSpeed
    )
  }
}

export let finishedPlaying: boolean = false
export function finishGame(playerScore: number) {
  finishedPlaying = true

  let finishedGameUISystem = new FinishedGameUI(playerScore)
  engine.addSystem(finishedGameUISystem)
}
