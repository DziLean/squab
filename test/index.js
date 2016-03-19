var should = require("chai").should();
var sinon = require("sinon");
var assert = require("assert");
var Promise = require("../lib/main.js");

describe("Setup", function(){
    describe("Promise instantiation", function(){
        it("should have a .then method", function(){
            var promise = new Promise(function(resolve, reject){
                resolve();
            });

            promise.should.have.property("then");
            (promise.then).should.be.a("function");
        });
    });
});

describe("Usage", function(){
    function someAsyncFunction() {
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                var value = 42;
                resolve(value);
            }, 100);
        });
    };

    describe("Asynchronous value capture", function(){
        // set up clock
        var clock;
        before(function() {
            clock = sinon.useFakeTimers();
        });
        after(function() {
            clock.restore();
        });

        // spy on callback function (doubler) that will be fed to .then
        var doubleVal = function(val){
            return val*2;
        };
        var callback = sinon.spy(doubleVal);

        it("should wait until asynchronous operation completion to call provided callback", function(){
            someAsyncFunction()
                .then(callback);
            clock.tick(99);
            assert(callback.notCalled);
            clock.tick(2);
            assert(callback.returned(84));
        });
    });
});
