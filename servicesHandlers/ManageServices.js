const fs = require("fs");
const path = require("path")
//read password from local file and not hardcode it in code

const password = JSON.parse(fs.readFileSync(path.join(__dirname,"localPassword.json"), "utf-8")).password;

//resolve true if active false if not
const isActive = function (service) {
    return new Promise((resolve, reject) => {
        const {
            exec
        } = require('child_process');
        const restartServCommand = `systemctl is-active `
        const cmd = restartServCommand + service;
        try {
            exec(cmd, (error, stdout, stderr) => {
                if (error && stderr) {
                    console.error(stderr);
                    console.error(error);
                if (stdout.trim() === "active") {
                    resolve(true);
                }else if(stdout !="active"){
                    resolve(false);
                }
                }
            })
        } catch (error) {
            console.error(error);
            reject("error");
        }
    })
}

//resolve true if executed properly and reject with error if not
const handleService = function(action, service){
    return new Promise((resolve, reject) => {
    const {
        exec
    } = require('child_process');
    const restartServCommand = `echo ${password} | sudo -S systemctl ${action} ${service} `
    const cmd = restartServCommand + service;
    try {
        exec(cmd, (error, stdout, stderr) => {
            if (error && stderr) {
                console.error(stderr);
                console.error(error);
                resolve(false)
            }else{
                resolve(true)
            }
        })
    } catch (error) {
        console.error(error);
        reject("error");
    }
    })
}





module.exports.handleService = handleService
module.exports.isActive = isActive


