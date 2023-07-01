import { Router } from '@angular/router';
import { HTTP } from '@ionic-native/http/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DataService } from './data.service';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserService extends DataService {

  constructor(nativeStorage: NativeStorage, http: HTTP, router: Router, platform: Platform) {
    super('user', nativeStorage, http, router, platform)
  }

  update(data){
    return this.sendRequest({
      method: 'put',
      url: '',
      data
    })
  }

  updateAvatar(id: string, data){
    return this.sendRequest({
      method: 'put',
      url: '/avatar',
      data,
      serializer: 'multipart'
    })
  }

  getUsers(page: number, options: any){
    return this.sendRequest({
      method: 'get',
      url: '/users',
      data: {page: page.toString(), ...options}
    });
  }

  follow(id: string){
    return this.sendRequest({
      method: 'post',
      url: '/follow/' + id
    });
  }

  getUserProfile(id: string){
    return this.sendRequest({
      method: 'get',
      url: '/profile/' + id
    })
  }

  getFriends(page: number){
    return this.sendRequest({
      method: 'get',
      url: '/friends',
      data: {page: page.toString()}
    })
  }

  removeFriendship(id: string){
    return this.sendRequest({
      method: 'post',
      url: '/friends/remove/' + id
    })
  }

  block(id: string){
    return this.sendRequest({
      method: 'post',
      url: '/' + id + '/block'
    })
  }

  report(id: string, message: string){
    return this.sendRequest({
      method: 'post',
      url: '/' + id + '/report',
      data: {message}
    })
  }

  updateEmail(email: string){
    console.log(email);

    return this.sendRequest({
      method: 'put',
      url: '/email',
      data: {email}
    })
  }

  updatePassword(data: any){
    return this.sendRequest({
      method: 'put',
      url: '/password',
      data: data
    })
  }

  updateRandomVisibility(visible: boolean){
    return this.sendRequest({
      method: 'put',
      url: '/randomVisibility',
      data: {visible}
    })
  }

  updateAgeVisibility(visible: boolean){
    return this.sendRequest({
      method: 'put',
      url: '/ageVisibility',
      data: {visible}
    })
  }

  deleteAccount(){
    return this.sendRequest({
      method: 'delete',
      url: '/'
    })
  }

  profileVisited(){
    return this.sendRequest({
      method: 'get',
      url: '/profile-visited'
    })
  }
}
