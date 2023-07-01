import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HTTP } from '@ionic-native/http/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DataService } from './data.service';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class JsonService extends DataService{

  constructor(nativeStorage: NativeStorage, http: HTTP, router: Router, platform: Platform) {
    super('', nativeStorage, http, router, platform);
  }

  getCountries(){
    return this.sendRequest({
      method: 'get',
      url: '/json/countries.json',
      noApi: true
    })
  }

  getCurrencies(){
    return this.sendRequest({
      method: 'get',
      url: '/json/currencies.json',
      noApi: true
    })
  }

  getProfessions(){
    return this.sendRequest({
      method: 'get',
      url: '/json/professions.json',
      noApi: true
    })
  }

  getInterests(){
    return this.sendRequest({
      method: 'get',
      url: '/json/interests.json',
      noApi: true
    })
  }

  getEducations(){
    return this.sendRequest({
      method: 'get',
      url: '/json/education.json',
      noApi: true
    })
  }

}
