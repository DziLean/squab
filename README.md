# squab
a basic Promise library

####Installation
    $ npm install squab

####Usage
    var Promise = require("squab");

    function someAsyncFunction() {
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                var value = Math.ceil(Math.random() * 10);
                if (value % 2) {
                        resolve(value);
                    } else {
                        reject(value);
                    }
            }, 0);
        });
    }

    someAsyncFunction()
        .then(function(odd){
            console.log("odd number: " + odd);
            return odd;
        }, function(even) {
            console.log("even number: " + even);
            return even;
        });

#####Chaining
    someAsyncFunction()
        .then(function(odd){
            return odd * 100;
        }, function(even) {
            console.log("rejected!");
            return "I was even: " + even;
            })
        .then(function(onlyOdd){
            console.log ("original value times 100: " + onlyOdd);
        });
