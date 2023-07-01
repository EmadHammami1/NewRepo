import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {

  constructor(private oneSignel: OneSignal, private router: Router, private platform: Platform, private backgroundMode: BackgroundMode) { }

  open(user_id){
    console.log(user_id)
    this.oneSignel.startInit("3b993591-823b-4f45-94b0-c2d0f7d0f6d8", "138360337223");
    this.oneSignel.inFocusDisplaying(this.oneSignel.OSInFocusDisplayOption.Notification)
    this.oneSignel.setExternalUserId(user_id);
    this.oneSignel.setSubscription(true);
    this.oneSignel.handleNotificationOpened().subscribe(resp => {
      this.platform.ready().then(
        () => {
          setTimeout(() => {
            console.log('time out')
            const data = resp.notification.payload.additionalData;
            console.log(data.link)
            if(data.link) this.router.navigateByUrl(data.link);
          }, 200)
        }
      )
    });
    this.oneSignel.handleNotificationReceived().subscribe(resp => {
    });

    this.oneSignel.endInit();
  }

  close(){
   this.oneSignel.removeExternalUserId();
   this.oneSignel.setSubscription(false);
  }

}
