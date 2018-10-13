const driveHandle = require("./driveHandle")
const service = require("./servicesHandlers/ManageServices")
const fileManage = require("./filesHandles/fileManage")

const TripleZero = "TripleZero.service"
const TripleZeroDev = "TripleZero2.service"

//todo. stop restarting app if there are pending downloads 
//propably emit an event with true false values to start stop timer and extend
console.log("Auto deployment is active");
setInterval(driveHandle.start, 1000*60*10)

var stopServices = function () {
    const cmd = "stop"
    service.handleService(cmd, TripleZero)
    service.handleService(cmd, TripleZeroDev)
}

var startServices = function () {
    const cmd = "restart"
    service.handleService(cmd, TripleZero)
    service.handleService(cmd, TripleZeroDev)
}

driveHandle.status.on("newFiles", () => {
    console.log("Got new files");
    console.log("Stopping Services")
    stopServices();
    if (!service.isActive(TripleZero) || !service.isActive(TripleZeroDev)) {
        console.log("Services are still active. Retrying...")
        setTimeout(() => {
            stopServices(),
            2000
        })
    }else{
        console.log("Starting files copy")
        fileManage.handleFiles();
    }
})

fileManage.status.on("Finished", () => {
    console.log("Starting services")
    startServices();
    //todo. check status and if failed to start then fallback to previous version
})
