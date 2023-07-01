
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { IonInfiniteScroll, IonSlides, ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { SearchOptionsComponent } from './search-options/search-options.component';
import { User } from './../../models/User';
import { AdMobFeeService } from './../../services/admobfree.service';

@Component({
  selector: 'app-new-friends',
  templateUrl: './new-friends.page.html',
  styleUrls: ['./new-friends.page.scss'],
})
export class NewFriendsPage implements OnInit {
  @ViewChild('infinitScroll') infinitScroll: IonInfiniteScroll;
  @ViewChild('slides') slides: IonSlides;

  users: User[];

  options = {
    gender: 'both',
    profession: '0',
    interests: '0',
    education: '0'
  }
  page = 0;
  pageLoading = false;
  initialSlide = 0;
  showSlides = false;
  random = false;
  authUser: User;
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    onlyExternal: false
  };


  constructor(private userService: UserService, private modalController: ModalController, private router: Router,
              private changeDetectorRef: ChangeDetectorRef, private nativeStorage: NativeStorage, private adMobFeeService: AdMobFeeService) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.page = 0;
    this.slideOpts = {
      initialSlide: 0,
      speed: 400,
      onlyExternal: false
    }
    this.getNearUsers(null, true);
    this.getAuthUser();
  }

  toggleRandom(){
    this.users = [];
    this.pageLoading = true;
    this.getNearUsers(null, true)
  }

  getAuthUser(){
    this.nativeStorage.getItem('user').then(
      user => {
        this.authUser = new User().initialize(user);
        console.log(this.authUser)
      }
    )
  }

  getNearUsers(event?, refresh?){
    if(refresh){
      this.page = 0;
      this.pageLoading = true
      // this.adMobFeeService.showInterstitialAd();
    }
    this.userService.getUsers(this.page++, {...this.options, type: this.random ? 'random' : 'near'})
    .then(
      (resp: any) => {
        if(refresh) this.users = [];

        resp.data.users.forEach(user => {
          this.users.push(new User().initialize(user));
        })

        if(refresh && this.infinitScroll) this.infinitScroll.disabled = false

        if(this.random){
          this.showSlides = true
          this.initialSlide = 0
        }

        if(event){
          event.target.complete();
          if(!resp.data.more && !refresh) event.target.disabled = true;
        }

        if(refresh && this.slides){
          this.slides.slideTo(0, 200)
        }

        this.pageLoading = false;
        this.changeDetectorRef.detectChanges()
      },
      err => {
        if(event){
          event.target.complete();
        }
        if(refresh && this.infinitScroll) this.infinitScroll.disabled = false

        this.pageLoading = false;
        console.log(err);
      }
    )
  }

  async presentSearchByModal(){
    const modal = await this.modalController.create({
      componentProps: {
        checkItems: {
          profession: this.options.profession,
          education: this.options.education,
          interests: this.options.interests,
        },
        gender: this.options.gender
      },
      component: SearchOptionsComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log(data);

    if(Object.keys(data).length){
      this.options = data;
      this.page = 0;
      this.getNearUsers(null, true)
    }
  }

  showUser(ind: number){
    this.initialSlide = ind;
    this.showSlides = true
  }

  showProfile(id: string){
    this.router.navigateByUrl('/tabs/profile/display/' + id)
  }

  skipSlide(){
    this.slides.slideNext();
  }

}
