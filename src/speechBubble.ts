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

export let neutralBubbleMaterial = new Material()
neutralBubbleMaterial.albedoTexture = 'textures/bubble3.png'
neutralBubbleMaterial.albedoColor = Color3.Gray()
neutralBubbleMaterial.hasAlpha = true

export let goodBubbleMaterial = new Material()
goodBubbleMaterial.albedoTexture = 'textures/bubble3.png'
goodBubbleMaterial.albedoColor = Color3.Green()
goodBubbleMaterial.hasAlpha = true

export let badBubbleMaterial = new Material()
badBubbleMaterial.albedoTexture = 'textures/bubble3.png'
badBubbleMaterial.albedoColor = Color3.Red()
badBubbleMaterial.hasAlpha = true

let bubbleShape = new PlaneShape()

export function createSpeechBubble(
  text: string,
  timeUp: number = 1,
  height: number = 1,
  bubbleMaterial: Material = null
) {
  let parentEntity = new Entity()
  engine.addEntity(parentEntity)

  if (!bubbleMaterial) {
    bubbleMaterial = neutralBubbleMaterial
  }
  let background = new Entity()
  background.add(bubbleShape)
  background.add(bubbleMaterial)
  background.setParent(parentEntity)
  background.set(
    new Transform({
      position: new Vector3(-0.6, height - 0.35, 0),
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
      position: new Vector3(-0.6, height - 0.1, 0.07),
      scale: new Vector3(0.85, 0.85, 1),
      rotation: Quaternion.Euler(0, 180, 0)
    })
  )
  engine.addEntity(textEntity)

  return parentEntity
}
