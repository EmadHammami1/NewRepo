import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private nativeStorage: NativeStorage, private router: Router, private platform: Platform){}

  canActivate(): Promise<boolean>{
    return this.platform.ready().then(
      () => {
        return this.nativeStorage.getItem('token')
        .then(
          token => {
            console.log(token);

            return true
          },
          err => {
            console.log(err);
            this.router.navigate(['/auth/signin'])
            return false
          }
        );
      }
    )
  }

}
