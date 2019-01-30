@Component('bubble')
export class Bubble {
  timeUp: number = 1
  constructor(timeUp: number = 2) {
    this.timeUp = timeUp
  }
}

// component group grid positions
const speechBubbles = engine.getComponentGroup(Bubble)

export class ShowSpeechBubbles implements ISystem {
  update(dt: number) {
    for (let bubble of speechBubbles.entities) {
      let data = bubble.get(Bubble)

      if (data.timeUp < 0) return

      data.timeUp -= dt
      if (data.timeUp < 0) {
        engine.removeEntity(bubble, true)
      }
    }
  }
}

let bubbleMaterial = new Material()
bubbleMaterial.albedoTexture = "textures/bubble3.png"
bubbleMaterial.hasAlpha = true

let bubbleShape = new PlaneShape()

export function createSpeechBubble(
  text: string,
  timeUp: number = 1,
  height: number = 1
) {
  let parentEntity = new Entity()
  engine.addEntity(parentEntity)

  let background = new Entity()
  background.add(bubbleShape)
  background.add(bubbleMaterial)
  background.setParent(parentEntity)
  background.set(
    new Transform({
      position: new Vector3(-0.6, height - 0.35, 0.5),
      scale: new Vector3(1.4, 1.6, 1),
      rotation: Quaternion.Euler(0, 180, 0)
    })
  )
  background.add(new Bubble(timeUp))
  engine.addEntity(background)


  let textEntity = new Entity()
  textEntity.add(new TextShape(text))
  textEntity.get(TextShape).textWrapping = true
  textEntity.get(TextShape).width = 1.1
  textEntity.get(TextShape).height = 1.1
  textEntity.setParent(parentEntity)
  textEntity.set(
    new Transform({
      position: new Vector3(-0.6, height - 0.1, 0.57),
      scale: new Vector3(0.85, 0.85, 1),
      rotation: Quaternion.Euler(0, 180, 0)
    })
  )
  engine.addEntity(textEntity)

  return parentEntity
}
