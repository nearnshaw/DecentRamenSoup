@Component("grabableObjectComponent")
export class GrabableObjectComponent {
  grabbed: boolean = false;
  // lifter: Entity ?
}

// component group grabbable all liftable entities
const grabableStuff = engine.getComponentGroup(GrabableObjectComponent);


@Component("objectGrabberComponent")
export class ObjectGrabberComponent {
  grabbedObject: Entity = null;
  // lifter: Entity ?
}

@Component("gridPosition")
export class GridPosition {
  object: Entity = null
  //height: number = 0
}

// component group grid positions
const gridPositions = engine.getComponentGroup(GridPosition);



// object to get buttonUp and buttonDown events
const input = Input.instance;

// object to get user position and rotation
const camera = Camera.instance;

// ----------------------------

let objectGrabber = new Entity();
objectGrabber.add(
  new Transform({
    position: camera.position,
    rotation: camera.rotation
  })
);
objectGrabber.add(new ObjectGrabberComponent());
engine.addEntity(objectGrabber);

export class ObjectGrabberSystem implements ISystem {
  transform = objectGrabber.get(Transform)
  objectGrabberComponent = objectGrabber.get(ObjectGrabberComponent)

  constructor() {
    input.subscribe("BUTTON_A_DOWN", e => {
       for (let thing of grabableStuff.entities) {
        let picked = thing.get(GrabableObjectComponent)
        if (picked.grabbed) {
          picked.grabbed = false
          let pos = getClosestPos()
          thing.setParent(pos)
          thing.get(Transform).position = Vector3.Zero()
          this.objectGrabberComponent.grabbedObject = null

          //let newPos = camera.position.add(Vector3.Forward())
          //newPos.y = 0.5
          
        }
      } 
    });
  }

  update() {
    this.transform.position = camera.position;
    this.transform.rotation = camera.rotation;
  }

  public grabObject(grabbedObject: Entity) {
    if (!this.objectGrabberComponent.grabbedObject) {
      log("picked up");

      this.objectGrabberComponent.grabbedObject = grabbedObject;
      grabbedObject.get(GrabableObjectComponent).grabbed = true;
      grabbedObject.setParent(objectGrabber);
      grabbedObject.get(Transform).position.set(0, 1, 1);
    } else {
      log("already holding");
    }
  }

  dropObject() {
    if (!this.objectGrabberComponent.grabbedObject) return;

    this.objectGrabberComponent = null;
  }
}

const objectGrabberSystem = new ObjectGrabberSystem();
engine.addSystem(objectGrabberSystem);

// ----------------------------

let box = new Entity();
box.add(new BoxShape());
box.get(BoxShape).withCollisions = true;
box.add(new GrabableObjectComponent());
box.set(
  new Transform({
    position: new Vector3(5, 0.5, 5),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
);
box.add(
  new OnClick(e => {
    objectGrabberSystem.grabObject(box);
  })
);
engine.addEntity(box);

let box2 = new Entity();
box2.add(new BoxShape());
box2.get(BoxShape).withCollisions = true;
box2.add(new GrabableObjectComponent());
box2.set(
  new Transform({
    position: new Vector3(3, 0.5, 5),
    scale: new Vector3(0.5, 0.5, 0.5)
  })
);
box2.add(
  new OnClick(e => {
    objectGrabberSystem.grabObject(box2);
  })
);
engine.addEntity(box2);

// create grid
let shelves: number[][] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0]
]
let xOffset = 10
let zOffset = 5

let xMax = 7
let zMax = 7
let xPos = 0
let zPos = 0
for (let x = 0; x < xMax; x ++){
  for (let z = 0; z < zMax; z ++){
    let gridPos = new Entity() 
    let y = shelves[x][z]
    gridPos.add(new Transform({
      position: new Vector3(x+ xOffset, y, z + zOffset)
    }))
    gridPos.add(new GridPosition())
    engine.addEntity(gridPos)

    let testEnt = new Entity()
    testEnt.setParent(gridPos)
    testEnt.add(new BoxShape())
    testEnt.add(new Transform({
      scale: new Vector3(0.5, 0.1, 0.5)
    }))
    engine.addEntity(testEnt)
  }
}

// get closest when dropping
function getClosestPos(){
  let closestDist = 100
  let closestGridPos = null
  for (let place of gridPositions.entities) {
    let pos = place.get(Transform).position
    let d = distance(camera.position, pos)
    if (d < closestDist){
      closestDist = d
      closestGridPos = place
    }
  }
  return closestGridPos  
}


// Get distance
/* 
Note:
This function really returns distance squared, as it's a lot more efficient to calculate.
The square root operation is expensive and isn't really necessary if we compare the result to squared values.
We also use {x,z} not {x,y}. The y-coordinate is how high up it is.
*/
function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return a * a + b * b
}