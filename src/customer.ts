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
import { finishedPlaying, finishGame } from './finishedGameUI'

const customerRawNoodleMessages = [
  "Me like some noodles! Me like'em RAW!",
  'RAW noodles please, and hurry!',
  'Noodles! A nice dry brick of RAW ones!',
  'Noodles! NO cooking for me',
  'HARD RAW NOODLES'
]

const customerRawSushiMessages = [
  'They say you got the best rolls, gimme! NO slicing!',
  'One roll please. In ONE piece!',
  'A full sushi roll I can swallow in one gulp!',
  'SUSHI. NO CUTTING.'
]

const customerCookedNoodleMessages = [
  'I want cooked noodles, NOW!',
  'I... need... my... hot... noodles...',
  'Ramen Noodles, they better be here soon.',
  "Decentraland's best ramen huh? I'll try some",
  'A bowl of noodles, please'
]

const customerSlicedSushiMessages = [
  'sliced sushi! onegai shimaaasu!',
  'Sushi. Tic Toc.',
  'Sushi dammit! What rya waiting for?',
  'Been exploring decentraland all day, sushi please'
]

const customerTrashMessages = [
  'Noodles! Gimme the stinky ones!',
  'Noodles, the burrrrrrrnt the better!',
  'Well-cooked noodles. Burnt, as you people say.',
  "They say you sell garbage for food, I'd like some",
  "Garbage, don't care what kind"
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
  "I'll talk SO bad about this place",
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
let playerMisses: number = 0

// Player score display (has to be here where the playerScore var lives...)
let scoreTextEntity = new Entity()
let scoreTextShape: TextShape = new TextShape(
  'SCORE: ' + playerScore.toString()
)
scoreTextShape.textWrapping = false
scoreTextShape.color = Color3.Green()
scoreTextShape.fontSize = 150
scoreTextShape.width = 10
scoreTextEntity.set(scoreTextShape)
scoreTextEntity.set(
  new Transform({
    position: new Vector3(13.8, 0.7, 10.5),
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
engine.addEntity(scoreTextEntity)

let missesTextEntity = new Entity()
let missesTextShape: TextShape = new TextShape(
  'MISSES: ' + playerMisses.toString() + '/5'
)
missesTextShape.textWrapping = false
missesTextShape.color = Color3.Red()
missesTextShape.fontSize = 150
missesTextShape.width = 10
missesTextEntity.set(missesTextShape)
missesTextEntity.set(
  new Transform({
    position: new Vector3(13.8, 0.3, 10.5),
    rotation: Quaternion.Euler(0, 270, 0)
  })
)
engine.addEntity(missesTextEntity)

export class CustomersSystem implements ISystem {
  lastInitializedCustomer: number = 0

  update(dt: number) {
    if (finishedPlaying) return

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
          let progressBarParent = customerData.progressBar.getParent()
          engine.removeEntity(customerData.progressBar)
          customerData.progressBar = null
          engine.removeEntity(progressBarParent, true)

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

    if (customers.entities.length <= 2) {
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
      // 35
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

  if (customerData.progressBar) {
    engine.removeEntity(customerData.progressBar, true)
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
    // playerScore -= 50
    playerMisses++

    bubbleMaterial = badBubbleMaterial

    randomizedMessage =
      customerWrongDishMessages[
        Math.floor(Scalar.RandomRange(0, customerWrongDishMessages.length))
      ]
  }

  updateSpeechBubble(plate.ownerCustomer, randomizedMessage, bubbleMaterial)

  log('score: ' + playerScore)
  scoreTextShape.value = 'SCORE: ' + playerScore.toString()
  missesTextShape.value = 'MISSES: ' + playerMisses.toString() + '/5'

  plate.ownerCustomer.receivedDish = true
  plate.ownerCustomer.waitingTimer = plate.ownerCustomer.timeBeforeLeaving

  if (playerMisses == 5) {
    finishGame(playerScore)
    return
  }

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
  }
}

const sittingAnimation = new AnimationClip('Sitting', { loop: false })
// const eatingAnimation = new AnimationClip('Drinking', { loop: false })
sittingAnimation.play()
