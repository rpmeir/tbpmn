
// modeler instance
const bpmnModeler = new BpmnJS({
    container: '#canvas',
    keyboard: {
        bindTo: window
    }
});

async function createDiagram() {
    try {
        const result = await bpmnModeler.createDiagram();
        const { warnings } = result;
        console.log(warnings);
    } catch (err) {
        console.log(err.message, err.warnings);
    }
}

$('#create-button').click(createDiagram);

async function openDiagram(bpmnXML) {
    try {
        const result = await bpmnModeler.importXML(bpmnXML);
        const { warnings } = result;
        console.log(warnings);
    } catch (err) {
        console.log(err.message, err.warnings);
    }
}

const fileElem = document.getElementById("fileElem");
fileElem.addEventListener("change", function (e) {
    const [file] = this.files;
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        openDiagram(reader.result);
    });

    if (file) {
        reader.readAsText(file);
    }
}, false);

const fileSelect = document.getElementById("open-button");
fileSelect.addEventListener("click", async () => {
    if (fileElem) {
        await fileElem.click();
    }
}, false);


/**
* Save diagram contents and print them to the console.
*/
async function exportDiagram() {
    const options = { format: true };
    try {
        const result = await bpmnModeler.saveXML(options);
        const { xml } = result;
        console.log(xml);
    } catch (err) {
        console.log(err);
    }
}

// wire save button
$('#save-button').click(exportDiagram);

async function saveSVG() {
    const options = { format: true };
    try {
        const result = await bpmnModeler.saveSVG(options);
        const { svg } = result;
        console.log(svg);
    } catch (err) {
        console.log(err);
    }
}

$('#save-svg').click(saveSVG);


// load external diagram file via AJAX and open it
// $.get(diagramUrl, openDiagram, 'text');