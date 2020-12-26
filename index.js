#!/usr/bin/env node
const figlet = require('figlet');
const chalk = require('chalk');
const request = require('request');
const cheerio = require('cheerio');
var pjson = require('./package.json');


console.clear();
console.log(chalk.magenta('JioFi Status'));
console.log(chalk.green(pjson.version));

setTimeout(showJiofiStatus,3000);

// Handle ctrl+c command
process.on('SIGINT',()=>{
    console.log(chalk.greenBright('Thank you for using jiofistatus.'));
    process.exit(0);
})


// Developed for JioFi 4, not sure if other models use same webpage to display info
function showJiofiStatus(){
    request('http://jiofi.local.html',(error,response,html)=>{
        console.clear();
        if(error){
            if(error.code==='ENOTFOUND'){
                console.log(chalk.red("Unable to get status, Are you connected to JioFi ?"));
            }
            else{
                console.log(chalk.red(error.message));
            }
            setTimeout(showJiofiStatus,10000);
        }
        else if(!response){
            console.log("No response, are you connected to JioFi?");
            setTimeout(showJiofiStatus,10000);
        }
        else if(response.statusCode==200){
            try{
                //console.log(html); Whole html page source
                const $ = cheerio.load(html);

                // Get the noOfClient value
                const noOfClient = $('#noOfClient').attr().value;
                console.log(chalk.bgCyanBright.black("DEVICES CONNECTED: "+noOfClient+" "));

                //Get the batterystatus value
                const batteryStatus = $('#batterystatus').attr().value; //A string type "charging or discharging"

                if(batteryStatus=='Charging' || batteryStatus=='Fully Charged'){
                    console.log("STATUS:"+chalk.bold.greenBright(batteryStatus)); 
                }
                else{
                    console.log("STATUS:"+chalk.bold.yellowBright(batteryStatus)); 
                }

                //Get the batterylevel value
                const batteryLevel = $('#batterylevel').attr().value; // Strings like 10%, 20%

                //Store Integer version of the battery level
                const batteryLevelInt = parseInt(batteryLevel,10);

                if(batteryLevelInt>=50){
                    console.log(chalk.bold.greenBright(figlet.textSync(batteryLevel,{horizontalLayout:'full'})));
                }
                else if(batteryLevelInt>=20){
                    console.log(chalk.bold.blueBright(figlet.textSync(batteryLevel,{horizontalLayout:'full'})));
                }
                else{
                    console.log(chalk.bold.red(figlet.textSync(batteryLevel,{horizontalLayout:'full'})));
                }
                setTimeout(showJiofiStatus,60000);
                }
            catch(err){
                console.log(chalk.red(err.message));
                // Retry
                setTimeout(showJiofiStatus,10000);
            }
        }
        else{
            console.log(chalk.red('Unable to reach http://jiofi.local.html, should receive 200 status'));
            setTimeout(showJiofiStatus,10000);
        }
        
    });
};
