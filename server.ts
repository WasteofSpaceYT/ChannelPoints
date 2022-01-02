import * as mongoose from "mongoose";
import * as http from "http";
import * as fs from "fs";
const port = 3000;
const host = "localhost";
let balances = fs.readFileSync("balances.json");

function redeem(user: string, amount: number){
    //@ts-ignore
    let balance = JSON.parse(balances);
    if(balance[user] == undefined){
        balance[user] = 0;
    }
    balance[user] = balance[user] + amount;
    fs.writeFileSync("./balances.json", JSON.stringify(balance));
}
function reward(user: string, amount: number){
    //@ts-ignore
    var balance = JSON.parse(balances);
    if(balance[user] == undefined){
        balance[user] = 0;
    }
    balance[user] = balance[user] + amount;
    fs.writeFileSync("./balances.json", JSON.stringify(balance));
}

function getBalance(user: string){
    //@ts-ignore
    var balance = JSON.parse(balances);
    if(balance[user] == undefined){
        balance[user] = 0;
    }
    return balance[user];
}

function calcNextRedeem(user: string) {
    // calculate 15 minutes after lastRedeemed
    var now = new Date();
    var nowtime = now.getTime();
    let newTime = nowtime + 900000
    //@ts-ignore
    var balancesheet = JSON.parse(balances);
    balancesheet[`${user}lastRedeemed`] = nowtime;
    balancesheet[`${user}nextRedeem`] = newTime;
    fs.writeFileSync("./balances.json", JSON.stringify(balancesheet));
}

function setBalance(user: string, newbalance: number){
    //@ts-ignore
    var balance = JSON.parse(balances);
    if(balance[user] == undefined){
        balance[user] = newbalance;
    }
    balance[user] = 0
    fs.writeFileSync("./balances.json", JSON.stringify(balance));
}
const requestListener = function(req: any, res: any) {
    if (req.url === "/twitch") {
        const requestBody: any = [];
        req.on('data', (chunks: any) => {
            requestBody.push(chunks);
        });
        req.on('end', () => {
            const parsedData = Buffer.concat(requestBody).toString();
            console.log(parsedData);
            var dataparts = parsedData.split("&");
            var myObject: any = {};
            for (var i in dataparts){
                var parts = dataparts[i].split("=");
                //@ts-ignore
                myObject[`${parts[0]}`] = parts[1];
            }
            var theData = myObject; 
            console.log(theData)
            console.log("here" + theData.type)
            if(theData.type == "redemption"){
                //@ts-ignore
                if(JSON.parse(balances)[`${theData.user}lastRedeemed`] == undefined || JSON.parse(balances)[`${theData.user}nextRedeem`] > new Date().getTime()){
                redeem(theData.user, theData.amount);
                calcNextRedeem(theData.user);
                res.write("Success");
                console.log(res)
                return res.end();
                }
                else{
                    res.write("Error");
                    return res.end();
                }
            }
            if(theData.type == "reward"){
                //@ts-ignore
                let balance = JSON.parse(balances)
                if(theData.amount > balance[theData.user])
                res.write("Not enough watts")
                return res.end();
            }
            if(theData.type == "getBalance"){
                res.write(getBalance(theData.user).toString());
                return res.end();
            }
            if(theData.type == "nullbalance"){
                setBalance(theData.user, 0);
                return res.end();
            }
        });
    }
};
const serverr = http.createServer(requestListener);
serverr.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});