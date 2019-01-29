import { createSpeechBubble } from './speechBubble'
import { IngredientType } from './grabableObjects'

export const customerRawNoodleMessages = [
  "Me like some noodles! Me like'em RAW!",
  'Raw noodles please, and hurry!',
  'Noodles! A nice dry brick of raw ones! '
]

export const customerRawSushiMessages = [
  'They say you got the best rolls, gimme! No slicing!',
  'One roll please. In one piece!',
  'A full sushi roll I can swallow in one gulp!'
]

export const customerCookedNoodleMessages = [
  'I want cooked noodles, NOW!',
  'I... need... my... hot... noodles...',
  'Ramen Noodles, they better be here soon.'
]

export const customerSlicedSushiMessages = [
  'sliced sushi! onegai shimaaasu!',
  'Sushi. Tic Toc.',
  'Sushi dammit! What rya waiting for?'
]

export const customerTrashMessages = [
  'Noodles! Gimme the stinky ones!',
  'Noodles, the burrrrrrrnt the better!',
  'Well-cooked noodles. Burnt, as you people say.'
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
let playerScore: number = 0

// Player score display (has to be here where the playerScore var lives...)
let scoreTextEntity = new Entity()
let textShape: TextShape = new TextShape(playerScore.toString())
textShape.textWrapping = false
textShape.color = Color3.Teal()
textShape.fontSize = 400
textShape.width = 10
scoreTextEntity.set(textShape)
scoreTextEntity.set(
  new Transform({
    position: new Vector3(13.8, 0.5, 10.5),
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
engine.addEntity(scoreTextEntity)

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
    playerScore += 50
  } else {
    log('WRONG!!!')
    playerScore -= 50
  }

  log('score: ' + playerScore)
  textShape.value = playerScore.toString()

  plate.ownerCustomer.receivedDish = true
}

const sit = new AnimationClip('Sitting', { loop: false })
sit.play()
