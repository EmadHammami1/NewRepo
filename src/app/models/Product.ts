import constants from '../helpers/constants';
import { User } from './User';
export class Product{

  private _id: string;
  private _label: string;
  private _description: string;
  private _price: number;
  private _currency: string;
  private _country: string;
  private _city: string;
  private _enabled: boolean;
  private _sold: boolean;
  private _photo: string;
  private _createdAt: Date;
  private _user: User;

  constructor(product: Product){
    this.id = product._id;
    this.label = product.label;
    this.description = product.description;
    this.price = product.price;
    this.currency = product.currency;
    this.country = product.country;
    this.city = product.city;
    this.enabled = product.enabled;
    this.sold = product.sold;
    this.photo = product.photo;
    this.user = product.user;
    this.createdAt = new Date(product.createdAt)
  }

  get id(): string{ return this._id }
  get label(): string{ return this._label }
  get description(): string{ return this._description }
  get price(): number{ return this._price }
  get currency(): string{ return this._currency }
  get country(): string{ return this._country }
  get city(): string{ return this._city }
  get enabled(): boolean{ return this._enabled }
  get sold(): boolean{ return this._sold }
  get user(): User{ return this._user }
  get photo(): string{ return this._photo }
  get createdAt(): Date{ return this._createdAt }

  set id(id: string){ this._id = id }
  set label(label: string){ this._label = label }
  set description(description: string){ this._description = description }
  set price(price: number){ this._price = price }
  set currency(currency: string){ this._currency = currency }
  set country(country: string){ this._country = country }
  set city(city: string){ this._city = city }
  set enabled(enabled: boolean){ this._enabled = enabled }
  set sold(sold: boolean){ this._sold = sold }
  set user(user: User){
    if(user){
      if(typeof user == 'string'){
        this._user = new User();
        this._user.id = user;
      }else{
        this._user = new User().initialize(user)
      }
    }
  }
  set photo(photo: string){
    this._photo = (!photo.includes(constants.DOMAIN_URL) ? constants.DOMAIN_URL : '') + photo
   }
  set createdAt(createdAt: Date){ this._createdAt = createdAt }
}
