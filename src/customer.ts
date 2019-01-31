import {
  createSpeechBubble,
  neutralBubbleMaterial,
  goodBubbleMaterial,
  badBubbleMaterial
} from './speechBubble'
import { IngredientType } from './grabableObjects'
import {
  createCustProgressBar,
  CustomerProgressBar
} from './customerProgressBar'
import { customersSystem } from './game'

const customerRawNoodleMessages = [
  "Me like some noodles! Me like'em RAW!",
  'Raw noodles please, and hurry!',
  'Noodles! A nice dry brick of raw ones! '
]

const customerRawSushiMessages = [
  'They say you got the best rolls, gimme! No slicing!',
  'One roll please. In one piece!',
  'A full sushi roll I can swallow in one gulp!'
]

const customerCookedNoodleMessages = [
  'I want cooked noodles, NOW!',
  'I... need... my... hot... noodles...',
  'Ramen Noodles, they better be here soon.'
]

const customerSlicedSushiMessages = [
  'sliced sushi! onegai shimaaasu!',
  'Sushi. Tic Toc.',
  'Sushi dammit! What rya waiting for?'
]

const customerTrashMessages = [
  'Noodles! Gimme the stinky ones!',
  'Noodles, the burrrrrrrnt the better!',
  'Well-cooked noodles. Burnt, as you people say.'
]

const customerCorrectDishMessages = [
  'Excellent!',
  'Nicely done!',
  '(　＾∇＾)',
  'It was about time...',
  'Nice job!',
  'Just what I needed!',
  'Yummy!',
  'YES!!!',
  '( ˘ ³˘)',
  "It's fine"
]

const customerWrongDishMessages = [
  'Customer service SUCKS here!',
  'Do you even understand my language?',
  'What a waste of time!',
  'NO! NO! NO!',
  "Guess who's a ramen shop critic?",
  "I'll never come back here",
  "I'll talk so bad about this place",
  'щ(ºДºщ)',
  '@#&*#$!',
  '୧༼ಠ益ಠ༽'
]

