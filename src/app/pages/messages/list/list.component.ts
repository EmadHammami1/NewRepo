import { MessageService } from './../../../services/message.service';
import { User } from './../../../models/User';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  page = 0
  pageLoading = false;
  users: User[];

  constructor(private messageService: MessageService) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.page = 0;
    this.getUsersMessages(null)
  }

  getUsersMessages(event, refresh?: boolean){
    if(!event) this.pageLoading = true;
    if(refresh) this.page = 0;
    this.messageService.usersMessages(this.page++)
    .then(
      (resp: any) => {
        this.pageLoading = false
        if(!event || refresh){
          this.users = [];
        }
        if(event){
          event.target.complete()
          if(!resp.data.more && !refresh) event.target.disabled = true;
        }

        console.log(resp.data.users);
        resp.data.users.forEach(usr => {
          this.users.push(new User().initialize(usr));
        })

      },
      err => {
        this.pageLoading = false
        console.log(err);
      }
    )
  }

}
