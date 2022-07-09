class Controls {
    constructor(controlType) {
        this.forward = false;
        this.reverse = false;
        this.right = false;
        this.left = false;

        /**
         * Allows only the main car to have controls that check for keyboard presses. 
         * Dummy cars have no control abilities and can only move forward.
         * Note the use of private methods don't need to be initialized with a 
         * constructor, unless they are accessed elsewhere. in this case, the car class 
         * uses a controls object and uses this method.
         */
        if (controlType == "HUMAN") {
            this.#addKeyboardListeners();
        }
        else if (controlType == "DUMMY") {
            this.forward = true;
        }

    }

    //add keyboard listeners that continuously check if a key is being pressed 
    //or not
    #addKeyboardListeners() {

        //check if key is being pressed
        document.onkeydown = (event) => {
            switch(event.key) {
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowLeft":
                    this.left = true;
                    break;
            }
        }

        //check if key is being released
        document.onkeyup = (event) => {
            switch(event.key) {
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowLeft":
                    this.left = false;
                    break;
            }
        }
    }
}