export class Card {
    public id: number;
    public collapsed_photo: string;
    public uncollapsed_photo: string;
    public description: string;
    public vote: number;
    public open: boolean;

    constructor(newCard: Card) {
        this.id = newCard.id;
        this.collapsed_photo = newCard.collapsed_photo;
        this.uncollapsed_photo = newCard.uncollapsed_photo;
        this.description = newCard.description;
        this.vote = newCard.vote;
        this.open = false;
    }
}
