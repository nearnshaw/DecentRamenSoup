export let neutralBubbleMaterial = new Material()
neutralBubbleMaterial.albedoTexture = 'textures/bubble3.png'
neutralBubbleMaterial.albedoColor = Color3.Gray()
neutralBubbleMaterial.hasAlpha = true
neutralBubbleMaterial.disableLighting = true
neutralBubbleMaterial.specularIntensity = 0
neutralBubbleMaterial.directIntensity = 0
neutralBubbleMaterial.metallic = 0
neutralBubbleMaterial.roughness = 1

export let goodBubbleMaterial = new Material()
goodBubbleMaterial.albedoTexture = 'textures/bubble3.png'
goodBubbleMaterial.albedoColor = Color3.Green()
goodBubbleMaterial.hasAlpha = true
goodBubbleMaterial.disableLighting = true
goodBubbleMaterial.specularIntensity = 0
goodBubbleMaterial.directIntensity = 0
goodBubbleMaterial.metallic = 0
goodBubbleMaterial.roughness = 1

export let badBubbleMaterial = new Material()
badBubbleMaterial.albedoTexture = 'textures/bubble3.png'
badBubbleMaterial.albedoColor = Color3.Red()
badBubbleMaterial.hasAlpha = true
badBubbleMaterial.disableLighting = true
badBubbleMaterial.specularIntensity = 0
badBubbleMaterial.directIntensity = 0
badBubbleMaterial.metallic = 0
badBubbleMaterial.roughness = 1

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
  background.addComponent(bubbleShape)
  background.addComponent(bubbleMaterial)
  background.setParent(parentEntity)
  background.addComponent(
    new Transform({
      position: new Vector3(-0.6, height - 0.35, 0),
      scale: new Vector3(1.4, 1.6, 1),
      rotation: Quaternion.Euler(0, 180, 0)
    })
  )
  engine.addEntity(background)

  let textEntity = new Entity()
  textEntity.addComponent(new TextShape(text))
  textEntity.getComponent(TextShape).textWrapping = true
  textEntity.getComponent(TextShape).width = 1.1
  textEntity.getComponent(TextShape).height = 1.1
  textEntity.getComponent(TextShape).hAlign = 'left'
  textEntity.setParent(parentEntity)
  textEntity.addComponent(
    new Transform({
      position: new Vector3(-0.6, height - 0.1, 0.07),
      scale: new Vector3(0.85, 0.85, 1),
      rotation: Quaternion.Euler(0, 180, 0)
    })
  )
  engine.addEntity(textEntity)

  return parentEntity
}
