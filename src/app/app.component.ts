import { OneSignalService } from './services/one-signal.service';
import { User } from './models/User';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { JsonService } from './services/json.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';
import { WebrtcService } from './services/webrtc.service';
import { Router } from '@angular/router';
import { MessengerService } from './pages/messenger.service';
import { AdMobFeeService } from './services/admobfree.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  socket = SocketService.socket;
  user: User;
  audio: HTMLAudioElement;


  constructor(
    private platform: Platform,
    private nativeStorage: NativeStorage,
    private jsonService: JsonService,
    private oneSignalService: OneSignalService,
    private webrtcService: WebrtcService,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private network: Network,
    private router: Router,
    private messengerService: MessengerService,
    private adMobFreeService: AdMobFeeService,
    private backgroundMode: BackgroundMode
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.getUserData();
      this.getJsonData();
      // this.backgroundMode.enable();
      // this.adMobFreeService.showBannerAd();
      this.statusBar.styleLightContent();
      setTimeout(() => {
        this.splashScreen.hide();
      }, 1000);
      this.network.onDisconnect().subscribe(() => {
        this.onOffline();
      });
    });
  }

  ionViewWillEnter(){
    this.oneSignalService.close();
  }

  playAudio(src){
    console.log('play app audio')
    console.log(src)
    this.audio = new Audio();
    this.audio.src = src
    this.audio.load();
    this.audio.loop = true;
    this.audio.play();
  }

  connectUser(){
    this.socket.emit('connect-user', this.user.id);
    this.socket.on('called', () => {
      console.log('called')
      this.playAudio("./../../../../../assets/audio/calling.mp3");
      this.messengerService.onMessage().subscribe(msg => {
        if(msg && msg.event && msg.event == 'stop-audio') this.audio.pause();
      })
      console.log('socket call')
      // this.backgroundMode.wakeUp();
      console.log('socket call 2')
    })
    this.socket.on('video-canceled', () => {
      if(this.audio) this.audio.pause()
    })
  }

  getUserData(){
    this.nativeStorage.getItem('user')
    .then(
      user => {
        this.user = new User().initialize(user);
        this.initWebrtc();
        this.connectUser();
        if(this.platform.is('cordova'))
          this.oneSignalService.open(this.user.id);
      }
    )
  }

  async initWebrtc(){
    await this.webrtcService.createPeer(this.user.id);
  }

  getJsonData(){
    this.jsonService.getCountries()
    .then(
      (resp: any) => {
        this.nativeStorage.setItem('countries', JSON.stringify(resp));
        console.log(resp)
      }
    )
    this.jsonService.getCurrencies()
    .then(
      (resp: any) => {
        this.nativeStorage.setItem('currencies', JSON.stringify(resp));
        console.log(resp)
      }
    )
    this.jsonService.getEducations()
    .then(
      (resp: any) => {
        this.nativeStorage.setItem('educations', JSON.stringify(resp));
        console.log(resp)
      }
    )
    this.jsonService.getProfessions()
    .then(
      (resp: any) => {
        this.nativeStorage.setItem('professions', JSON.stringify(resp));
        console.log(resp)
      }
    )
    this.jsonService.getInterests()
    .then(
      (resp: any) => {
        this.nativeStorage.setItem('interests', JSON.stringify(resp));
        console.log(resp)
      }
    )
  }

  async onOffline(){
    this.router.navigateByUrl('/internet-error')
  }

}
