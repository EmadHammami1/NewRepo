import { IonInfiniteScroll } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Channel } from './../../../models/Channel';
import { ToastService } from './../../../services/toast.service';
import { ChannelService } from './../../../services/channel.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @ViewChild('infinitScroll') infinitScroll: IonInfiniteScroll;

  user: User;
  pageLoading = false;
  page: number;
  channels: Channel[];
  searchWord = "";
  type: string;

  followLoading = [];

  constructor(private channelService: ChannelService, private toastService: ToastService, private router: Router,
              private route: ActivatedRoute, private nativeStorage: NativeStorage) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.page = 0;
    this.getType();
  }

  getType(){
    this.route.paramMap
    .subscribe(params => {
      this.type = params.get('type');
      if(this.type == 'explore' || this.type == 'mines'){
        this.nativeStorage.getItem('user')
        .then(
          user => {
            this.user = new User().initialize(user);
            this.getChannels(null, true);
          }
        )
      }
      else this.getChannels(null, true);
    })
  }

  search(searchWord: string){
    this.searchWord = searchWord;
    this.getChannels();
  }

  handleResponse(resp, event, refresh){
    if(!event || refresh) this.channels = []

    console.log(resp.data.channels)
    resp.data.channels.forEach(channel => {
      this.channels.push(new Channel().initialize(channel));
    })

    if(refresh) this.infinitScroll.disabled = false

    if(event){
      event.target.complete();
      if(!refresh && !resp.data.more) event.target.disabled = true;
    }
    this.pageLoading = false;
  }

  handleError(err){
    this.pageLoading = false;
    this.toastService.presentStdToastr(err);
    console.log(err);
  }

  getChannels(event?, refresh?){
    this.pageLoading = true;
    if(refresh) this.page = 0;

    if(this.type == 'mines'){
      this.channelService.myChannels(this.page++, this.searchWord)
      .then(
        (resp: any) => this.handleResponse(resp, event, refresh),
        err => this.handleError(err)
      );
    }

    if(this.type == 'followed'){
      this.channelService.followedChannels(this.page++, this.searchWord)
      .then(
        (resp: any) => this.handleResponse(resp, event, refresh),
        err => this.handleError(err)
      );
    }

    if(this.type == 'explore'){
      this.channelService.exploreChannels(this.page++, this.searchWord, this.user.city)
      .then(
        (resp: any) => this.handleResponse(resp, event, refresh),
        err => this.handleError(err)
      );
    }
  }

  follow(channel: Channel){
    this.followLoading.push(channel.id);
    this.channelService.follow(channel.id)
    .then(
      (resp: any) => {
        this.followLoading.splice(this.followLoading.indexOf(channel.id), 1);
        this.toastService.presentStdToastr(resp.message);
        if(resp.data)
          channel.followers.push(this.user.id);
        else
          channel.followers.splice(channel.followers.indexOf(this.user.id), 1)
      },
      err => {
        this.followLoading.splice(this.followLoading.indexOf(channel.id), 1);
        this.toastService.presentStdToastr(err);
      }
    )
  }

  showChannel(channel: Channel){
    this.router.navigate(['/tabs/channels/channel'], {
      queryParams: {
        channel: JSON.stringify(channel.toObject())
      }
    })
  }
}
