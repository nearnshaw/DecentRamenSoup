import { createProgressBar } from './progressBar'
import { createSpeechBubble } from './speechBubble'

export const enum DishType {
  Noodles,
  Sushi
}

export const customerNoodleMessages = [
  'I want noodles, NOW!',
  "Excuse me kind sir, if I could interrupt what you're doing for just one moment... I'd very much appreciate if you could please serve me one of those plates of noodles that your fine establishment is so famous for, if it isn't much trouble. FAST!"
]

export const customerSushiMessages = ['I want noodles, NOW!', 'Sushi. Tic Toc.']

@Component('customerData')
export class CustomerData {
  dish: DishType
  message: string
  speechBubble: Entity
  receivedDish: boolean = true // to force the 1st spawning
}

export const customers = engine.getComponentGroup(CustomerData)

export class CustomersSystem implements ISystem {
  update(dt: number) {
    for (let customer of customers.entities) {
      let customerData = customer.get(CustomerData)

      if (customerData.receivedDish) {
        this.initializeCustomer(customer, customerData)
      }
    }
  }

  initializeCustomer(customer: Entity, customerData: CustomerData) {
    customerData.receivedDish = false

    // TODO: Add shape randomization

    customerData.dish = Scalar.RandomRange(0, 1)

    let messages: string[] =
      customerData.dish == 0 ? customerNoodleMessages : customerSushiMessages

    let randomIndex = Math.floor(Scalar.RandomRange(0, messages.length))
    customerData.message = messages[randomIndex]
    if (customerData.speechBubble) {
      engine.removeEntity(customerData.speechBubble)
    }

    customerData.speechBubble = createSpeechBubble(customerData.message, -1, 2)
    customerData.speechBubble.setParent(customer)
  }
}

export function createCustomer(position: Vector3) {
  let customer = new Entity()
  customer.add(new CustomerData())
  customer.add(
    new Transform({
      position: position,
      scale: new Vector3(0.75, 0.75, 0.75),
      rotation: Quaternion.Euler(0, 90, 0)
    })
  )
  customer.add(new GLTFShape('models/walkers/BlockDog.gltf'))

  customer.get(GLTFShape).addClip(sit)

  engine.addEntity(customer)

  return customer
}

const sit = new AnimationClip('Sitting', { loop: false })
sit.play()
