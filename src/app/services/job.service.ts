import { Router } from '@angular/router';
import { HTTP } from '@ionic-native/http/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DataService } from './data.service';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class JobService extends DataService{

  constructor(nativeStorage: NativeStorage, http: HTTP, router: Router, platform: Platform) {
    super('job', nativeStorage, http, router, platform);
  }

  store(data){
    return this.sendRequest({
      method: 'post',
      url: '',
      data,
      serializer: 'multipart'
    });
  }

  available(page: number, query: string){
    return this.sendRequest({
      method: 'get',
      url: '/available',
      data: {page: page.toString(), search: query}
    });
  }

  posted(page: number, query: string){
    return this.sendRequest({
      method: 'get',
      url: '/posted',
      data: {page: page.toString(), search: query}
    });
  }

  get(id: string){
    return this.sendRequest({
      method: 'get',
      url: '/' + id
    });
  }

  getStorePermession(){
    return this.sendRequest({
      method: 'get',
      url: '/storePermession'
    });
  }

  remove(id: string){
    return this.sendRequest({
      method: 'delete',
      url: '/' + id
    })
  }

  report(id: string, message: string){
    return this.sendRequest({
      method: 'post',
      url: '/' + id + '/report',
      data: {message}
    })
  }
}
