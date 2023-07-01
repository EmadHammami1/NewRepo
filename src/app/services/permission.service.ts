import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private alertCtrl: AlertController, private openNativeSettings: OpenNativeSettings, private androidPermission: AndroidPermissions) { }

  async requestPermission(permission: string){
    return new Promise((resolve, reject) => {
      this.androidPermission.requestPermission(permission)
      .then(
        async(resp) => {
          if(resp.hasPermission) resolve(true);
          else{
            reject(await this.showPermissionAlert());
          };
        },
        async() => {
          reject(await this.showPermissionAlert());
        }
      )
    })
  }

  async showPermissionAlert(){
    const alert = await this.alertCtrl.create({
      header: 'Permission',
      message: 'Dolphy doesn\'t have the permission to perfome this action, please give us the permsiion from the application settings',
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel'
        },
        {
          text: 'Settings',
          handler: () => {
            this.openNativeSettings.open('application_details')
          }
        }
      ]
    })
    await alert.present();
    const dismiss = await alert.onDidDismiss()
    return dismiss.role == 'cancel'
  }

  getPermission(permission){
    return new Promise((resolve, reject) => {
      this.androidPermission.checkPermission(permission)
      .then(
        result => {
          if(result.hasPermission){
            resolve(null)
          }else{
            this.requestPermission(permission)
            .then(resp => {
              if(resp) resolve(true);
            }, (err) => reject(err))
          }
        },
        () => {
          this.requestPermission(permission)
          .then(resp => {
            if(resp) resolve(true);
          }, (err) => reject(err))
        }
      )
    })
  }

}
