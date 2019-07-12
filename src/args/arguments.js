const path = require("path");

module.exports = class Arguments {
    constructor(args = []) {
        this.totalImages = 5;
        this.targetFolder = './';
        this.width = 100;
        this.height = 100;
        this.format = "image/jpeg";
        this.imageNameTemplate = 'random-image-{width}-{height}-{serial}';
        this.helpOnly = false;
        try {
            this.processArguments(args);
        }
        catch(error) {
            console.error(`Could not start the application because of: ${error}`);
            this.help();
            throw error;
        }
    }

    help() {
        console.log(`
Please provide a properly formatted set of arguments:

node random [total:]<number of images> [width:<width>] [height:<height>] [format:image/jpeg|image/png] [template:<template string>] [output:<path>]

- width/height limit range is 1-10000 pixels; all values will be truncated to nearest min/max
- By default, the generator will produce 5 100x100px JPG images in the work folder.
- By default, the image template is 'random-image-{width}-{height}-{serial}', where each token is replaced by the corresponding value.
        `);
    }

    /**
     * @private
     * @param {Array<string>} args 
     */
    processArguments(args) {
        let unknownArguments = null;
        if (args.length < 2) return;
        for (let i = 2; i < args.length; i++) {
            const arg = args[i];
            const argParts = arg.split(":",2);
            switch (argParts[0].toLowerCase()) {
                case "npm":
                case "random":
                    // Nothing to do here
                    break;
                case "width":
                    this.width = Math.min(10000, Math.max(1, parseInt(argParts[1],10)));
                    break;
                case "height":
                    this.height = Math.min(10000, Math.max(1, parseInt(argParts[1],10)));
                    break;
                case "format":
                    const format = argParts[1].toLowerCase();
                    if (format !== "image/jpeg" && format !== "image/png") {
                        throw new Error(`Invalid format: ${format}`);
                    }
                    this.format = format;
                    break;
                case "total":
                    this.totalImages = Math.max(0,parseInt(argParts[1],10));
                    break;
                case "target":
                case "output":
                    this.targetFolder = path.normalize(argParts[1]);
                    console.log(this.targetFolder);
                    break;
                case "template":
                    this.imageNameTemplate = argParts[1];
                    break;
                case "help":
                case "?":
                case "/?":
                case "-h":
                case "--help":
                    this.help();
                    this.helpOnly = true;
                    break;
                default:
                    const argAsInt = parseInt(argParts[0],10);
                    if (!isNaN(argAsInt) && argAsInt > 0) {
                        this.totalImages = argAsInt;
                    } else {
                        unknownArguments = arg;
                        break;
                    }
            }
        }
        if (unknownArguments) {
            throw new Error(`Unknown arguments provided: ${unknownArguments}`);
        }
    }
}