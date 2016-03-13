module.exports = Promise;

function Promise(func) {
    // closure variables 
    var state = 'pending';
    var deferred = null;
    var value;

    /* resolve is called once the eventual value is ready 
        ex) 
            someApiCall.onSuccess(function(val){
                resolve(val)
            });
    */
    function resolve(newValue) {
        value = newValue;
        state = 'resolved';


    }

    /* handle decides based on enclosed state whether to:
        a. save handler resolution behavior in closure
            OR
        b. call handler resolution on value, save new value in closure 

    */
    function handle(handler) {
        // if the value is not yet ready, defer
        if (state === 'pending') {
            deferred = handler;
            return;
        } 
    }
}