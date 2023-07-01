import { UserService } from './../../../services/user.service';
import { User } from './../../../models/User';
import { RequestService } from './../../../services/request.service';
import { Platform, IonInfiniteScroll } from '@ionic/angular';
import { ToastService } from './../../../services/toast.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @ViewChild('infinitScroll') infinitScroll: IonInfiniteScroll;

  pageLoading = false;
  friends: User[];
  page: number;

  constructor(private requestService: RequestService, private platform: Platform, private toastService: ToastService,
              private userService: UserService){ }

  ngOnInit() {}

  ionViewWillEnter(){
    this.platform.ready()
    .then(() => this.getFriends(null))
    this.page = 0;
  }

  getFriends(event, refresh?){
    if(!event) this.pageLoading = true;
    if(refresh) this.page = 0;
    this.userService.getFriends(this.page++)
    .then(
      (resp: any) => {
        if(!event || refresh) this.friends = [];

        if(refresh) this.infinitScroll.disabled = false

        if(event){
          event.target.complete();
          if(!resp.data.more && !refresh) event.target.disabled = true;
        }

        resp.data.friends.forEach(usr => {
          this.friends.push(new User().initialize(usr));
        })

        this.pageLoading = false;
      },
      err => {
        console.log(err);
        this.pageLoading = false
      }
    )
  }
}
