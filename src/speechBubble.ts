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

export function createSpeechBubble(
  text: string,
  timeUp: number = 1,
  height: number = 1
) {
  let parentEntity = new Entity()
  engine.addEntity(parentEntity)

  let background = new Entity()
  background.add(new PlaneShape())
  background.setParent(parentEntity)
  background.set(
    new Transform({
      position: new Vector3(0, height, 0),
      scale: new Vector3(1.1, 0.7, 1),
      rotation: Quaternion.Euler(0, 180, 0)
    })
  )
  background.add(new Bubble(timeUp))
  engine.addEntity(background)

  let textEntity = new Entity()
  textEntity.add(new TextShape(text))
  textEntity.get(TextShape).textWrapping = true
  textEntity.setParent(background)
  textEntity.set(
    new Transform({
      position: new Vector3(0, 0, -0.05),
      scale: new Vector3(0.95, 0.95, 1)
    })
  )
  engine.addEntity(textEntity)

  return parentEntity
}
