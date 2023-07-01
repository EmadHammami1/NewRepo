import { Injectable } from '@angular/core';
import { AdMobFree, AdMobFreeInterstitialConfig, AdMobFreeBannerConfig } from '@ionic-native/admob-free/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AdMobFeeService {

  interstitialConfig: AdMobFreeInterstitialConfig = {
    isTesting: true,
    autoShow: true,
    id: 'ca-app-pub-3940256099942544/1033173712'
  };

  bannerConfig: AdMobFreeBannerConfig = {
    id: 'ca-app-pub-3940256099942544/6300978111',
    isTesting: true,
    autoShow: true
  }

  constructor(private adMobFree: AdMobFree, public platform: Platform) {
    platform.ready().then(() => {
      this.adMobFree.interstitial.config(this.interstitialConfig);
      this.adMobFree.banner.config(this.bannerConfig);
    });
  }

  showInterstitialAd(){
    this.adMobFree.interstitial.prepare();

    this.adMobFree.on(this.adMobFree.events.INTERSTITIAL_LOAD).subscribe(() => {
      console.log('done')
      this.adMobFree.interstitial.show().then(() => {
        console.log('success');
      }).catch((errorShow) => {
        console.log('err(', errorShow);
      });
    });
    this.adMobFree.on(this.adMobFree.events.INTERSTITIAL_LOAD_FAIL).subscribe((reason) => {
      console.log('fail', reason);
    });
  }

  showBannerAd(){
    this.adMobFree.banner.prepare();
    this.adMobFree.on(this.adMobFree.events.BANNER_LOAD).subscribe(() => {
      console.log('done')
      this.adMobFree.banner.show().then(() => {
        console.log('success');
      }).catch((errorShow) => {
        console.log('err(', errorShow);
      });
    });
    this.adMobFree.on(this.adMobFree.events.BANNER_LOAD_FAIL).subscribe((reason) => {
      console.log('fail', reason);
    });
  }
}
