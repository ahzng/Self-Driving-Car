class Car {
    constructor(x,y,width,height,maxVel,controlType) {
        this.x = x; //x pos of top left corner of car in the DEFAULT ref frame
        this.y = y; //y pos of top left corner of car in the DEFAULT ref frame
        this.width = width;
        this.height = height;

        this.vel = 0;
        this.accel = 0.2; //constant acceleration
        this.maxVel = maxVel;
        this.friction = 0.05; //coefficient of kinetic friction
        this.angle = 0; // define a unit circle st north is 0, ccw is pos
        this.damaged = false; //has car touched borders/objects

        //Even in the constructor, controlType is still referring to the parameter,
        //NOT the instance variable.
        this.controlType = controlType

        if (controlType == "AI") {
            //"this" refers to the entire Car object
            //"sensor" refers to the rays associated with this Car object
            this.sensor = new Sensor(this);
            
            /**
             * When we save the brain of the best car, we are essentially saving 
             * the prtclr weights/biases of that brain. Those unique weights/biases
             * were the optimal parameters out of the group of cars that were 
             * tested.
             * NOTE: when det how to save best brain, should i save this.brain or 
             * this.brain (the entire Network object) or this.brain.level1 and 2 
             * (the actual arrays that hold the precious parameter values)???
             */
            this.brain = new Network(this.sensor.numRays,6,4);
            //this.brain = BESTBRAIN;
        }
        this.controls = new Controls(controlType);
    }

    // Update the NUMERICAL VALUES for position and orientation of car and sensor
    update(roadBorders,traffic) {

        //update state of car (as long as it isnt dmged)
        if (!this.damaged) {
            this.#move(); //update numerical state of car

            //using current posn of car update numerical state of corners of car
            this.polygon = this.#createPolygon();

            //check if there is collision with borders or traffic
            this.damaged = this.#assessDamage(roadBorders,traffic);
            
        }

        /**
         * Update state of sensor (even if car is dmged)
         * The brain completely relies on the sensor data. Thus, after the sensors are 
         * updated, we immediately send the information into the brain for it to produce 
         * an output. We then directly connect the output to the control values.
         */
        if (this.sensor) {
            //update state of sensor
            this.sensor.update(roadBorders,traffic);

            //use sensor data to determine controls
            if (this.controlType == "AI") {
                /**
                 * We define our sensor data for each ray to be 1 minus the min offset
                 * for that prtclr ray, to emphasize that higher values mean objects 
                 * are closer (unlike offset). 
                 * We obtain the min offset thru the readings array in the Sensor 
                 * class. If an element (is null), we set the sensor data equal 0 
                 * for that prtlcr ray. We create an array to store this sensor 
                 * data for each ray.
                 * 
                 * AKA
                 * const sensorData=this.sensor.readings.map(s=>s==null?0:1-s.offset);
                 */
                let sensorData = [];
                for (let i=0; i<this.sensor.readings.length; i++) {
                    if (this.sensor.readings[i] != null) {
                        sensorData.push(1-this.sensor.readings[i].offset);
                    }
                    else {
                        sensorData.push(0);
                    }
                }
                //console.log(sensorData); //debug
                
                //Calculate 4 discrete output values using forward prop by inputting 
                //sensor data into the "brain"
                const outputs = Network.forwardProp(this.brain, sensorData);
                //console.log(outputs); //debug

                //connect output to controls
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    //check if there is collision for each object
    #assessDamage(roadBorders,traffic) {
        //check each border
        for (let i=0; i<roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        //check each traffic object
        for (let i=0; i<traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #move() {

        if (this.controls.forward) {
            this.vel += this.accel;
        }

        if (this.controls.reverse) {
            this.vel -= this.accel;
        }

        // prevents car from going over max forward speed
        if (this.vel > this.maxVel) {
            this.vel = this.maxVel;
        }

        // prevents car from going over max reverse speed
        if (this.vel < -this.maxVel) {
            this.vel = -this.maxVel;
        }

        //frictional force opposes forward motion
        if (this.vel > 0) {
            this.vel -= this.friction;
        }

        //frictional force opposes reverse motion
        if (this.vel < 0) {
            this.vel += this.friction;
        }

        //fixes bug where car is moving due to velocity too small of a value
        //relative to friction
        if (Math.abs(this.vel) < this.friction) {
            this.vel = 0;
        }

        /**
         * Checks if car is not moving. If so, rotations are not allowed to 
         * happen. If car is moving forward, right key turns car right and left 
         * key turns car left. If car is moving reverse, right key turns car 
         * right and left key turns car left. This is defined as such bc it 
         * mimics the functionality of a steering wheel.
         */
        if (this.vel != 0) {

            // determines if car is moving forward or backward
            const sign = this.vel > 0 ? 1 : -1;

            if (this.controls.right) {
                this.angle -= 0.03 * sign;
            }
    
            if (this.controls.left) {
                this.angle += 0.03 * sign;
            }
        }

        /**
         * Note that x and y are coordinates in the DEFAULT reference frame. 
         * The negative sign is because in canvas, up and left is neg directions. 
         * For each delta t, x and y change depending on the mag and orient of 
         * the velocity vector, which is defined by how the arrow keys have been 
         * pressed.
         * 
         * The following 2 lines ONLY update the POSITION of the car. The draw 
         * function will update the ORIENTATION of the car.
         */
        this.x -= Math.sin(this.angle) * this.vel;
        this.y -= Math.cos(this.angle) * this.vel;

    }

    //allows us to easily manipulate shape of car (add/move corners)
    #createPolygon() {

        const corners = []; //each ele gives location for a corner of the car
        const rad = Math.hypot(this.width,this.height) / 2; //radius of car

        //angle between a vert line and line connecting midpoint and a corner
        const alpha = Math.atan2(this.width,this.height);

        corners.push({
            x: this.x - rad * Math.sin(this.angle - alpha),
            y: this.y - rad * Math.cos(this.angle - alpha)
        });
        corners.push({
            x: this.x - rad * Math.sin(this.angle + alpha),
            y: this.y - rad * Math.cos(this.angle + alpha)
        });
        corners.push({
            x: this.x - rad * Math.sin(Math.PI + this.angle - alpha),
            y: this.y - rad * Math.cos(Math.PI + this.angle - alpha)
        });
        corners.push({
            x: this.x - rad * Math.sin(Math.PI + this.angle + alpha),
            y: this.y - rad * Math.cos(Math.PI + this.angle + alpha)
        });

        return corners;
    }


    // Updates reference frame and draws updated position and orientation of 
    // car AND sensors.
    // Initial ref frame is relative to top left corner, but changes continuously
    // to match car's position and rotate to fit car's orientation.
    drawOld(ctx) {

        ctx.save();

        /**
         * The purpose of the following two lines are to update the visual 
         * orientation of the car. The translate and rotate functions change 
         * the ref frame, NOT the car. We essentially have a moving ref frame 
         * where the origin is always at the center of the car, and rotations 
         * are about the center of the car.
         */

        ctx.translate(this.x,this.y); // create new ref frame st O is at car posn
        ctx.rotate(-this.angle); //rotation angle is cw in radians

        //draw position of car in the new, translated+rotated ref frame
        //Note that positions in rect() is not (0,0) because position is defined 
        //as the position of the top left corner of the element. The inputs for 
        //the position allow the center of the car to be at the origin.
        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fillStyle = 'blue';
        ctx.fill();

        ctx.restore();

        this.sensor.draw(ctx);
    }

    //replace old draw method
    draw(ctx, color, drawSensor) {

        //draw dmgd or not dmgd car
        if (this.damaged == true) {
            ctx.fillStyle = "silver";
        }
        else {
            ctx.fillStyle = color;
        }

        //draw current state of car using its corners
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y); //move to 1st corner
        for (let i=1; i<this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y); //move to remning corners
        }
        ctx.fill();

        //draw current state of sensors
        if ((this.sensor != null) && (drawSensor == true)) {
            this.sensor.draw(ctx);
        }
    }

}