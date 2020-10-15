import { Identifiers } from '@angular/compiler';

export class OpenCard {
    public id: number;
    public open: boolean;

    constructor(id: number, open: boolean = false) {
        this.id = id;
        this.open = open;
    }

    public changeOpen() {
        this.open = !this.open;
    }
}
