import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DropDownComponent } from './../../drop-down/drop-down.component';
import { PostFormComponent } from './post-form/post-form.component';
import { IonInfiniteScroll, ModalController, IonContent, PopoverController, AlertController } from '@ionic/angular';
import { User } from './../../../models/User';
import { ToastService } from './../../../services/toast.service';
import { Post } from './../../../models/Post';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from './../../../services/channel.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Channel } from 'src/app/models/Channel';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent implements OnInit {
  @ViewChild('infinitScroll') infinitScroll: IonInfiniteScroll;
  @ViewChild('content') content: IonContent;

  anonyme = false;
  channel: Channel;
  user: User;

  pageLoading = false;

  posts: Post[];
  page = 0;

  constructor(private channelService: ChannelService, private route: ActivatedRoute, private modalCtrl:
              ModalController,private popoverController: PopoverController, private alertCtrl:
              AlertController, private toastService: ToastService, private router: Router, private nativeStorage:
              NativeStorage) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.page = 0;
    this.pageLoading = true;
    this.getChannelParams();
  }

  getChannelParams(){
    this.route.queryParamMap
    .subscribe(
      params => {
        this.pageLoading = false;
        this.channel = new Channel().initialize(JSON.parse(params.get('channel')));
        this.nativeStorage.getItem('user')
        .then(
          user => {
            this.user = new User().initialize(user);
            this.getChannelPosts(null, true);
          }
        )
      }
    )
  }

  getChannelPosts(event?, refresh?){
    if(!event) this.pageLoading = true;
    if(refresh) this.page = 0;
    this.channelService.getPosts(this.channel.id, this.page++)
    .then(
      (resp: any) => {
        if(!event || refresh){
          this.posts = [];
        }
        if(refresh) this.infinitScroll.disabled = false

        if(event){
          event.target.complete()
        }
        resp.data.posts.forEach(pst => {
          this.posts.push(new Post().initialize(pst));
        })

        console.log(this.posts)
        this.pageLoading = false;
      },
      err => {
        this.pageLoading = false;
      }
    )
  }

  addPost(post: Post){
    this.posts.unshift(post);
    this.content.scrollToTop(200)
  }

  deletePost(post: Post){
    this.posts.splice(this.posts.indexOf(post), 1);
  }

  async showPostForm(){
    const modal = await this.modalCtrl.create({
      component: PostFormComponent,
      componentProps: {
        channelId: this.channel.id
      }
    });
    await modal.present()
    const { data } = await modal.onWillDismiss();
    if(data.post)
      this.addPost(data.post);
  }

  async presentPopover(ev: any) {
    const popoverItems = [];
    if(this.channel.user.id == this.user.id){
      popoverItems.push(
        {
          text: 'Delete',
          icon: 'fas fa-trash-alt',
          event: 'delete'
        }
      )
    }else {
      popoverItems.push(
        {
          text: this.channel.followedBy(this.user.id) ? 'Unfollow' : 'Follow',
          icon: this.channel.followedBy(this.user.id) ? 'fas fa-minus-circle' :  'fas fa-plus',
          event: 'follow'
        },
        {
          text: 'Report',
          icon: 'fas fa-exclamation-triangle',
          event: 'report'
        }
      )
    }
    const popover = await this.popoverController.create({
      component: DropDownComponent,
      event: ev,
      cssClass: 'dropdown-popover',
      showBackdrop: false,
      componentProps: {
        items: popoverItems
      }
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    if(data && data.event){
      if(data.event == 'follow'){
        if(this.channel.followedBy(this.user.id))
          this.togglefollowConf();
        else
          this.togglefollow();
      }
      else if(data.event == 'delete') this.deleteConf();
      else if(data.event == 'report') this.reportChannel();
    }
  }

  async togglefollowConf(){
    const alert = await this.alertCtrl.create({
      header: 'Unfollow ' + this.channel.name,
      message: 'do you really want to unfollow this channel ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.togglefollow();
          },
          cssClass: "text-danger"
        }
      ]
    });
    await alert.present()
  }

  togglefollow(){
    this.channelService.follow(this.channel.id)
    .then(
      (resp: any) => {
        this.toastService.presentStdToastr(resp.message);
        if(resp.data)
          this.channel.followers.push(this.user.id);
        else
          this.channel.followers.splice(this.channel.followers.indexOf(this.user.id), 1)
      },
      err => {
        this.toastService.presentStdToastr(err)
      }
    )
  }

  async deleteConf(){
    const alert = await this.alertCtrl.create({
      header: 'Delete Channel',
      message: 'do you really want to delete this channel ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteChannel();
          },
          cssClass: "text-danger"
        }
      ]
    });
    await alert.present()
  }

  deleteChannel(){
    this.channelService.deleteChannel(this.channel.id)
    .then(
      (resp: any) => {
        this.toastService.presentStdToastr(resp.message)
        this.router.navigateByUrl('/tabs/channels/list/mines')
      },
      err => {
        this.toastService.presentStdToastr(err)
      }
    )
  }

  async reportChannel(){
    const alert = await this.alertCtrl.create({
      header: 'Report ' + this.channel.name,
      inputs: [
        {
          type: 'text',
          name: 'message',
          placeholder: 'Message'
        }
      ],
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel'
        },
        {
          text: 'SEND',
          cssClass: 'text-danger',
          handler: (val) => {
            const message = val.message
            this.channelService.reportChannel(this.channel.id, message)
            .then(
              (resp: any) => {
                this.toastService.presentStdToastr(resp.message)
              },
              err => {
                this.toastService.presentStdToastr(err)
              }
            )
          }
        }
      ]
    })
    await alert.present();
  }
}
