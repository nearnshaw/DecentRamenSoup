import { finishedPlaying } from './finishedGameUI'

@Component('lerpData')
export class LerpData {
  origin: Vector3 = new Vector3(5, 0, 5)
  target: Vector3 = new Vector3(5, 0, 15)
  fraction: number = 0
  downStreet: boolean = true
  speed: number = 1
  constructor(
    origin: Vector3,
    target: Vector3,
    downStreet: boolean,
    speed: number
  ) {
    this.origin = origin
    this.target = target
    this.downStreet = downStreet
    this.speed = speed
  }
}

// component group grid positions
const passersBy = engine.getComponentGroup(LerpData)

// to rotate 180 degrees
let yAxis = new Vector3(0, 90, 0)

export class Walk {
  update(dt: number) {
    if (finishedPlaying) return

    for (let walker of passersBy.entities) {
      let transform = walker.get(Transform)
      let lerp = walker.get(LerpData)
      if (lerp.downStreet) {
        if (lerp.fraction < 1) {
          lerp.fraction += (dt / 6) * lerp.speed
        } else {
          lerp.downStreet = false
          transform.rotate(yAxis, 180)
        }
      } else {
        // !downStreet
        if (lerp.fraction > 0) {
          lerp.fraction -= (dt / 6) * lerp.speed
        } else {
          lerp.downStreet = true
          transform.rotate(yAxis, 180)
        }
      }
      transform.position = Vector3.Lerp(lerp.origin, lerp.target, lerp.fraction)
    }
  }
}

let upL = new Vector3(19, 0, 18)
let downL = new Vector3(2, 0, 18)

let upR = new Vector3(19, 0, 17)
let downR = new Vector3(2, 0, 17)

export function createWalker(
  path: string,
  clipName: string,
  up: boolean,
  speed: number
) {
  let walker = new Entity()
  walker.add(new GLTFShape(path))
  if (up) {
    walker.add(
      new Transform({
        position: upL,
        scale: new Vector3(0.75, 0.75, 0.75),
        rotation: Quaternion.Euler(0, 270, 0)
      })
    )
    walker.add(new LerpData(upL, downL, true, speed))
  } else {
    walker.add(
      new Transform({
        position: downL,
        scale: new Vector3(0.75, 0.75, 0.75),
        rotation: Quaternion.Euler(0, 90, 0)
      })
    )
    walker.add(new LerpData(downR, upR, true, speed))
  }

  engine.addEntity(walker)
  const walkClip = new AnimationClip(clipName)
  walker.get(GLTFShape).addClip(walkClip)
  walkClip.play()
}
