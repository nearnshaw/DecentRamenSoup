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

/* @Component("option")
export class Option {
  visible: boolean = false;
} */

// component group listing all liftable entities
// const liftableStuff = engine.getComponentGroup(GrabableObjectComponent);

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
      /* for (let thing of liftableStuff.entities) {
        let picked = thing.get(GrabableObjectComponent);
        if (picked.grabbed) {
          picked.grabbed = false;
          thing.setParent(null);
          this.objectGrabberComponent.grabbedObject = null;

          let newPos = camera.position.add(Vector3.Forward());
          newPos.y = 0.5;
          thing.get(Transform).position = newPos;
        }
      } */
    });
  }

  update() {
    this.transform.position = camera.position;
    this.transform.rotation = camera.rotation;
    // for (let thing of liftableStuff.entities) {
    //   let picked = thing.get(Liftable)
    //   if (picked.pickedUp){

    //   }
    // }
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

// ----------------------------

/* let cutOption = new Entity();
cutOption.set(new PlaneShape());
cutOption.get(PlaneShape).billboard = BillboardMode.BILLBOARDMODE_ALL;
cutOption.add(
  new Transform({
    position: new Vector3(0, 1, 0),
    scale: new Vector3(0.25, 0.25, 0.25)
  })
);
cutOption.setParent(box);
cutOption.add(
  new OnClick(e => {
    log("cutting");
    let parent = cutOption.getParent();
    //cutAnimation(parent)
  })
);
engine.addEntity(cutOption); */

// ----------------------------

let box2 = new Entity();
box2.add(new BoxShape());
box2.get(BoxShape).withCollisions = true;
box2.get(BoxShape).billboard = BillboardMode.BILLBOARDMODE_ALL;
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

// ----------------------------

let text = new Entity()
text.add(new TextShape('Te volvés a MuleSoft!'))
text.get(TextShape).billboard = 7
text.get(TextShape).color = Color3.Blue()
text.get(TextShape).fontSize = 180
text.get(TextShape).width = 8
text.get(TextShape).fontWeight = "b"
text.add(
  new Transform({
    position: new Vector3(5, 2.5, 5)
  })
)
engine.addEntity(text)
