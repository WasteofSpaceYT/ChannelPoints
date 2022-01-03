"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var fs = __importStar(require("fs"));
var port = 3000;
var host = "localhost";
var balances = fs.readFileSync("balances.json");
function redeem(user, amount) {
    //@ts-ignore
    var balance = JSON.parse(balances);
    if (balance[user] == undefined) {
        balance[user] = 0;
    }
    balance[user] = balance[user] + amount;
    fs.writeFileSync("./balances.json", JSON.stringify(balance));
}
function reward(user, amount) {
    //@ts-ignore
    var balance = JSON.parse(balances);
    if (balance[user] == undefined) {
        balance[user] = 0;
    }
    balance[user] = balance[user] + amount;
    fs.writeFileSync("./balances.json", JSON.stringify(balance));
}
function getBalance(user) {
    //@ts-ignore
    var balance = JSON.parse(balances);
    if (balance[user] == undefined) {
        balance[user] = 0;
    }
    return balance[user];
}
function calcNextRedeem(user) {
    // calculate 15 minutes after lastRedeemed
    var now = new Date();
    var nowtime = now.getTime();
    var newTime = nowtime + 900000;
    //@ts-ignore
    var balancesheet = JSON.parse(balances);
    balancesheet[user + "lastRedeemed"] = nowtime;
    balancesheet[user + "nextRedeem"] = newTime;
    fs.writeFileSync("./balances.json", JSON.stringify(balancesheet));
}
function setBalance(user, newbalance) {
    //@ts-ignore
    var balance = JSON.parse(balances);
    if (balance[user] == undefined) {
        balance[user] = newbalance;
    }
    balance[user] = 0;
    fs.writeFileSync("./balances.json", JSON.stringify(balance));
}
var requestListener = function (req, res) {
    if (req.url === "/twitch") {
        var requestBody_1 = [];
        req.on('data', function (chunks) {
            requestBody_1.push(chunks);
        });
        req.on('end', function () {
            var parsedData = Buffer.concat(requestBody_1).toString();
            console.log(parsedData);
            var dataparts = parsedData.split("&");
            var myObject = {};
            for (var i in dataparts) {
                var parts = dataparts[i].split("=");
                //@ts-ignore
                myObject["" + parts[0]] = parts[1];
            }
            var theData = myObject;
            console.log(theData);
            console.log("here" + theData.type);
            if (theData.type == "redemption") {
                //@ts-ignore
                if (JSON.parse(balances)[theData.user + "lastRedeemed"] == undefined || JSON.parse(balances)[theData.user + "nextRedeem"] > new Date().getTime()) {
                    redeem(theData.user, theData.amount);
                    calcNextRedeem(theData.user);
                    res.write("Success");
                    console.log(res);
                    return res.end();
                }
                else {
                    res.write("Error");
                    return res.end();
                }
            }
            if (theData.type == "reward") {
                //@ts-ignore
                var balance = JSON.parse(balances);
                if (theData.amount > balance[theData.user])
                    res.write("Not enough watts");
                return res.end();
            }
            if (theData.type == "getBalance") {
                res.write(getBalance(theData.user).toString());
                return res.end();
            }
            if (theData.type == "nullbalance") {
                setBalance(theData.user, 0);
                return res.end();
            }
        });
    }
};
var serverr = http.createServer(requestListener);
serverr.listen(port, host, function () {
    console.log("Server is running on http://" + host + ":" + port);
});
