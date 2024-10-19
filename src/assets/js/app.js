let currentFileHandle;

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
const modeling = modeler.get('modeling');
const currentElement = { element: null };

async function newDiagram() {
    try {
        const xml = `
            <?xml version="1.0" encoding="UTF-8"?>
            <bpmn:definitions
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                id="Definitions_1"
                targetNamespace="http://bpmn.io/schema/bpmn"
                exporter="bpmn-js (https://demo.bpmn.io)"
                exporterVersion="17.11.1"
            >
                <bpmn:process id="Process_1" name="Process_1" isExecutable="false" />
                <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
                </bpmndi:BPMNDiagram>
            </bpmn:definitions>
        `;
        importDiagram(xml);
    } catch (err) {
        console.log(err.message, err.warnings);
    }
}

async function load() {
    try {
        [currentFileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'BPMN', accept: { 'text/xml': ['.bpmn'] } }],
            excludeAcceptAllOption: true
        });
        const file = await currentFileHandle.getFile();
        const xml = await file.text();
        try {
            await importDiagram(xml);
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err);
    }
}

async function importDiagram(bpmnXML) {
    try {
        await modeler.importXML(bpmnXML);
        let canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');
    } catch (err) {
        console.error(err);
    }
}

async function saveAs() {
    try {
        const { xml } = await modeler.saveXML({ format: true });
        const fileHandle = await window.showSaveFilePicker({
            types: [{ description: 'BPMN', accept: { 'text/xml': ['.bpmn'] } }],
            excludeAcceptAllOption: true
        });
        const writable = await fileHandle.createWritable();
        await writable.write(xml);
        await writable.close();
    } catch (err) {
        console.error(err);
    }
}

async function save() {
    if (!currentFileHandle) {
        console.log('No file is currently opened');
        return;
    }
    try {
        const { xml } = await modeler.saveXML({ format: true });
        const writable = await currentFileHandle.createWritable();
        await writable.write(xml);
        await writable.close();
    } catch (err) {
        console.error(err);
    }
}

function updateName() {
    try {
        const propertyName = 'name';
        const newValue = document.getElementById(propertyName).value;
        if(newValue != null && currentElement.element != null){
            let input = document.getElementById(propertyName);
            commandStack.execute('element.updateProperties', {
                element: currentElement.element,
                properties: {
                    name: newValue
                }
            });
            input.value = newValue;
        }
        save();
        cancelEditName();
    } catch (err) {
        console.error(err);
    }
}

function updateId() {
    try {
        const propertyName = 'id';
        const newValue = document.getElementById(propertyName).value;
        if(newValue != null && currentElement.element != null){
            let input = document.getElementById(propertyName);
            commandStack.execute('element.updateProperties', {
                element: currentElement.element,
                properties: {
                    id: newValue
                }
            });
            input.value = newValue;
        }
        save();
        cancelEditId();
    } catch (err) {
        console.error(err);
    }
}

function updateColors() {
    try {
        const fillColor = document.getElementById('colorFill').value;
        const strokeColor = document.getElementById('colorStroke').value;
        if(currentElement.element != null){
            modeling.setColor([currentElement.element], {
                stroke: strokeColor,
                fill: fillColor
            });
        }
        save();
    } catch (err) {
        console.error(err);
    }
}

eventBus.on('element.click', function (e){
    const elementId = e.element.id;
    // console.log(e.element)
    // console.log('element.click', 'on', `id: ${elementId}`);
    if(elementId != null) {
        currentElement.element = e.element;
        let inputId = document.getElementById('id');
        inputId.value = e.element.id;
        let inputName = document.getElementById('name');
        inputName.value = e.element.di.bpmnElement.name || '';
        let fillColorInput = document.getElementById('colorFill');
        fillColorInput.value = e.element.di.fill || '#ffffff';
        let strokeColorInput = document.getElementById('colorStroke');
        strokeColorInput.value = e.element.di.stroke || '#ffffff';
    }
});

function editName() {
    document.getElementById('editName').style.display = 'none';
    document.getElementById('saveName').style.display = 'inline';
    document.getElementById('cancelName').style.display = 'inline';
    document.getElementById('name').disabled = false;
    document.getElementById('name').focus();
}

function cancelEditName() {
    document.getElementById('editName').style.display = 'inline';
    document.getElementById('saveName').style.display = 'none';
    document.getElementById('cancelName').style.display = 'none';
    document.getElementById('name').disabled = true;
}

function editId() {
    document.getElementById('editId').style.display = 'none';
    document.getElementById('saveId').style.display = 'inline';
    document.getElementById('cancelId').style.display = 'inline';
    document.getElementById('id').disabled = false;
    document.getElementById('id').focus();
}

function cancelEditId() {
    document.getElementById('editId').style.display = 'inline';
    document.getElementById('saveId').style.display = 'none';
    document.getElementById('cancelId').style.display = 'none';
    document.getElementById('id').disabled = true;
}

document.getElementById('new').addEventListener('click', newDiagram);
document.getElementById('save').addEventListener('click', save);
document.getElementById('save-as').addEventListener('click', saveAs);
document.getElementById('open').addEventListener('click', load);

document.getElementById('editId').addEventListener('click', editId);
document.getElementById('cancelId').addEventListener('click', cancelEditId);
document.getElementById('saveId').addEventListener('click', updateId);

document.getElementById('editName').addEventListener('click', editName);
document.getElementById('cancelName').addEventListener('click', cancelEditName);
document.getElementById('saveName').addEventListener('click', updateName);

document.getElementById('colorFill').addEventListener('change', updateColors);
document.getElementById('colorStroke').addEventListener('change', updateColors);

newDiagram();
