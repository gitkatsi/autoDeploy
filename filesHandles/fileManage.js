const fsExtra = require("fs-extra")
const fs = require("fs")
const path = require("path")
const events = require("events")
var eventEmitter = new events.EventEmitter();

const downloads = path.join(__dirname, "..", "downloads")
const downloadsRemove = path.join(__dirname, "..", "downloads", "JsonAppSettings");

const currentBot = path.join(__dirname, "..", "..", "bots", "bot")
const currentBotDev = path.join(__dirname, "..", "..", "bots", "bot2")
const destinationBackup = path.join(__dirname, "..", "..", "bots", "autoDeploy", "bot")
const destinationDevBackup = path.join(__dirname, "..", "..", "bots", "autoDeploy", "bot2")
const confBotFiles = path.join(__dirname, "..", "downloads", "configBot.json")
const confRepoFiles = path.join(__dirname, "..", "downloads", "configRepository.json");
const confBotFilesDest = path.join(__dirname, "..", "..", "bots", "bot", "JsonAppSettings", "configBot.json")
const confRepoFilesDest = path.join(__dirname, "..", "..", "bots", "bot", "JsonAppSettings", "configRepository.json");

const handleFiles = async function () {
    await fsExtra.emptyDir(destinationBackup)
    await fsExtra.emptyDir(destinationDevBackup)
    console.log("Emptying Backup folders")
    if (await fsExtra.pathExists(downloadsRemove)) {
        fsExtra.remove(downloadsRemove)
    }
    if (fs.existsSync(confBotFiles)) {
        await fsExtra.copy(confBotFiles, confBotFilesDest);
        console.log("Copying configBot.json")
    }
    if (fs.existsSync(confRepoFiles)) {
        await fsExtra.copy(confRepoFiles, confRepoFilesDest);
        console.log("Copying configRepository.json")
    }
    await fsExtra.copy(currentBot, destinationBackup)
    console.log("Backing up Main Bot");
    await fsExtra.copy(currentBotDev, destinationDevBackup)
    console.log("Backing up Dev Bot");
    await fsExtra.copy(downloads, currentBot)
    console.log("Updating Main Bot");
    await fsExtra.copy(downloads, currentBotDev)
    console.log("Updating Dev Bot");
    await fsExtra.emptyDir(downloads)
    console.log("Clearing Temporary files");
    eventEmitter.emit("Finished")
}

module.exports.handleFiles = handleFiles;
module.exports.status = eventEmitter

//handleFiles();