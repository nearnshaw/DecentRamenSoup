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
  engine.addEntity(background)

  let textEntity = new Entity()
  textEntity.add(new TextShape(text))
  textEntity.get(TextShape).textWrapping = true
  textEntity.get(TextShape).width = 1.1
  textEntity.get(TextShape).height = 1.1
  textEntity.get(TextShape).hAlign = 'left'
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
