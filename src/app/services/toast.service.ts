import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Toast } from '@ionic-native/toast/ngx';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController, private toast: Toast) { }

  async presentErrorToastr(err: string, position:any = 'bottom'){
    const toastr = await this.toastCtrl.create({
      message: err,
      position,
      color: 'danger',
      duration: 2000,
    });

    toastr.present();
  }

  async presentStdToastr(msg: string){
    this.toast.show(msg, '1500', 'bottom').subscribe(
      toast => {
        console.log(toast);
      }
    );
  }

  async presentSuccessToastr(success: string){
    const toastr = await this.toastCtrl.create({
      message: success,
      position: 'bottom',
      color: 'success',
      duration: 2000,
    });

    toastr.present();
  }
}
