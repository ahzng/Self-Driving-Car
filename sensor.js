class Sensor {
    constructor(car) {
        this.car = car //takes in a Car object
        this.numRays = 5; //treat rays as vectors
        this.rayLength = 150;
        this.raySpread = Math.PI/2; //net angle that all rays cover

        /**
         * 2d array where each row reps a diff ray
         * Each row contains two objects: start pos (x,y) and end pos (x,y) of the ray 
         * vector associated with that row.
         */
        this.rays = [];

        /**
         * Each ele reps a diff ray
         * Each ele gives the x pos, y pos, and MINIMUM offset for a prtclr ray
         * If an ele is null, there is no object detection
         */
        this.readings = [];
    }

    update(roadBorders,traffic) {

        // update posn and orientation of rays in current time frame
        this.#castRays();

        // update readings for each ray in current time frame
        // rays with null signify no object detection, aka no reading
        this.readings = [];
        for(let i=0; i<this.rays.length; i++) {
            this.readings.push(this.#getReading(this.rays[i],roadBorders,traffic));
        }

    }

    /**
     * Gets first location where a single particular ray touches an object. Returns 
     * null if there are no touches.
     */
    #getReading(ray,roadBorders,traffic) {
        /**
         * Each ele in touches contain x pos, y pos, and offset of an object detected 
         * by a prtclr ray. Ofc, there are no touches if the ray detects no objects.
         */
        let touches = [];

        /**
         * For each border get (x,y) position and distance from intersection of the 
         * single ray and border. If ray is not touching it, touch = null.
         */
        for (let i=0; i<roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0], /*start pos of ray*/
                ray[1], /*end pos of ray*/
                roadBorders[i][0], /*start pos of road border*/
                roadBorders[i][1] /*end pos of road border*/
            );
            if(touch != null) {
                touches.push(touch); //push intersection info for ths prtclr border
            }
        }

        /**
         * For each traffic object check if a line segment in the traffic object 
         * intersects with the specified ray.
         */
        for (let i=0; i<traffic.length; i++) {
            const poly = traffic[i].polygon;
            for (let j=0; j<poly.length; j++) {
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j], //start pos of ?
                    poly[(j+1)%poly.length] //end pos of ?
                );
                if (touch != null) {
                    touches.push(touch);
                }
            }
        }

        /**
         * If the prtclr ray touched nothing, return null. If the ray touched at least 
         * one object, return x pos,y pos, and offset of the CLOSEST obj it touched.
         */
        if(touches.length == 0) {
            return null;
        }
        else {
            //creates array of all offsets that a prtclr ray has
            const offsets = [];
            for(let i=0; i<touches.length; i++) {
                offsets.push(touches[i].offset);
            }

            //finds min offset of all offsets for the prtclr ray
            //...offsets means offsets[0], ..., offsets[n]
            const minOffset = Math.min(...offsets);

            //find the touch that contains the min offset
            for (let i=0; i<touches.length; i++) {
                if (touches[i].offset == minOffset) {
                    return touches[i];
                }
            }
            
        }
    }

    // Update the NUMERICAL VALUES for position and orientation of ray vectors
    //updates this.rays
    #castRays() {
        this.rays = [];

        //use lerp to calculate and draw angle of each ray
        //angle is relative to a ref frame st 0 rad is north and ccw is pos
        for (let i=0; i<this.numRays; i++) {
            const rayAngle = lerp(
                this.raySpread/2, //ex if raySpread=pi then pi/2 ccw
                -this.raySpread/2, //ex if raySpread=pi then pi/2 cw
                this.rayCount == 1 ? 0.5 : i/(this.numRays-1)
            ) + this.car.angle; //last term allows sensor angles to match car
            
            /**
             * Rays are defined by vectors of equal magnitude which begin at 
             * the origin (center of car) and end depending on the angle. Thus, 
             *  x and y posn of the end is det using vector algebra
             */
            const rayStart = {x:this.car.x,y:this.car.y};
            const rayEnd = {
                x: this.car.x - this.rayLength * Math.sin(rayAngle),
                y: this.car.y - this.rayLength * Math.cos(rayAngle)
            };
            this.rays.push([rayStart,rayEnd]);
        }
    }

    //draw each ray
    draw() {

        //draw each ray one at a time
        for (let i=0; i<this.numRays; i++) {

            let rayEnd = this.rays[i][1]; //pos of end point of a ray

            /**
             * If there is a reading for this prtclr ray, change the original ray end 
             * position to the location where there is an intersection. Allows us to 
             * draw the red segment.
             */
            if(this.readings[i] != null) {
                //note that readings[i] is an obj w/ x,y,offset, but we only use x,y
                rayEnd = this.readings[i];
            }

            /**
             * Quick ref:
             * rays is an array that contains info about the state of each ray
             * rays[i] is info about the state of a prtclr ray
             * rays[i][0] is an obj w/ x,y for the beginning of a ray
             * rays[i][1] is an obj w/ x,y for the tip of a fully extended ray
             */

            // red segment: car center to intersection location
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "green";
            ctx.moveTo(this.rays[i][0].x,this.rays[i][0].y); //car center
            ctx.lineTo(rayEnd.x,rayEnd.y); //intersection location
            ctx.stroke();

            // black segment: tip of ray to intersection location
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.moveTo(this.rays[i][1].x,this.rays[i][1].y); //tip of ray
            ctx.lineTo(rayEnd.x,rayEnd.y); //intersection location
            ctx.stroke();
        }
    }

}