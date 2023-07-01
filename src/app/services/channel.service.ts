import { Router } from '@angular/router';
import { HTTP } from '@ionic-native/http/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DataService } from './data.service';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ChannelService extends DataService {

  constructor(nativeStorage: NativeStorage, http: HTTP, router: Router, platform: Platform) {
    super('channel', nativeStorage, http, router, platform)
  }

  myChannels(page: number, search: string){
    return this.sendRequest({
      method: 'get',
      url: '',
      data: {page: page.toString(), search}
    })
  }

  followedChannels(page: number, search: string){
    return this.sendRequest({
      method: 'get',
      url: '/followed',
      data: {page: page.toString(), search}
    })
  }

  exploreChannels(page: number, search: string, city: string){
    return this.sendRequest({
      method: 'get',
      url: '/explore',
      data: {page: page.toString(), search, city}
    })
  }

  deleteChannel(id: string){
    return this.sendRequest({
      method: 'delete',
      url: '/' + id
    })
  }

  store(data){
    return this.sendRequest({
      method: 'post',
      url: '',
      data,
      serializer: 'multipart'
    });
  }

  follow(id: string){
    return this.sendRequest({
      method: 'post',
      url: '/follow/' + id
    });
  }

  getPosts(id: string, page: number){
    return this.sendRequest({
      method: 'get',
      url: '/' + id + '/post/',
      data: {page: page.toString()}
    })
  }

  storePost(id: string, data){
    return this.sendRequest({
      method: 'post',
      url: '/' + id + '/post',
      data
    })
  }

  deletePost(id: string){
    return this.sendRequest({
      method: 'delete',
      url: '/post/' + id
    })
  }

  voteOnPost(id: string, vote: number){
    return this.sendRequest({
      method: 'post',
      url: '/post/' + id + '/vote',
      data: {vote}
    })
  }

  storeComment(id: string, data){
    return this.sendRequest({
      method: 'post',
      url: '/post/' + id + '/comment',
      data
    })
  }

  getComments(id: string){
    return this.sendRequest({
      method: 'get',
      url: '/post/' + id + '/comment'
    })
  }

  deleteComment(id: string){
    return this.sendRequest({
      method: 'delete',
      url: '/comment/' + id
    })
  }

  voteOnComment(id: string, vote: number){
    return this.sendRequest({
      method: 'post',
      url: '/comment/' + id + '/vote',
      data: {vote}
    })
  }

  reportChannel(id: string, message: string){
    return this.sendRequest({
      method: 'post',
      url: '/' + id + '/report',
      data: {message}
    })
  }

  reportPost(id: string, message: string){
    return this.sendRequest({
      method: 'post',
      url: '/post/' + id + '/report',
      data: {message}
    })
  }

  reportComment(id: string, message: string){
    return this.sendRequest({
      method: 'post',
      url: '/comment/' + id + '/report',
      data: {message}
    })
  }

  getPost(id: string){
    return this.sendRequest({
      method: 'get',
      url: '/post/' + id
    })
  }
}
