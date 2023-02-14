export class SampleForm {
    #sampleForm;
    #sampleFormInputs = {};
    #oreForm;
    #oreFormInputs = {};
    #oreTemplate;
    #map;
    constructor(sampleForm, oreForm, oreTemplate, map) {
        this.#sampleForm = sampleForm;
        this.#sampleFormInputs = {
            ores: this.#sampleForm.querySelector('.newSampleOres'),
            x: this.#sampleForm.querySelector('#sampleX'),
            y: this.#sampleForm.querySelector('#sampleY')
        };
        this.#oreForm = oreForm;
        this.#oreFormInputs = { // inputs belong to oreForm, but are placed within sampleForm
            ore: this.#sampleForm.querySelector('select#ore'),
            density: this.#sampleForm.querySelector('select#density')
        }
        this.#oreTemplate = oreTemplate;
        this.#map = map;
        this.#oreForm.addEventListener('submit', this.#handleOreSubmit.bind(this));
        this.#sampleForm.addEventListener('submit', this.#handleSampleSubmit.bind(this));
    }

    async #handleSampleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.#sampleForm);
        formData.append('x', formData.get('sampleX'));
        formData.delete('sampleX');
        formData.append('y', formData.get('sampleY'));
        formData.delete('sampleY');
        console.log(formData);
        const options = {
            method: 'POST',
            body: formData
        }
        const response = await fetch(this.#sampleForm.action, options);
        const json = await response.json();
        if (json.success) {
            this.#sampleFormInputs.ores.innerHTML = '';
            this.#sampleFormInputs.x.value = '';
            this.#sampleFormInputs.y.value = '';
            this.#map.reloadRegionAt(formData.get('x'), formData.get('y'));
        }
    }

    #handleOreSubmit(e) {
        e.preventDefault();
        const oreSelect = this.#oreFormInputs.ore;
        const densitySelect = this.#oreFormInputs.density;
        const ore = oreSelect.value;
        if (this.#sampleForm.querySelector('[data-ore="' + ore + '"]') == null) {
            const oreName = oreSelect.options[oreSelect.selectedIndex].text;
            const density = densitySelect.value;
            const densityName = densitySelect.options[densitySelect.selectedIndex].text;

            const newOre = this.#oreTemplate.content.firstElementChild.cloneNode(true);
            newOre.dataset.ore = ore;

            const span = newOre.querySelector('span');
            span.innerText = oreName + ', ' + densityName;

            const input = newOre.querySelector('input');
            input.name = ore;
            input.value = densitySelect.value;

            this.#sampleForm.querySelector('.newSampleOres').append(newOre);
            oreSelect.focus();
        }
    }
}