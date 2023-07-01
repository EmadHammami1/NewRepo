import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private nativeStorage: NativeStorage, private router: Router, private platform: Platform){}

  canActivate(): Promise<boolean>{
    return this.platform.ready().then(
      () => {
        return this.nativeStorage.getItem('token')
        .then(
          token => {
            this.router.navigate(['/tabs/new-friends'])
            return false
          },
          err => {
            console.log(err);

            return true
          }
        );
      }
    )
  }
}
