import constants from '../helpers/constants';
import { User } from './User';
export class Channel{

  private _id: string;
  private _name: string;
  private _description: string;
  private _approved: boolean;
  private _photo: string;
  private _createdAt: Date;
  private _user: User;

  private _followers: string[];

  constructor(){
  }

  initialize(channel: Channel){
    this.id = channel._id;
    this.name = channel.name;
    this.description = channel.description;
    this.approved = channel.approved;
    this.photo = channel.photo;

    this.user = channel.user;

    this.createdAt = new Date(channel.createdAt);

    this.followers = channel.followers;

    return this;
  }

  get id(): string{ return this._id }
  get name(): string{ return this._name }
  get description(): string{ return this._description }
  get approved(): boolean{ return this._approved }
  get user(): User{ return this._user }
  get photo(): string{ return this._photo }
  get createdAt(): Date{ return this._createdAt }

  get followers(): string[]{ return this._followers }

  set id(id: string){ this._id = id }
  set name(name: string){ this._name = name }
  set description(description: string){ this._description = description }
  set approved(approved: boolean){ this._approved = approved }

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

  set followers(followers: string[]){ this._followers = followers }

  followedBy(id: string): boolean{
    return this.followers.includes(id);
  }

  toObject(){
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
      approved: this.approved,
      photo: this.photo,
      createdAt: this.createdAt,
      user: this.user.toObjeect(),
      followers: this.followers
    }
  }
}
