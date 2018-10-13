const fs = require("fs-extra")
const path = require("path")
const events = require("events")
var eventEmitter = new events.EventEmitter();

const downloads = path.join(__dirname,"..","downloads")



const currentBot = path.join(__dirname, "..", "..", "bots", "bot")
const currentBotDev = path.join(__dirname, "..", "..", "bots", "bot2")
const destinationBackup = path.join(__dirname, "..", "..", "bots", "TripleZeroBackup", "bot")
const destinationDevBackup = path.join(__dirname, "..", "..", "bots", "TripleZeroBackup", "bot2")

const handleFiles = async function(){
    await fs.emptyDir(destinationBackup)
    await fs.emptyDir(destinationDevBackup)
    await fs.copy(currentBot, destinationBackup)
    await fs.copy(currentBotDev, destinationDevBackup)
    await fs.copy(downloads, currentBot)
    await fs.copy(downloads, currentBotDev)
    await fs.emptyDir(downloads)
    eventEmitter.emit("Finished")
}

module.exports.handleFiles = handleFiles;
module.exports.status = eventEmitter