var should = require("chai").should();
var Promise = require("../lib/main.js");

describe("Basic functionality", function(){
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
