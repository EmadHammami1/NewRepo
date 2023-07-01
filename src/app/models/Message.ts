import constants from '../helpers/constants';

export class Message{
  private _id: string;
  private _from: string;
  private _to: string;
  private _text: string;
  private _state: string;
  private _createdAt: Date;
  private _image: string;

  constructor(){
  }

  initialize(message: Message){
    this.id = message._id;
    this.from = message.from;
    this.to = message.to
    this.text = message.text;
    this.createdAt = new Date(message.createdAt);
    this.image = message.image;
    this.state = message.state;
    return this;
  }

  get id(): string {return this._id};
  get from(): string {return this._from};
  get to(): string {return this._to};
  get text(): string {return this._text};
  get state(): string {return this._state};
  get createdAt(): Date {return this._createdAt};
  get image(): string {return this._image};

  set id(id: string) {this._id = id};
  set from(from: string) {this._from = from};
  set to(to: string) {this._to = to};
  set text(text: string) {this._text = text};
  set state(state: string) {this._state = state};
  set createdAt(createdAt: Date) {this._createdAt = createdAt};
  set image(image: string) {
    if(!image || image == 'undefined') this._image = null;
    else this._image = (!image.includes(constants.DOMAIN_URL) ? constants.DOMAIN_URL : '') + image
  };

  isMine(id): boolean{
    return this.from === id
  }
}
