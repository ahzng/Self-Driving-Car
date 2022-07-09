//linear interpolation, where t reps percentage of the distance between A and B
function lerp(A,B,t) {
    return A + (B - A) * t;
}


// Returns point where lines from A&B and C&D intersect
// and percentage of distance btween A and B st its loc is at intersection
function getIntersection(A,B,C,D) { 
    const t_top=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const u_top=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bot=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);
    
    //bottom can't be zero bc the formula is top/bot
    if (bot != 0) {
        const t = t_top/bot; //percentage of distance between A and B
        //ex: t=0.2 => pt 20% of the way there from A to B
        const u = u_top/bot; //percentage of distance betweeen C and D

        //bound t and u to be insde the line segments created by ABCD
        if (t>=0 && t<=1 && u>=0 && u<=1) {
            return {
                x: lerp(A.x,B.x,t), //x pos of intersection
                y: lerp(A.y,B.y,t), //y pos of intersection
                offset: t //distance between car and obj as a % between car and ray length
                // t=0 means we are at car center, t=1 means we are at max ray length
            }
        }
    }

    //if there is no intersection
    return null;
}

//check whether two polygons intersect at a given moment
function polysIntersect(poly1, poly2) {
    for (let i=0; i<poly1.length; i++) {

        for(let j=0; j<poly2.length; j++) {

            const touch = getIntersection(
                poly1[i],
                poly1[(i+1) % poly1.length],
                poly2[j],
                poly2[(j+1) % poly2.length]
            );

            if (touch != null) {
                return true;
            }
        }
    }
    return false;
}

function randNum(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min);
} 

//randomly generate traffic
function randomTraffic() {
    let traffic = [];
    for (let i=0; i<20; i++) {
        traffic.push(
            new Car(
                road.spawnLane(randInt(0,road.numLanes-1)),
                -i*randNum(120,200),
                carWidth,
                carHeight,
                1+i*0.05,
                "DUMMY"
            )
        );
    
    }
    return traffic;
}

// document.addEventListener('keydown', (event) => {
//     if (event.key == "s") {
//         console.log("saved");
//     }
// })