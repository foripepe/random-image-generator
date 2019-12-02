const Generators = require("../common/image-generators");
const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
const Arguments = require("../args/arguments");
const generators = new Generators(createCanvas);

window.addEventListener("DOMContentLoaded", () => {
    initUI(generators);
})

/**
 * @param {Generators} generators 
 */
function initUI(generators) {
    // Setup collapse handler for options
    const qs = (selector) => document.querySelector(selector);
    const qsa = (selector) => document.querySelectorAll(selector);
    let optionsOpen = false;
    const optionsHeader = qs("#optionsHeader");
    const optionsBlock = qs("#optionsCollapsible");
    optionsHeader.addEventListener("click", () => {
        const action = optionsOpen ? DOMTokenList.prototype.add : DOMTokenList.prototype.remove;
        action.call(optionsHeader.classList, "collapsed");
        action.call(optionsBlock.classList, "hidden");
        optionsOpen = !optionsOpen;
    });
    // Setup iterations handles
    const iterationsAutoCheck = qs("#iterationsAuto");
    const iterationsNumber = qs("#iterations");
    iterationsAutoCheck.addEventListener("change", () => {
        iterationsNumber.disabled = iterationsAutoCheck.checked;
    });
    // Setup list of generators and interaction
    const genList = qs("#generatorsList");
    const selectedGenerators = new Set();
    const generatorCheckboxes = [];
    generators.names.forEach(name => {
        const genControl = document.createElement("input");
        genControl.type = "checkbox";
        genControl.id = `cb-generator-${name}`;
        genControl.addEventListener("change", () => {
            if (genControl.checked) selectedGenerators.add(name);
            else selectedGenerators.delete(name);
            if (selectedGenerators.size) {
                qs("#specificGenerators").checked = true;
            } else {
                qs("#allGenerators").checked = true;
            }
        });
        const genLabel = document.createElement("label");
        genLabel.htmlFor = genControl.id;
        genLabel.innerHTML = name;
        const wrapper = document.createElement("span");
        wrapper.appendChild(genControl);
        wrapper.appendChild(genLabel);
        genList.appendChild(wrapper);
        generatorCheckboxes.push(genControl);
    });
    qs("#specificGenerators").addEventListener("change", () => {
        if (selectedGenerators.size === 0) {
            // Autoselect all generators
            generatorCheckboxes.forEach(cb => cb.checked = true);
        }
    });
    qsa("#allGenerators, #randomGenerator").forEach(control => control.addEventListener("change", () => {
        generatorCheckboxes.forEach(cb => cb.checked = false);
    }));
    // Generare action
    qs("#generate").addEventListener("click", () => {
        // Gather information
        const runtime = new Arguments(generators.names);
        runtime.width = parseInt(qs("#sizeWidth").value, 10);
        runtime.height = parseInt(qs("#sizeHeight").value, 10);
        runtime.iterations = qs("#iterationsAuto").checked ? -1 : parseInt(qs("#iterations").value, 10);
        runtime.totalImages = parseInt(qs("#amount").value, 10);
        // Collect the generators to use for this iteration
        const isRandom = qs("#randomGenerator").checked;
        let genNames = [];
        if (selectedGenerators.size) {
            selectedGenerators.forEach(sg => genNames.push(sg));
        } else {
            genNames = generators.names;
        }
        const genClasses = generators.namesToClasses(genNames);
        // Discard previous items
        qs("#sctResult").innerHTML = "";
        // Generate
        for (let i = 0; i < runtime.totalImages; i++) {
            const generator = isRandom ?
                generators.createRandomGeneratorInstance(runtime) : generators.createMultiGenerator(runtime, genClasses);
            generator.generate();
            qs("#sctResult").appendChild(generator.canvas);
        }
    })
}