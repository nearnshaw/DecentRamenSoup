import { finishedPlaying } from './finishedGameUI'

@Component('smokevelocity')
export class SmokeVelocity extends Vector3 {
  constructor(x: number, y: number, z: number) {
    super(x, y, z)
  }
}

const smokeTexture = new Texture('textures/smoke-puff3.png', {hasAlpha: true})


const smokeMaterial = new Material()
smokeMaterial.albedoTexture = smokeTexture
smokeMaterial.hasAlpha = true
smokeMaterial.alpha = 1

const smokeShape = new PlaneShape()

const billboard = new Billboard(true, true, true)

export const smokeSpawner = {
  MAX_POOL_SIZE: 50,
  pool: [] as Entity[],

  getEntityFromPool(): IEntity | null {
    for (let i = 0; i < smokeSpawner.pool.length; i++) {
      if (!smokeSpawner.pool[i].alive) {
        return smokeSpawner.pool[i]
      }
    }

    if (smokeSpawner.pool.length < smokeSpawner.MAX_POOL_SIZE) {
      const instance = new Entity()
      smokeSpawner.pool.push(instance)
      return instance
    }

    return null
  },

  SpawnSmokePuff(parent: IEntity) {
    const ent = smokeSpawner.getEntityFromPool()

    if (!ent) return

    const newVel = {
      x: (Math.random() - Math.random()) / 6,
      y: Math.random() / 2 + 0.1,
      z: (Math.random() - Math.random()) / 6
    }

    const size = Math.random() / 2 + 0.2

    ent.addComponentOrReplace(smokeShape)
    ent.addComponentOrReplace(smokeMaterial)

    ent.addComponentOrReplace(billboard)
    
    ent.setParent(parent)

    if (!ent.getComponentOrNull(Transform)) {
      const t = new Transform()
      ent.addComponent(t)
      t.scale.set(size, size, size)
      t.position.set(0, 0, 0)
    } else {
      const t = ent.getComponent(Transform)
      t.position.set(0, 0, 0)
    }

    if (!ent.getComponentOrNull(SmokeVelocity)) {
      ent.addComponent(new SmokeVelocity(newVel.x, newVel.y, newVel.z))
    } else {
      const vel = ent.getComponent(SmokeVelocity)
      vel.set(newVel.x, newVel.y, newVel.z)
    }

    engine.addEntity(ent)
  }
}

// component group for all smoke
export const smokePuffs = engine.getComponentGroup(SmokeVelocity)

export class SmokeSystem implements ISystem {
  isOutOfBounds(transform: Transform) {
    if (
      transform.position.y > 2.5 ||
      transform.position.x > 1.5 ||
      transform.position.z > 1.5 ||
      transform.position.x < -1.5 ||
      transform.position.z < -1.5
    ) {
      return true
    }
    return false
  }

  update(dt: number) {
    if (finishedPlaying) return

    for (let entity of smokePuffs.entities) {
      const transform = entity.getComponent(Transform)
      const velocity = entity.getComponent(SmokeVelocity)

      transform.position.x += velocity.x * dt
      transform.position.y += velocity.y * dt
      transform.position.z += velocity.z * dt

      velocity.x *= 0.995
      velocity.z *= 0.995

      if (this.isOutOfBounds(transform)) {
        engine.removeEntity(entity)
      }
    }
  }
}
