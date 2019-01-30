import { smokeSpawner } from './smoke'

@Component('smokeHole')
export class SmokeHole {
  smokeInterval: number = 3
  nextSmoke: number = this.smokeInterval
  constructor( interval: number = 3) {

    this.smokeInterval = interval
  }
}

// component group grid positions
const smokeHoles = engine.getComponentGroup(SmokeHole)

export class ThrowSmoke implements ISystem {
  update(dt: number) {
    for (let hole of smokeHoles.entities) {
      let data = hole.get(SmokeHole)
      data.nextSmoke -= dt
      if (data.nextSmoke < 0) {
        data.nextSmoke = data.smokeInterval
        smokeSpawner.SpawnSmokePuff(hole)
      }
    }
  }
}