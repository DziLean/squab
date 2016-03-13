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
        state = 'resolved';
        value = newValue;

        // if something had been deferred, handle it now that promise is ready
        if (deferred) {
            handle(deferred);
        }
    }

    function reject(reason) {
        state = 'rejected';
        value = reason;

        // in the case of rejection, onRejected is deferred instead of onResolved
        if (deferred) {
            handle(deferred);
        }
    }

    /* handle decides based on enclosed state whether to:
        a. save handler resolution behavior-- cb arg of .then(cb) --in closure
            OR
        b. call handler resolution on value, save new value in closure
        c. reject

    */
    function handle(handler) {
        // pending
        if (state === 'pending') {
            //the value is not yet ready, defer
            deferred = handler;
            // what deferring does is prep for when resolve is eventually called
            return;
        }

        // resolved
        if (state === 'resolved') {
            // if the state is resolved and a success callback was given
            if (handler.onResolved) {
                // call the cb passed to .then(cb)
                var returnValue = handler.onResolved(value);
                // store the new value by resolving it
                handler.resolve(returnValue);
            }

            // ** edge case for when no onResolved cb is passed, eg empty .then()
            if (!handler.onResolved) {
                // just resolve value
                handler.resolve(value);
                return;
            }
        }

        // rejected
        if (state === 'rejected') {
            if (handler.onRejected) {
                var reason = handler.onRejected(value);
                handler.reject(reason);
            } else {
                handler.reject(value);
            }
        }
    }

    this.then = function(onResolved, onRejected) {
        return new Promise(function(resolve, reject){
            /* invoke current Promise instance's handle
                - therefore, this handle refers to the enclosing Promise's 
                    state and value in lines 33 and 40, NOT the ones newly
                    created by new Promise
                - however, the resolve param in line 55 IS that of the newly
                    created Promise, so it refers to the new Promise's closure
                    variables. Look at line 75.
                - so if the state amd value are NEW in resolve, how does our
                    promise chain or remember that its state has already 
                    been resolved?

                  The answer is in handle. On line 42, resolve is called with
                    the newValue obtained from calling the success callback. So
                    even though value is NEW in resolve, it is quickly assigned
                    the previous returnValue on invocation. As for state, when
                    resolve itself is called, it changes state to "resolved" 
                    anyway. This is safe because handle makes that decision when 
                    it checks state before calling resolve.
            */ 
            handle({
                onResolved: onResolved,
                onRejected: onRejected,
                reject: reject,
                resolve: resolve
            });
        });
    }

    /*  on Promise instantiation, invoke the provided func
            - pass argument of resolve, the Promise's internal function,
                which has closure reference to its state, value, and deferred
    */ 
    func(resolve, reject);
}