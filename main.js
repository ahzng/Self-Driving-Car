/**
 * Evolution of self driving cars:
 * The 1st generation is an initial set of cars with randomized brains. There is no 
 * parent car to refer to bc there is no best brain in local storage to access. The 1st 
 * gen passes down its best brain to the 2nd gen. This brain acts as the parent of the 
 * 2nd gen, as cars in this gen are mutated versions of the best brain of the 1st gen. 
 * This process repeats for the 3rd gen, then the 4th gen, and so on.
 * 
 * Steps:
 * 1) Create environment in which cars learn to perform in.
 * 2) Determine population of the initial gen. Make sure local storage is empty, then 
 * run sim and save best car in local storage.
 * 3) Determine degree of mutation, then run sim and save new best car in local storage.
 * 4) Repeat step 3 for every generation.
 * 
 * Notes:
 * default coord system is origin at top left corner
 */

//retrieves the node in the DOM representing the <canvas> element
const canvas = document.querySelector('canvas');
canvas.width = 350; //is adjustable
const ctx = canvas.getContext('2d'); //allow accesss to methods to make 2d drawings

// Generate elements
const road = new Road(canvas.width/2,canvas.width*0.8,5);
let cars = generateCars(1); // create N cars with RANDOMIZED brains
let bestCar = cars[0]; //car 0 always refers to best car
const traffic = [
    new Car(road.spawnLane(2),-100,30,50,2,"DUMMY"),
    new Car(road.spawnLane(0),-300,30,50,2,"DUMMY"),
    new Car(road.spawnLane(3),-300,30,50,2,"DUMMY"),
    new Car(road.spawnLane(4),-500,30,50,2,"DUMMY"),
    new Car(road.spawnLane(1),-500,30,50,2,"DUMMY"),
    new Car(road.spawnLane(1),-700,30,50,2,"DUMMY"),
    new Car(road.spawnLane(2),-700,30,50,2,"DUMMY"),
    new Car(road.spawnLane(4),-700,30,50,2,"DUMMY"),
    new Car(road.spawnLane(0),-900,30,50,2,"DUMMY"),
    new Car(road.spawnLane(1),-900,30,50,2,"DUMMY"),
    new Car(road.spawnLane(2),-900,30,50,2,"DUMMY"),
    new Car(road.spawnLane(4),-900,30,50,2,"DUMMY"),
]; //can be randomized too

// Generate N cars each with randomly initialized brains
function generateCars(N) {
    let cars = [];
    for (let i=0; i<N; i++) {
        cars.push(new Car(road.spawnLane(2),100,30,50,3,"AI"));
    }
    return cars;
}

// Create animation loop
function animate() {

    //update state of traffic
    for (i=0; i<traffic.length; i++) {
        traffic[i].update(road.borders,[]);
    }

    // the car class handles all sensor related info by itself
    //update state of car and sensor
    for (let i=0; i<cars.length; i++) {
        cars[i].update(road.borders,traffic);
    }

    /**
     * Find the car in cars whose y value is equal to the min value of all the y values 
     * of the cars.
     * Fitness function determines the "best" car(s).
     * AKA bestCar = cars.find(c => c.y == Math.min(...cars.map(c=>c.y)));
     */
    //maps array of each car's y value
    let y_vals = [];
    for (let i=0; i<cars.length; i++) {
        y_vals.push(cars[i].y);
    }
    //finds min car y value
    const minY = Math.min(...y_vals);
    //find the car that contains the min car y value
    for (let i=0; i<cars.length; i++) {
        if (cars[i].y == minY) {
            bestCar = cars[i];
        }
    }
    //console.log(bestCar.brain); //debug: continuously print brain of best car

    canvas.height = window.innerHeight;

    ctx.save();

    //Allows for a "moving camera" that follows the car. 
    ctx.translate(0,-bestCar.y + canvas.height * 0.7);

    //draw updated state of road
    road.draw(ctx);

    //draw updated state of traffic
    for (i=0; i<traffic.length; i++) {
        traffic[i].draw(ctx,"yellow");
    }

    /**
     * Draw updated state of AI cars with transparency. Some cars appear to be "solid" 
     * bc they are overlapping with several highly transparent cars.
     */
    ctx.globalAlpha = 0.2;
    for (let i=0; i<cars.length; i++) {
        cars[i].draw(ctx,"blue",false);
    }
    ctx.globalAlpha = 1;
    //Let car 0 be the only car that has sensors
    bestCar.draw(ctx,"blue",true);

    ctx.restore();
    requestAnimationFrame(animate); //call animate method again
}

/**
 * LOCAL STORAGE
 * The localStorage object to save, read, and remove data in the form of JSON strings 
 * from local storage, which exists in the browser forever. 
 * (sessionStorage stores data for only one session)
 * https://www.w3schools.com/jsref/prop_win_sessionstorage.asp
 * window.localStorage == localStorage
 */

//store brain of best car in local storage
 function saveBest() {
    window.localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

//discard brain of best car in local storage
function discardBest() {
    window.localStorage.removeItem("bestBrain");
}

//get brain of best car in local storage
function getBest() {
    return JSON.parse(window.localStorage.getItem("bestBrain"));
}

document.onkeydown = (event) => {
    switch(event.key) {
        case "s":
            //console.log(bestCar.brain);
            saveBest();
            console.log("SAVED");
            break;
        case "d":
            discardBest();
            console.log("DISCARDED");
            break;
    }
}

if(localStorage.getItem("bestBrain") != null) {
    // give best brain to car 0 (parent car)
    cars[0].brain = getBest();

    //give mutated versions of best brain to other cars (children car)
    for (let i=1; i<cars.length; i++) {
        cars[i].brain = getBest();
        Network.mutate(cars[i].brain,0.2);
    }
}

animate();