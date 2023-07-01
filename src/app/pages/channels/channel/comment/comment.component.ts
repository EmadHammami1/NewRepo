import { Router } from '@angular/router';
import { ToastService } from './../../../../services/toast.service';
import { ChannelService } from './../../../../services/channel.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { User } from './../../../../models/User';
import { Comment } from '../../../../models/Comment';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DropDownComponent } from 'src/app/pages/drop-down/drop-down.component';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {

  @Output() removeComment = new EventEmitter();
  @Input() comment: Comment;
  @Input() backgroundColor: string;
  @Input() color: string;
  @Input() user: User;

  deleteLoading = false;

  constructor(private alertCtrl: AlertController, private channelService: ChannelService, private toastService:
             ToastService, private router: Router, private popoverController: PopoverController, private modalCtrl: ModalController) { }

  ngOnInit() {}

  commentUserName(comment: Comment){
    const user = comment.user
    return !user ? 'Dolphy user' : (comment.anonyme ? 'Anonyme' : (user.firstName + ' ' + user.lastName));
  }

  deleteComment(){
    this.deleteLoading = true;
    this.channelService.deleteComment(this.comment.id)
    .then(
      (resp: any) => {
        this.deleteLoading = false;
        this.removeComment.emit();
        this.toastService.presentStdToastr(resp.message);
      },
      err => {
        this.deleteLoading = false;
        this.toastService.presentStdToastr(err);
      }
    )
  }

  async deleteCommentConf(){
    const alert = await this.alertCtrl.create({
      header: 'Delete Comment',
      message: 'do you really want to delete this comment ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteComment();
          },
          cssClass: "text-danger"
        }
      ]
    })
    await alert.present()
  }

  voteOnComment(vote: number){
    this.channelService.voteOnComment(this.comment.id, vote)
    .then(
      (resp: any) => {
        this.comment.voted = resp.data.voted;
        this.comment.votes = resp.data.votes;
      },
      err => {
        this.toastService.presentStdToastr(err);
      }
    )
  }

  showUserProfile(id: string){
    if(!this.comment.anonyme && this.user.id != id){
      this.router.navigate(['/tabs/profile/display/' + id])
      this.modalCtrl.dismiss();
    }
  }

  async presentPopover(ev: any) {
    const popoverItems = [];
    if(this.comment.user.id == this.user.id){
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
      if(data.event == 'delete') this.deleteCommentConf();
      else if(data.event == 'report') this.reportComment();
    }
  }

  async reportComment(){
    const alert = await this.alertCtrl.create({
      header: 'Report Comment',
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
            this.channelService.reportComment(this.comment.id, message)
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
