const init = function(configs, functionNames) {
    let defaults = {
        ThrowErr : ThrowError,
        Parse : ParseError,
        ErrorRes : ErrorResponse,
        SuccessRes : SuccessResponse,
        Catcher : CatchError
    };

    if(functionNames !== undefined){
        assign_to_global(defaults, functionNames);
    }
    else if(configs === undefined) {
        let configs = {};
        configs.global = true;
        assign_to_global(defaults);
    }
    else if(configs.global === undefined) {
        configs.global = true;
        assign_to_global(defaults);
    }

    else if(configs.global !== true) {
        console.log('!!! Global functions not allowed !!!');
        return null;
    }
    else if(configs.global === true && functionNames === undefined) {
        assign_to_global(defaults);
    }

    HandleUncaught(); // initializes function *** see below ***
    return module.exports;
};
module.exports.init = init;

const assign_to_global = function(functions, names){
    if(names !== undefined) {
        let keys = Object.keys(functions);
        let vals = Object.values(names);
        // Sets global function names
        for (let i = 0; i < vals.length; i++) {
            global[vals[i]] = functions[keys[i]];
        }
    }
    if(names === undefined) {
        // Sets default global function names
        TE = functions.ThrowErr;
        pe = functions.Parse;
        ReE = functions.ErrorRes;
        ReS = functions.SuccessRes;
        to = functions.Catcher;
    }
};
module.exports.assign_to_global = assign_to_global;

const ParseError = require('parse-error');//parses error so you can read error message and handle them accordingly
module.exports.ParseError = ParseError;

const CatchError = function(promise) {//global function that will help use handle promise rejections, this article talks about it http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
    return promise
        .then(data => {
        return [null, data];
}).catch(err =>
    [ParseError(err)]
);
};
module.exports.CatchError = CatchError;

const ThrowError = function(err_message, log){ // TE stands for Throw Error
    if(log === true){
        console.error(err_message);
    }

    throw new Error(err_message);
};
module.exports.ThrowError = ThrowError;

const ErrorResponse = function(res, err, code){ // Error Web Response
    if(typeof err === 'object' && typeof err.message !== 'undefined'){
        err = err.message;
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json({success:false, error: err});
};
module.exports.ErrorResponse = ErrorResponse;

const SuccessResponse = function(res, data, code){ // Success Web Response
    let send_data = {success:true};

    if(typeof data === 'object'){
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};
module.exports.SuccessResponse = SuccessResponse;

//This is here to handle all the uncaught promise rejections
const HandleUncaught = function() {
    process.on('unhandledRejection', error => {
        console.error('Uncaught Error', pe(error));
});
};
module.exports.HandleUncaught = HandleUncaught;