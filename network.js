/**
 * A neural network with 1 hidden layer.
 * When a Network class is created, the weights and biases for level 1 and level 2 are 
 * automatically randomly initialized with values between -1 and 1.
 * 
 * To forward propogate thru the network:
 * First, input sensory data array (w/o bias unit) into the input layer. 
 * Next, use the input layer and random weights/biases in level 1 to calculate a 
 * discrete output for the hidden layer. 
 * Next, use those outputs (w/o bias unit) and random weights/biases in level 2 to 
 * calculate the output in the final layer, which is discrete.
 * 
 * NOTE: The values in the hidden layer and output layer are discrete bc of the formula 
 * we used in forward prop for a layer. In future work, they can be made continuous 
 * using the sigmoid function.
 */
class Network {
    constructor(numInputs,numHidden,numOutputs) {
        this.levels = [
            new Level(numInputs,numHidden), new Level(numHidden,numOutputs)
        ];
    }

    //Generate outputs in the output layer given inputs in the input layer
    static forwardProp(network, inputs) {
        let outputs = Level.forwardProp(network.levels[0], inputs);
        outputs = Level.forwardProp(network.levels[1], outputs);
        return outputs;
    }

    /**
     * Mutate each weight/bias using lerp. The higher the variance (0 to 1), the more 
     * mutation, or deviation from the original weight/bias there is. If variance is 
     * 0, there is 0% mutation, so params stay the same. If variance is 1, then there 
     * is 100% mutation- essentially creating brand new randomized params.
     */
    static mutate(network, variance) {
        for (let lvl=0; lvl<network.levels.length; lvl++) {

            //mutate biases
            for (let i=0; i<network.levels[lvl].biases.length; i++) {
                network.levels[lvl].biases[i] = lerp(
                    network.levels[lvl].biases[i],
                    Math.random()*2-1,
                    variance
                );
            }

            //mutate weights
            for (let i=0; i<network.levels[lvl].weights.length; i++) {
                for (let j=0; j<network.levels[lvl].weights[i].length; j++) {
                    network.levels[lvl].weights[i][j] = lerp(
                        network.levels[lvl].weights[i][j],
                        Math.random()*2-1,
                        variance
                    );
                }
            }

        }
    }

}

/**
 * Defines the relationship between two layers of a neural network. When a Level class 
 * is created, it automatically generates randomly initialized weights and biases.
 */
class Level {
    constructor(numInputs,numOutputs) {
        this.inputLayer = new Array(numInputs);
        this.outputLayer = new Array(numOutputs);

        /**
         * Declare empty 2d array of weights (exc biases). Each row reps weights for a 
         * prtclr input node (equiv to columns of Theta)
         */
        this.weights = [];
        for (let i=0; i<numInputs; i++) {
            // this.weights[i] = new Array(numOutputs); //same thing i think
            this.weights.push(new Array(numOutputs));
        }

        //weights assoc with the input bias
        this.biases = new Array(numOutputs);

        //initialize weights with random values
        Level.#initialize(this);
    }

    //randomly initialize weights and biases (weights for the bias node) for given lvl
    static #initialize(level) {
        //initialize weights
        for (let i=0; i<level.inputLayer.length; i++) {
            for (let j=0; j<level.outputLayer.length; j++) {
                level.weights[i][j] = Math.random()*2-1;
            }
        }

        //initialize weights for the bias node
        for (let i=0; i<level.outputLayer.length; i++) {
            level.biases[i] = Math.random()*2-1;
        }
    }

    /**
     * Forward prop for a given level and inputted values to get output values. 
     * NOTE the inputted values DO NOT include the bias unit of +1. Thus, the 
     * inputted values array is as long as the input layer array, which also doesn't 
     * include a space for the bias unit.
     */
    static forwardProp(level, inputs) {
        //same thing i think
        // for (let i=0; i<level.inputLayer.length; i++) {
        //     level.inputLayer[i] = inputs[i];
        // }

        level.inputLayer = inputs; //set input layer equal to given inputs

        //get outputs using linear combinations
        for (let i=0; i<level.outputLayer.length; i++) {
            let sum = 0;
            for (let j=0; j<level.inputLayer.length; j++) {
                sum += level.inputLayer[j] * level.weights[j][i];
            }

            /**
             * Noob method
             * Condition: input_1*w_1 + ... + input_n*w_n > (+1)*w_bias
             * Note that the bias input is ALWAYS +1.
             */
            if (sum > 1*level.biases[i]) {
                level.outputLayer[i] = 1;
            }
            else {
                level.outputLayer[i] = 0;
            }

            /**
             * Better method
             * Condition: (+1)*w_bias + input_1*w_1 + ... + input_n*w_n > 0
             * Note that the bias input is ALWAYS +1
             */
            // if (1*level.biases[i] + sum > 0) {
            //     level.outputLayer[i] = 1;
            // }
            // else {
            //     level.outputLayer[i] = 0;
            // }
        }

        return level.outputLayer;
    }



}