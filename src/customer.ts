import { createProgressBar } from "./progressBar";
import { createSpeechBubble } from "./speechBubble";

export const enum DishType {
    Noodles,
    Sushi
  }

export const customerMessages = [
    "I want noodles, NOW!",
    "What are you waiting for? Get me sushi",
    "Excuse me kind sir, if I could interrupt what you're doing for just one moment... I'd very much appreciate if you could please serve me one of those plates of noodles that your fine establishment is so famous for, if it isn't much trouble. FAST!",
    "Sushi. Tic Toc."
]

@Component('customerData')
export class CustomerData {
  waiting: boolean = false
  dish: DishType
  idleTimer: number
  constructor(dish: DishType, idleTime: number){
    this.dish = dish
    this.idleTimer = idleTime
  }
}

export const customers = engine.getComponentGroup(CustomerData)




export class OrderFood implements ISystem {
    update(dt: number) {
      for (let customer of customers.entities) {
        let state = customer.get(CustomerData)
        if (state.waiting){return}
        state.idleTimer -= dt
        if (state.idleTimer< 0){
            state.waiting = true
            createProgressBar(customer)
            let messageIndex = Math.floor(Scalar.RandomRange(0,customerMessages.length) )
            createSpeechBubble(customer, customerMessages[messageIndex], 4, 2)
            
        }
      }
    }
}

