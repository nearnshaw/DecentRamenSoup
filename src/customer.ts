import { createSpeechBubble } from './speechBubble'
import { IngredientType } from './grabableObjects'

export const customerRawNoodleMessages = [
  "Me like some noodles! me like'em RAW!",
  'Raw noodles please, and hurry up!'
]

export const customerRawSushiMessages = [
  'They say you got the best rolls, gimme!',
  'one roll please.'
]

export const customerCookedNoodleMessages = [
  'I want cooked noodles, NOW!',
  'I... need... my... hot... noodles...'
]

export const customerSlicedSushiMessages = [
  'sliced sushi! onegai shimaaasu!',
  'Sushi. Tic Toc.'
]

export const customerTrashMessages = [
  'Gimme the stinky ones!',
  'The burrrrrrrnt the better!'
]

@Component('customerData')
export class CustomerData {
  dish: IngredientType
  message: string
  speechBubble: Entity
  receivedDish: boolean = true // to force the 1st initialization
  plate: CustomerPlate
}

@Component('customerPlate')
export class CustomerPlate {
  ownerCustomer: CustomerData
  dish: IngredientType
}

export const customers = engine.getComponentGroup(CustomerData)
export const plates = engine.getComponentGroup(CustomerPlate)

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

    customerData.dish = Math.floor(Scalar.RandomRange(0, IngredientType.COUNT))

    let messages: string[]
    switch (customerData.dish) {
      case 0:
        messages = customerRawNoodleMessages
        break
      case 1:
        messages = customerRawSushiMessages
        break
      case 2:
        messages = customerCookedNoodleMessages
        break
      case 3:
        messages = customerSlicedSushiMessages
        break
      case 4:
        messages = customerTrashMessages
        break

      default:
        messages = customerCookedNoodleMessages
        break
    }

    let randomIndex = Math.floor(Scalar.RandomRange(0, messages.length))
    customerData.message = messages[randomIndex]

    if (customerData.speechBubble) {
      engine.removeEntity(customerData.speechBubble)
    }

    customerData.speechBubble = createSpeechBubble(customerData.message, -1, 2)
    customerData.speechBubble.setParent(customer)
  }
}

export function createCustomer(position: Vector3, plate: CustomerPlate) {
  let customer = new Entity()
  let customerData = new CustomerData()

  customerData.plate = plate
  plate.ownerCustomer = customerData

  customer.add(customerData)

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

export function deliverOrder(plate: CustomerPlate) {
  if (plate.dish == plate.ownerCustomer.dish) {
    log('WELL DONE!!!')
  } else {
    log('WRONG!!!')
  }

  plate.ownerCustomer.receivedDish = true
}

const sit = new AnimationClip('Sitting', { loop: false })
sit.play()
