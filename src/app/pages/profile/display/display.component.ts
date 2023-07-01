import { MessengerService } from './../../messenger.service';
import { RequestService } from './../../../services/request.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from './../../../services/toast.service';
import { AlertController, PopoverController } from '@ionic/angular';
import { UploadFileService } from './../../../services/upload-file.service';
import { AuthService } from './../../../services/auth.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { UserService } from './../../../services/user.service';
import { User } from './../../../models/User';
import { Component, OnInit } from '@angular/core';
import constants from 'src/app/helpers/constants';
import { Request } from 'src/app/models/Request';
import { DropDownComponent } from '../../drop-down/drop-down.component';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
})
export class DisplayComponent implements OnInit {

  pageLoading = true;
  authUser: User;
  user: User;
  domaine = constants.DOMAIN_URL;
  myProfile = false;
  userId: string;

  constructor(private auth: AuthService, private camera: Camera, private nativeStorage: NativeStorage,private popoverController: PopoverController,
  private userService: UserService, private uploadFileService: UploadFileService, private toastService: ToastService,private messengerService: MessengerService,
  private route: ActivatedRoute, private requestService: RequestService, private alertCtrl: AlertController, private router: Router) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.pageLoading = true
    this.getUserId();
  }

  getUserId(){
    this.route.paramMap
    .subscribe(
      params => {
        this.userId = params.get('id');
        if(this.userId && this.userId != "null"){
          this.getUser();
        }else{
          this.getAuthUser();
          this.myProfile = true;
        }
      }
    )
  }

  refresh(event){
    if(this.userId && this.userId != "null"){
      this.getUser(event);
      this.nativeStorage.getItem('user').then(
        user => {
          this.authUser  = user;
        }
      )
    }else{
      this.getAuthUser(event);
      this.myProfile = true;
    }
  }

  getUser(event?){
    if(!event) this.pageLoading = true;
    this.userService.getUserProfile(this.userId)
    .then(
      (resp: any) => {
        this.pageLoading = false;
        this.user = new User().initialize(resp.data);
        console.log(this.user)
        this.nativeStorage.getItem('user').then(user => this.authUser = new User().initialize(user))
        if(event) event.target.complete()
      },
      err => {
        this.pageLoading = false;
        if(event) event.target.complete()
      }
    )
  }

  getAuthUser(event?){
    if(!event) this.pageLoading = true;
    this.auth.getAuthUser()
    .then(
      (resp: any) => {
        this.user = new User().initialize(resp.data);
        if(!this.user.visitProfile) this.showProfileAlert();
        this.userService.profileVisited().then(() => this.user.visitProfile = true);
        this.nativeStorage.setItem('user', this.user.toObjeect());
        if(event) event.target.complete();
        this.pageLoading = false;
      },
      err => {
        this.pageLoading = false;
        if(event) event.target.complete()
      }
    )
  }

  async showProfileAlert(){
    const alert = await this.alertCtrl.create({
      header: 'Remember',
      message: 'You can whenever hide your age, and disable/enable random function from setting',
      buttons: [
        {
          text: 'ok',
          role: 'cancel'
        }
      ]
    })

    await alert.present();
  }

  takePicture(){
    this.getPicture(this.camera.PictureSourceType.CAMERA);
  }

  selectPicture(){
    this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
  }

  getPicture(sourceType){
    this.uploadFileService.takePicture(sourceType)
    .then(
      (res: any) => {
        this.updateAvatar(res.file, res.name)
      },
      err => {
        console.log(err);
        this.toastService.presentStdToastr(err);
      }
    )
  }

  updateAvatar(file: File, name: string){
    const form: FormData = new FormData();
    form.append('avatar', file, name);
    this.userService.updateAvatar(this.user.id, form)
    .then(
      (resp: any) => {
        this.user.avatar = resp.data.avatar;
        this.nativeStorage.setItem('user', this.user.toObjeect())
        this.messengerService.sendMessage({event: 'update-user'});
        this.toastService.presentStdToastr('your avatar has been updated successfully');
      },
      err =>{
        console.log(err);
        this.toastService.presentStdToastr(err)
      }
    )
  }

  follow(){
    this.userService.follow(this.user.id)
    .then(
      (resp: any) => {
        console.log(resp);
        this.user.followed = resp.data;
        this.toastService.presentStdToastr(this.user.followed ? 'follow' : 'unfollow')
      },
      err => {
        console.log(err);
        this.toastService.presentStdToastr(err);
      }
    )
  }

  request(){
    if(this.user.friend) this.removeFriendShipConf();
    else if(this.user.request == 'requesting') this.acceptRequest()
    else if(this.user.request == 'requested') this.cancelRequest()
    else this.requestFriendship()
  }

  handleError(err){
    this.toastService.presentStdToastr(err)
  }

  acceptRequest(){
    this.requestService.acceptRequest(this.user.requests[0].id)
    .then(
      resp => {
        this.user.friend = true
      },
      err => this.handleError(err)
    )
  }

  cancelRequest(){
    this.requestService.cancelRequest(this.user.requests[0].id)
    .then(
      resp => {
        this.user.request = null;
        this.user.requests = [];
      },
      err => this.handleError(err)
    )
  }

  requestFriendship(){
    this.requestService.request(this.user.id)
    .then(
      (resp: any) => {
        this.user.request = 'requested';
        this.user.friend = false;
        this.user.requests.push(new Request(resp.data.request))
        this.toastService.presentStdToastr(resp.message);
      },
      err => {
        err = JSON.parse(err);
        if(err.code && err.code == constants.ERROR_CODES.SUBSCRIPTION_ERROR){
          this.router.navigate(['/tabs/subscription']);
          this.toastService.presentStdToastr(err.message)
        }
        else this.toastService.presentStdToastr(err)
      }
    )
  }

  async removeFriendShipConf(){
    const alert = await this.alertCtrl.create({
      header: 'Remove Friendship',
      message: 'do you really want to remove your friendship ?',
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel'
        },
        {
          text: 'REMOVE',
          cssClass: 'text-danger',
          handler: () => this.removeFriendship()
        }
      ]
    })
    await alert.present()
  }

  removeFriendship(){
    this.userService.removeFriendship(this.user.id)
    .then(
      (resp: any) => {
        this.toastService.presentStdToastr(resp.message)
        if(resp.data){
          this.user.friend = false;
          this.user.request = null
        }
      },
      err => {
        this.toastService.presentStdToastr(err);
      }
    )
  }

  async presentPopover(ev: any) {
    const popoverItems = [
      {
        text: 'Block',
        icon: 'fas fa-minus-circle',
        event: 'block'
      },
      {
        text: 'Report',
        icon: 'fas fa-exclamation-triangle',
        event: 'report'
      }
    ]
    const popover = await this.popoverController.create({
      component: DropDownComponent,
      event: ev,
      cssClass: 'dropdown-popover',
      componentProps: {
        items: popoverItems
      }
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    console.log(data);

    if(data && data.event){
      if(data.event == 'block'){
        this.blockUserConf();
      }
      else if(data.event == 'report'){
        this.reportUser();
      }
    }
  }

  async blockUserConf(){
    const alert = await this.alertCtrl.create({
      header: 'Block User',
      message: 'do you really want to block this user ?',
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel'
        },
        {
          text: 'BLOCK',
          cssClass: 'text-danger',
          handler: () => this.blockUser()
        }
      ]
    })
    await alert.present()
  }

  blockUser(){
    this.userService.block(this.userId)
    .then(
      (resp: any) => {
        this.toastService.presentStdToastr(resp.message)
        this.router.navigateByUrl('/tabs/profile/display/null')
      },
      err => {
        this.toastService.presentStdToastr(err)
      }
    )
  }

  async reportUser(){
    const alert = await this.alertCtrl.create({
      header: 'Report ' + this.user.fullName,
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
            this.userService.report(this.userId, message)
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

  videoCall(){
    if(this.authUser && this.authUser.subscription && this.user && this.user.friend){
      this.router.navigateByUrl('/messages/video/' + this.user.id)
    }else this.videoCallSubAlert();
  }

  async videoCallSubAlert(){
    const message = !this.user.friend ? ('You can only have a call with friends, how about sending a friend request to ' + this.user.fullName) + ' ?' : ('You must subscribe to call ' + this.user.fullName)
    const buttons: any[] = [
      {
        text: 'cancel',
        role: 'cancel'
      }
    ]
    if(this.user.friend) buttons.push(
      {
        text: 'Subscribe',
        cssClass: 'text-danger',
        handler: () => {
          this.router.navigateByUrl('/tabs/subscription')
        }
      }
    )
    const alert = await this.alertCtrl.create({
      header: 'You can\'t call ' + this.user.fullName,
      message: message,
      buttons: buttons
    })
    await alert.present();
  }

}
