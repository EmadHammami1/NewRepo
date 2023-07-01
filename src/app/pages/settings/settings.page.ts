import { MessengerService } from './../messenger.service';
import { OneSignalService } from './../../services/one-signal.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AlertController, ModalController } from '@ionic/angular';
import constants from 'src/app/helpers/constants';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { SocketService } from 'src/app/services/socket.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from '../terms-of-service/terms-of-service.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  appVersion = constants.VERSION
  user: User;
  socket = SocketService.socket;
  pageLoading = false;
  ageVisibility = false;
  randomVisibility = false;
  loading = false;


  constructor(private alertController: AlertController, private nativeStorage: NativeStorage, private userService: UserService,
              private toastService: ToastService, private router: Router, private auth: AuthService, private oneSignalService: OneSignalService,
              private messengerService: MessengerService, private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.pageLoading = true;
    this.getUser();
  }

  getUser(){
    this.auth.getAuthUser().then(
      (resp: any) => {
        this.pageLoading = false;
        this.user = new User().initialize(resp.data);
        this.randomVisibility = this.user.randomVisible
        this.ageVisibility = this.user.ageVisible;
      }
    )
  }

  async changeEmail(){
    const alert = await this.alertController.create({
      header: 'Chane Email',
      message: "your current email is : " + this.user.email,
      inputs: [
        {
          name: 'email',
          placeholder: 'Your new Email here',
        }
      ],
      buttons: [
        {
          text: 'CANCEL',
          cssClass: 'text-dark',
          role: 'cancel'
        },
        {
          text: 'CHANGE',
          handler: (res) => {
            this.loading = true;
            return this.userService.updateEmail(res.email).then(
              (resp: any) => {
                this.toastService.presentStdToastr(resp.message);
                this.user = new User().initialize(resp.data);
                this.messengerService.sendMessage({event: 'update-user'});
                console.log(this.user);
                this.nativeStorage.setItem('user', this.user);
                this.loading = false;
                return true;
              },
              err => {
                this.loading = false;
                if(typeof err == 'string'){
                  this.toastService.presentStdToastr(err);
                  return false;
                }
                else{
                  console.log(err);
                  this.toastService.presentStdToastr(err.errors['email'][0]);
                  return false;
                }
              }
            )
          }
        }
      ]
    })
    await alert.present()
  }

  async changePassword(){
    const alert = await this.alertController.create({
      header: 'Chane Password',
      message: 'Change your password regularly for safety',
      inputs: [
        {
          name: 'current_password',
          type: 'password',
          placeholder: 'Old Password',
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'New Passwoed',
        },
        {
          name: 'password_confirmation',
          type: 'password',
          placeholder: 'New Password Again',
        }
      ],
      buttons: [
        {
          text: 'CANCEL',
          cssClass: 'text-dark',
          role: 'cancel'
        },
        {
          text: 'CHANGE',
          handler: (res) => {
            this.loading = true;
            this.userService.updatePassword({...res}).then(
              (resp: any) => {
                this.loading = false;
                this.toastService.presentStdToastr(resp.message)
              },
              err => {
                this.loading = false;
                if(typeof err == 'string'){
                  this.toastService.presentStdToastr(err);
                  return false;
                }
                else{
                  let error = "";
                  if(err.errors['current_password']) error = err.errors['current_password'][0]
                  if(err.errors['password']) error = err.errors['password'][0]
                  if(err.errors['password_confirmation']) error = err.errors['password_confirmation'][0]
                  this.toastService.presentStdToastr(error);
                  return false;
                }
              }
            )
          }
        }
      ]
    })
    await alert.present()
  }

  signout(){
    this.loading = true;
    this.auth.signout()
    .then(
      () => {
        this.loading = false;
        this.oneSignalService.close();
        this.socket.emit('disconnect-user')
        this.nativeStorage.remove('token');
        this.router.navigate(['/auth/home']);
      },
      err => {
        this.loading = false;
        this.toastService.presentStdToastr('sorry an error has occurred, please try again later')
      }
    )
  }

  toggleRandomVisibility(event){
    if(this.randomVisibility == this.user.randomVisible) return;
    this.loading = true;
    this.userService.updateRandomVisibility(this.randomVisibility)
    .then(
      (resp: any) => {
        this.loading = false;
        this.user.randomVisible = this.randomVisibility;
        this.toastService.presentStdToastr(resp.message)
      },
      err => {
        this.loading = false;
        this.toastService.presentStdToastr(err)
      }
    )
  }

  toggleAgeVisibility(event){
    if(this.ageVisibility == this.user.ageVisible) return;
    console.log('age toggle')
    this.loading = true;
    this.userService.updateAgeVisibility(this.ageVisibility)
    .then(
      (resp: any) => {
        this.loading = false;
        this.user.ageVisible = this.ageVisibility;
        this.toastService.presentStdToastr(resp.message)
      },
      err => {
        this.loading = false;
        this.toastService.presentStdToastr(err)
      }
    )
  }

  async openPrivacyPolicy(){
    const modal = await this.modalCtrl.create({
      component: PrivacyPolicyComponent
    });

    await modal.present();
  }

  async openTermsOfService(){
    const modal = await this.modalCtrl.create({
      component: TermsOfServiceComponent
    });

    await modal.present();
  }

  async deleteAccount(){
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'After deleting your account you will still have a chance to restore it within the next 4 days by logging into it, otherwise the account will be deleted permanently from thee application',
      buttons: [
         {
           text: 'cancel',
           role: 'cancel'
         },
         {
           text: 'delete account',
           cssClass: 'text-danger',
           handler: () => {
             this.userService.deleteAccount().then(
               resp => {
                this.signout();
               },
               err => {
                 this.toastService.presentStdToastr(err);
               }
             )
           }
         },
      ]
    })
    await alert.present()
  }


}
