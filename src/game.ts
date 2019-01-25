@Component("grabableObjectComponent")
export class GrabableObjectComponent {
  grabbed: boolean = false;
  // lifter: Entity ?
}

@Component("objectGrabberComponent")
export class ObjectGrabberComponent {
  grabbedObject: Entity = null;
  // lifter: Entity ?
}


// component group listing all liftable entities
const liftableStuff = engine.getComponentGroup(GrabableObjectComponent);

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
  transform = objectGrabber.get(Transform);
  objectGrabberComponent = objectGrabber.get(ObjectGrabberComponent);

  constructor() {
    input.subscribe("BUTTON_A_DOWN", e => {
       for (let thing of liftableStuff.entities) {
        let picked = thing.get(GrabableObjectComponent);
        if (picked.grabbed) {
          picked.grabbed = false;
          thing.setParent(null);
          this.objectGrabberComponent.grabbedObject = null;

          let newPos = camera.position.add(Vector3.Forward());
          newPos.y = 0.5;
          thing.get(Transform).position = newPos;
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
