import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AlertController, PopoverController } from '@ionic/angular';
import { ToastService } from './../../../../services/toast.service';
import { ServiceService } from './../../../../services/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from './../../../../models/User';
import constants from 'src/app/helpers/constants';
import { Service } from './../../../../models/Service';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { DropDownComponent } from 'src/app/pages/drop-down/drop-down.component';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
})
export class ServiceComponent implements OnInit {

  pageLoading = false;
  service: Service;
  serviceId: string;
  domain = constants.DOMAIN_URL;
  page: number = 1;
  user: User;

  constructor(private serviceService: ServiceService, private route: ActivatedRoute, private popoverController: PopoverController,
              private toastService: ToastService, private alertCtrl: AlertController,
              private router: Router, private nativeStorage: NativeStorage, private callNumber: CallNumber) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.getServiceId();
  }

  getServiceId(){
    this.route.paramMap
    .subscribe(
      params => {
        this.serviceId = params.get('id');
        this.nativeStorage.getItem('user')
        .then(
          user => {
            this.user = new User().initialize(user)
            this.getService();
          }
        )
      }
    )
  }

  getService(){
    this.pageLoading = true;
    this.serviceService.get(this.serviceId)
    .then(
      (resp: any) => {
        this.pageLoading = false;
        this.service = new Service(resp.data);
        this.page++;
        console.log(this.service);
      },
      err => {
        this.pageLoading = false;
        console.log(err);
        this.toastService.presentStdToastr(err)
      }
    )
  }

  removeService(){
    this.serviceService.remove(this.service.id)
    .then(
      (resp: any) => {
        console.log(resp);
        this.toastService.presentStdToastr(resp.message);
        this.router.navigateByUrl('/tabs/small-business/services/list/posted')
      },
      err => {
        console.log(err);
        this.toastService.presentStdToastr(err);
      }
    )
  }

  async removeConfirmation(){
    const alert = await this.alertCtrl.create({
      message: 'Do you really want to delete this service ?',
      header: 'Delete Service',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          cssClass: 'text-danger',
          handler: () => {
            this.removeService();
          }
        }
      ]
    });

    await alert.present();
  }

  call(){
    this.callNumber.callNumber(this.service.phone, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => this.toastService.presentStdToastr('Cannot make this call'));
  }

  async presentPopover(ev: any) {
    const popoverItems = [
      {
        text: 'Report',
        icon: 'fas fa-exclamation-triangle',
        event: 'report'
      }
    ]
    const popover = await this.popoverController.create({
      component: DropDownComponent,
      event: ev,
      cssClass: 'dropdown-popover',
      showBackdrop: false,
      componentProps: {
        items: popoverItems
      }
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    if(data && data.event){
      if(data.event == 'report') this.reportService();
    }
  }

  
  async reportService(){
    const alert = await this.alertCtrl.create({
      header: 'Report Job',
      inputs: [
        {
          type: 'text',
          name: 'message',
          placeholder: 'Message'
        }
      ],
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel'
        },
        {
          text: 'SEND',
          cssClass: 'text-danger',
          handler: (val) => {
            const message = val.message
            this.serviceService.report(this.service.id, message)
            .then(
              (resp: any) => {
                this.toastService.presentStdToastr(resp.message)
              },
              err => {
                this.toastService.presentStdToastr(err)
              }
            )
          }
        }
      ]
    })
    await alert.present();
  }

}
