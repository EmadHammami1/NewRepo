import { ModalController } from '@ionic/angular';
import { Post } from './../../../../models/Post';
import { ToastService } from './../../../../services/toast.service';
import { ChannelService } from './../../../../services/channel.service';
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {
  @Input() channelId;

  anonyme = false;
  colors = [
    {
      background: '#ff9908',
      text: '#fff'
    },
    {
      background: '#9ec31b',
      text: '#fff'
    },
    {
      background: '#dd5f60',
      text: '#fff'
    },
    {
      background: '#06a4cb',
      text: '#fff'
    },
    {
      background: '#a3baa0',
      text: '#fff'
    },
    {
      background: '#babcb0',
      text: '#fff'
    }
  ];

  postLoading = false;

  postBackColor = "#fff";
  postTextColor = "#000";

  postText = "";

  constructor(private channelService: ChannelService, private toastService: ToastService, private modalCtrl:
              ModalController) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.postText = null;
    const randomInd = Math.round(Math.random() * (this.colors.length - 1))
    this.selectColor(this.colors[randomInd]);
  }

  addPost(){
    this.postLoading = true;
    this.channelService.storePost(this.channelId, {
      text: this.postText,
      backgroundColor: this.postBackColor,
      color: this.postTextColor,
      anonyme: this.anonyme
    })
    .then(
      (resp: any) => {
        this.postLoading = false;
        this.toastService.presentStdToastr(resp.message);
        this.postText = "";
        this.modalCtrl.dismiss({
          post: new Post().initialize(resp.data)
        })
      },
      err => {
        this.postLoading = false;
        this.toastService.presentStdToastr(err);
      }
    )
  }

  selectColor(color){
    this.postBackColor = color.background;
    this.postTextColor = color.text;
  }
}
