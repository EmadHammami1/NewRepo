import { Router } from '@angular/router';
import { CommentsComponent } from './../comments/comments.component';
import { ToastService } from './../../../../services/toast.service';
import { ChannelService } from './../../../../services/channel.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { Post } from './../../../../models/Post';
import { User } from './../../../../models/User';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropDownComponent } from 'src/app/pages/drop-down/drop-down.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {

  @Output() removePost = new EventEmitter();
  @Input() post: Post;
  @Input() user: User;
  @Input() showCommentsBtn = true;

  deleteLoading = false;

  constructor(private alertCtrl: AlertController, private channelService: ChannelService, private toastService:ToastService,
              private modalCtrl: ModalController, private router: Router, private popoverController: PopoverController) { }

  ngOnInit() {}

  postUserName(post: Post){
    const user = post.user;
    return !user ? 'Dolphy user' : (post.anonyme ? 'Anonyme' : (user.firstName + ' ' + user.lastName));
  }

  voteOnPost(vote: number){
    this.channelService.voteOnPost(this.post.id, vote)
    .then(
      (resp: any) => {
        this.post.voted = resp.data.voted;
        this.post.votes = resp.data.votes;
      },
      err => {
        this.toastService.presentStdToastr(err);
      }
    )
  }

  async showComments(){
    this.router.navigateByUrl('/tabs/channels/post/' + this.post.id)
  }

  showUserProfile(id: string){
    if(!this.post.anonyme && this.user.id != id)
      this.router.navigate(['/tabs/profile/display/' + id])
  }

  async presentPopover(ev: any) {
    const popoverItems = [];
    if(this.post.user.id == this.user.id){
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
      if(data.event == 'delete') this.deletePostConf();
      else if(data.event == 'report') this.reportPost();
    }
  }

  async deletePostConf(){
    const alert = await this.alertCtrl.create({
      header: 'Delete Post',
      message: 'do you really want to delete this post ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.deletePost();
          },
          cssClass: "text-danger"
        }
      ]
    });
    await alert.present()
  }

  deletePost(){
    this.channelService.deletePost(this.post.id)
    .then(
      (resp: any) => {
        this.removePost.emit();
        this.toastService.presentStdToastr(resp.message)
      },
      err => {
        this.toastService.presentStdToastr(err)
      }
    )
  }

  async reportPost(){
    const alert = await this.alertCtrl.create({
      header: 'Report Post',
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
            this.channelService.reportPost(this.post.id, message)
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
