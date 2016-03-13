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
        // try and catch to pick up unexpected errors when resolving
        try {
            // if what is returned by an onResolved() is a promise
            if (newValue && typeof newValue.then === 'function') {
                // must invoke that promise to eventual resolution
                newValue.then(resolve, reject);
                return;
            }
            state = 'resolved';
            value = newValue;

            // if something had been deferred, handle it now that promise is ready
            if (deferred) {
                handle(deferred);
            }
        } catch (err) {
            reject(err);
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
        c. reject, save reasoni in closure

    */
    function handle(handler) {
        // pending
        if (state === 'pending') {
            //the value is not yet ready, defer
            deferred = handler;
            // what deferring does is prep for when resolve is eventually called
            return;
        }

        // promise resolution (invoked inside handle) must async
        setTimeout(function(){
            var handlerCb;

            // resolved
            if (state === 'resolved') {
                handlerCb = handler.onResolved;
            }
            // rejected
            else if (state === 'rejected') {
                handlerCb = handler.onRejected;
            }

            if (handlerCb) {
                var returnValueOrReason;
                // try and catch to pick up unexpected handler callback exceptions
                try {   
                    returnValueOrReason = handlerCb(value);
                } catch (err) {
                    handler.reject(err);
                    return;
                }

                // if the state is resolved and a success callback was given
                if (state === 'resolved') {
                    // store the new value by resolving it
                    handler.resolve(returnValueOrReason);
                }
                // if the state is resolved and a success callback was given
                else if (state === 'rejected') {
                    // store the rejection reason by resolving it
                    handler.reject(returnValueOrReason);
                }
            }

            // ** edge case for when no cb is passed, eg empty .then()
            if (!handlerCb) {
                // just resolve on resolved state or reject on rejected state
                state === 'resolved' ? handler.resolve(value) : handler.reject(value);
                return;
            }
        }, 1);
    }

    this.then = function(onResolved, onRejected) {
        return new Promise(function(resolve, reject){
            /* invoke current Promise instance's handle
                - therefore, this handle refers to the enclosing Promise's 
                    state and value in lines 55 and 79, NOT the ones newly
                    created by new Promise in lines 5 and 7
                - however, the resolve param in line 107 IS that of the newly
                    created Promise, so it refers to the new Promise's closure
                    variables. Look at line 140.
                - so if the state amd value are NEW in resolve, how does our
                    promise chain or remember that its state has already 
                    been resolved?

                  The answer is in handle. On line 88, resolve is called with
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