@Component('customerData')
export class CustomerData {
  dish: IngredientType
  message: string
  speechBubble: Entity
  receivedDish: boolean = true // to force the 1st initialization
  plate: CustomerPlate
  shape: GLTFShape
  timeBeforeLeaving: number
  timeBeforeEntering: number
  waitingTimer: number
  customerEntity: Entity
  progressBar: Entity
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
let scoreTextShape: TextShape = new TextShape(playerScore.toString())
scoreTextShape.textWrapping = false
scoreTextShape.color = Color3.Teal()
scoreTextShape.fontSize = 400
scoreTextShape.width = 10
scoreTextEntity.set(scoreTextShape)
scoreTextEntity.set(
  new Transform({
    position: new Vector3(13.8, 0.5, 10.5),
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
engine.addEntity(scoreTextEntity)

export class CustomersSystem implements ISystem {
  lastInitializedCustomer: number = 0

  update(dt: number) {
    for (let index = 0; index < customers.entities.length; index++) {
      let customerEntity = customers.entities[index]
      let customerData = customerEntity.get(CustomerData)

      if (customerData.progressBar) {
        let customerProgressBar = customerData.progressBar.get(
          CustomerProgressBar
        )

        if (customerProgressBar.speed > 0 && customerProgressBar.ratio <= 0) {
          // Time's up for this order so we feed a wrong dish on purpose
          let plate: CustomerPlate = plates.entities[index].get(CustomerPlate)

          let wrongDish = customerData.dish + 1
          if (wrongDish == IngredientType.COUNT) {
            wrongDish = 0
          }

          plate.dish = wrongDish

          deliverOrder(plate)

          customerProgressBar.speed = 0
          engine.removeEntity(customerData.progressBar.getParent(), true)
          customerData.progressBar = null

          continue
        }
      }

      if (customerData.waitingTimer > 0) {
        customerData.waitingTimer -= dt

        if (customerData.waitingTimer <= 0) {
          if (customerData.receivedDish) {
            if (customerData.speechBubble) {
              engine.removeEntity(customerData.speechBubble, true)
            }

            customerData.shape.visible = false
            customerData.waitingTimer = customerData.timeBeforeEntering
            customerData.receivedDish = false
          } else if (!customerData.shape.visible) {
            customerData.shape.visible = true

            this.initializeCustomer(customerEntity, customerData)
          }
        }
      }
    }
  }

  initializeCustomer(customer: Entity, customerData: CustomerData) {
    customerData.receivedDish = false
    customerData.timeBeforeEntering = Scalar.RandomRange(3, 6)
    customerData.timeBeforeLeaving = Scalar.RandomRange(3, 4)
    customerData.waitingTimer = customerData.timeBeforeEntering

    // only-cooked or every-ingredient randomization (50%)
    let randomValue = Math.floor(Scalar.RandomRange(0, 2))
    if (randomValue == 0) {
      customerData.dish = Math.floor(Scalar.RandomRange(2, 4))
    } else {
      customerData.dish = Math.floor(
        Scalar.RandomRange(0, IngredientType.COUNT)
      )
    }

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

    updateSpeechBubble(
      customerData,
      messages[randomIndex],
      neutralBubbleMaterial
    )

    customerData.progressBar = createCustProgressBar(
      customer,
      Scalar.RandomRange(1, 1.25)
    )
  }
}

function updateSpeechBubble(
  customerData: CustomerData,
  newMessage: string,
  bubbleMaterial: Material
) {
  customerData.message = newMessage

  if (customerData.speechBubble) {
    engine.removeEntity(customerData.speechBubble, true)
  }

  customerData.speechBubble = createSpeechBubble(
    customerData.message,
    2,
    bubbleMaterial
  )
  customerData.speechBubble.setParent(customerData.customerEntity)
}

export function createCustomer(position: Vector3, plate: CustomerPlate) {
  let customer = new Entity()
  let customerData = new CustomerData()

  customerData.plate = plate
  plate.ownerCustomer = customerData

  customer.add(customerData)
  customerData.customerEntity = customer

  customer.add(
    new Transform({
      position: position,
      scale: new Vector3(0.75, 0.75, 0.75),
      rotation: Quaternion.Euler(0, 90, 0)
    })
  )

  // TODO: Add shape randomization
  let shape = new GLTFShape('models/walkers/BlockDog.gltf')
  customer.add(shape)
  customerData.shape = shape

  customer.get(GLTFShape).addClip(sittingAnimation)

  engine.addEntity(customer)

  if (customersSystem) {
    customersSystem.initializeCustomer(customer, customerData)
  } else {
    log("couldn't initialize customer")
  }

  return customer
}

export function deliverOrder(plate: CustomerPlate) {
  // eatingAnimation.play()

  let randomizedMessage: string
  let bubbleMaterial: Material
  if (plate.dish == plate.ownerCustomer.dish) {
    log('WELL DONE!!!')
    playerScore += 50

    bubbleMaterial = goodBubbleMaterial

    randomizedMessage =
      customerCorrectDishMessages[
        Math.floor(Scalar.RandomRange(0, customerCorrectDishMessages.length))
      ]
  } else {
    log('WRONG!!!')
    playerScore -= 50

    bubbleMaterial = badBubbleMaterial

    randomizedMessage =
      customerWrongDishMessages[
        Math.floor(Scalar.RandomRange(0, customerWrongDishMessages.length))
      ]
  }

  updateSpeechBubble(plate.ownerCustomer, randomizedMessage, bubbleMaterial)

  log('score: ' + playerScore)
  scoreTextShape.value = playerScore.toString()

  plate.ownerCustomer.receivedDish = true
  plate.ownerCustomer.waitingTimer = plate.ownerCustomer.timeBeforeLeaving

  // Enable the next customer if the score is high enough
  if (customers.entities.length < 4) {
    if (playerScore >= 350) {
      if (customers.entities.length < 4) {
        createCustomer(
          new Vector3(12.5, 0.75, 12.5),
          plates.entities[3].get(CustomerPlate)
        )
      }
    } else if (playerScore >= 250) {
      if (customers.entities.length < 3) {
        createCustomer(
          new Vector3(12.5, 0.75, 11.5),
          plates.entities[2].get(CustomerPlate)
        )
      }
    } else if (playerScore >= 100) {
      if (customers.entities.length < 2) {
        createCustomer(
          new Vector3(12.5, 0.75, 10.5),
          plates.entities[1].get(CustomerPlate)
        )
      }
    }
  } else if (playerScore >= 500) {
    // "YOU WIN. RESETTING GAME IN 5...4...3..."
  } else if (playerScore <= -200) {
    // "YOU LOSE. RESETTING GAME IN 5...4...3..."
  }
}

const sittingAnimation = new AnimationClip('Sitting', { loop: false })
// const eatingAnimation = new AnimationClip('Drinking', { loop: false })
sittingAnimation.play()
