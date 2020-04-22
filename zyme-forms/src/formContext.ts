import { Form } from './formTypes';

interface FormContextOptions {
    form(): Form<any>;
    submit(): Promise<void>;
}

export class FormContext {
    constructor(private readonly options: FormContextOptions) {}

    public get form() {
        return this.options.form();
    }

    public submit() {
        return this.options.submit();
    }
}
