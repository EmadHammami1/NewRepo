import { User } from 'src/app/models/User';
import { IonInfiniteScroll } from '@ionic/angular';
import { Comment } from '../../../../models/Comment';
import { ToastService } from './../../../../services/toast.service';
import { ChannelService } from './../../../../services/channel.service';
import { Post } from './../../../../models/Post';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {

  @ViewChild('infinitScroll') infinitScroll: IonInfiniteScroll;

  @Output() addComment = new EventEmitter();
  post: Post;
  postId: string;
  user: User;

  anonyme = false;

  commentText = "";

  comments: Comment[];

  page = 0;
  pageLoading = false;

  constructor(private channelService: ChannelService, private toastService: ToastService, private route: ActivatedRoute, private nativeStorage: NativeStorage) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.pageLoading = true;
    this.getPostId();
    // this.getComments();
  }

  getPostId(){
    this.route.paramMap.subscribe(
      params => {
        this.postId = params.get('id');
        this.nativeStorage.getItem('user')
        .then(
          user => {
            this.user = new User().initialize(user);
            this.getPost()
          }
        )
      }
    )
  }

  getPost(){
    this.channelService.getPost(this.postId).then(
      (resp: any) => {
        this.post = new Post().initialize(resp.data);
        this.getComments(null, true);
      },
      err => {
        this.pageLoading = false;
        this.toastService.presentStdToastr(err);
      }
    )
  }

  getComments(event?, refresh?){
    if(!event) this.pageLoading = true;
    if(refresh) this.page = 0;
    this.channelService.getComments(this.post.id)
    .then(
      (resp: any) => {
        console.log(resp);

        if(!event || refresh){
          this.comments = [];
        }

        if(refresh) this.infinitScroll.disabled = false

        if(event){
          event.target.complete()
          if(!resp.data.more && !refresh) event.target.disabled = true;
        }
        resp.data.comments.forEach(cmt => {
          this.comments.push(new Comment().initialize(cmt));
        })
        this.pageLoading = false;
      },
      err => {
        this.pageLoading = false;
        this.toastService.presentStdToastr(err);
      }
    )
  }

  storeComment(){
    if(!this.commentText.length) return;
    this.channelService.storeComment(this.post.id, {text: this.commentText, anonyme: this.anonyme})
    .then(
      (resp: any) => {
        this.comments.unshift(new Comment().initialize(resp.data))
        this.commentText = "";
      },
      err => {
        this.toastService.presentStdToastr(err);
      }
    )
  }

  removeComment(commentInd: number){
    this.comments.splice(commentInd, 1);
  }
}
