export class Card {
    public id: number;
    public collapsedPhoto: string;
    public uncollapsedPhoto: string;
    public description: string;
    public vote: number;
    public open: boolean;

    constructor(newCard: Card) {
        this.id = newCard.id;
        this.collapsedPhoto = newCard.collapsedPhoto;
        this.uncollapsedPhoto = newCard.uncollapsedPhoto;
        this.description = newCard.description;
        this.vote = newCard.vote;
        this.open = false;
    }
}
