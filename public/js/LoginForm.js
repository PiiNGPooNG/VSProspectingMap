export class LoginForm {
    #form;
    constructor(form) {
        this.#form = form;
        this.#form.addEventListener('submit', this.#submitHandler.bind(this));
    }

    async #submitHandler(e) {
        e.preventDefault();
        const formData = new FormData(this.#form);
        const options = {
            method: 'POST',
            body: formData
        }
        const response = await fetch(this.#form.action, options);
        const json = await response.json();
        if (json.success) {
            window.location.reload();
        }
    }
}