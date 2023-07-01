import { OneSignalService } from './../../../services/one-signal.service';
import { ToastService } from './../../../services/toast.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';
import { AuthService } from './../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';
import { ModalController } from '@ionic/angular';
import { User } from './../../../models/User';
import { WelcomeAlertComponent } from '../welcome-alert/welcome-alert.component';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {

  socket = SocketService.socket;
  form: FormGroup
  pageLoading = false;
  validationErrors = {};
  user: User;

  get email(){
    return this.form.get('email').value;
  }

  get password(){
    return this.form.get('password').value;
  }

  constructor(private formBuilder: FormBuilder, private auth: AuthService, private toastService: ToastService,
              private router: Router, private nativeStorage: NativeStorage, private oneSignalService: OneSignalService,
              private modalCtrl: ModalController) {

  }

  ngOnInit() {
    this.initializeForm();
  }

  ionViewWillEnter(){
    this.clearForm();
  }

  initializeForm(){
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }

  clearForm(){
    this.form.patchValue({
      email: '',
      password: ''
    })
  }

  submit(){
    this.pageLoading = true;
    this.auth.signin({email: this.email, password: this.password})
    .then(
      (resp: any) => {
        this.pageLoading = false;
        this.user = new User().initialize(resp.data.user);
        this.nativeStorage.setItem('token', resp.data.token);
        this.nativeStorage.setItem('user', resp.data.user);
        this.socket.emit('connect-user', resp.data.user._id);
        this.oneSignalService.open(resp.data.user._id);
        if(!this.user.loggedIn) this.showWelcomeAlert();
        this.router.navigate(['/tabs/new-friends']);
      },
      err => {
        this.pageLoading = false;
        if(err.errors){
          this.validationErrors = err.errors
        }else if(typeof err == "string"){
          this.toastService.presentStdToastr(err);
        }
      }
    )
  }

  async showWelcomeAlert(){
    const modal = await this.modalCtrl.create({
      component: WelcomeAlertComponent,
      componentProps: {
        user: this.user
      },
      animated: true,
      showBackdrop: true,
    })
    await modal.present()
  }

}
