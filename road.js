class Road {
    constructor(center, width, numLanes) {
        this.center = center;
        this.width = width;
        this.numLanes = numLanes;

        this.leftBound = center - width/2;
        this.rightBound = center + width/2;
        this.upperBound = -1000000;
        this.lowerBound = 1000000;

        //define borders of road
        //array bc it allows for more complex shapes with multiple line 
        //segments that form the road
        const topLeft = {x:this.leftBound,y:this.upperBound};
        const topRight = {x:this.rightBound,y:this.upperBound};
        const botLeft = {x:this.leftBound,y:this.lowerBound};
        const botRight = {x:this.rightBound,y:this.lowerBound};
        this.borders = [ [topLeft,botLeft], [topRight,botRight] ];
    }

    // Draws road lines
    draw() {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        //use lerp to calculate and draw positions of road lines
        //exc. borders
        for (let i=1; i<=this.numLanes-1; i++) {
            const x = lerp(this.leftBound,this.rightBound,i/this.numLanes);
            ctx.setLineDash([20,20]);
            ctx.beginPath();
            ctx.moveTo(x,this.upperBound);
            ctx.lineTo(x,this.lowerBound);
            ctx.stroke();
        }

        //draw borders
        //for each border (ie right side and left side), draw a line from the 
        //initial posn (at index 0) to the final posn (at index 1)
        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x,border[0].y);
            ctx.lineTo(border[1].x,border[1].y);
            ctx.stroke();
        })
    }

    //get center position of a particular lane
    spawnLane(laneIndex) {
        const laneWidth = this.width/this.numLanes;
        return this.leftBound + laneIndex*laneWidth + laneWidth/2;
    }
}