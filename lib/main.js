module.exports = Promise;

function Promise(func) {
    // closure variables 
    var state = 'pending';
    var deferred = null;
    var value;

}