import { Router } from '@angular/router';
import { HTTP } from '@ionic-native/http/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DataService } from './data.service';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends DataService {

  constructor(nativeStorage: NativeStorage, http: HTTP, router: Router, platform: Platform) {
    super('auth/', nativeStorage, http, router, platform)
  }

  verifyEmail(email: string){
    return this.sendRequest({
      method: 'post',
      url: 'checkEmail',
      data: {email}
    })
  }

  signup(data){
    return this.sendRequest({
      method: 'post',
      url: 'signup',
      data
    });
  }

  signin(data){
    return this.sendRequest({
      method: 'post',
      url: 'signin',
      data
    });
  }

  signout(){
    return this.sendRequest({
      method: 'post',
      url: 'signout'
    })
  }

  getAuthUser(){
    return this.sendRequest({
      method: 'get',
      url: 'user'
    })
  }
}
