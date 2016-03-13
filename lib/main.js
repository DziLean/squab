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
        deferred = null;

        
    }

}