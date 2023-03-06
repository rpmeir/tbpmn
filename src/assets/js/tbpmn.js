
// modeler instance
const modeler = new BpmnJS({
    container: '#canvas',
    propertiesPanel: {
        parent: '#properties'
    },
    keyboard: {
        bindTo: window
    }
});

const eventBus = modeler.get('eventBus');
const commandStack = modeler.get('commandStack');
const elementRegistry = modeler.get('elementRegistry');
const currentElement = { element: null };

var de = null;

// Create new diagram
$('#create-button').click(async () => {
    try {
        const result = await modeler.createDiagram();
        const { warnings } = result;
        if(warnings)
            console.log(warnings);
    } catch (err) {
        console.log(err.message, err.warnings);
    }
});

const openDiagram = async (bpmnXML) => {
    try {
        const result = await modeler.importXML(bpmnXML);
        const { warnings } = result;
        if(warnings)
            console.log(warnings);
    } catch (err) {
        console.error(err.message, err.warnings);
    }
};
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

// Update Id Property of selected element.
$('#edit-properties').click(() => {
    try {
        const newIdName = prompt('Informe o novo Id: ');
        if(newIdName != null && currentElement.element != null){
            let selectedElement = document.getElementById('selectedElement');
            commandStack.execute('element.updateProperties', {
                element: currentElement.element,
                properties: { id: newIdName }
            });
            selectedElement.innerText = newIdName;
        }
    } catch (err) {
        console.error(err);
    }
});

// Save diagram contents and print them to the console.
$('#console-bpmn').click(async () => {
    const options = { format: true };
    try {
        const result = await modeler.saveXML(options);
        const { xml } = result;
        console.log(xml);
    } catch (err) {
        console.error(err);
    }
});

// Console log svg
$('#console-svg').click(async () => {
    const options = { format: true };
    try {
        const result = await modeler.saveSVG(options);
        const { svg } = result;
        console.log(svg);
    } catch (err) {
        console.error( err);
    }
});

eventBus.on('element.click', function (e){
    const elementId = e.element.id;
    console.log('element.click', 'on', e.element.id);
    if(elementId != null) {
        currentElement.element = e.element;
        let selectedElement = document.getElementById('selectedElement');
        selectedElement.innerText = e.element.id;
    }
});

// load external diagram file via AJAX and open it
// $.get(diagramUrl, openDiagram, 'text');
