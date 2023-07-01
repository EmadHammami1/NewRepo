import { User } from './../../../models/User';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import constants from 'src/app/helpers/constants';
import { ToastService } from './../../../services/toast.service';
import { ProductService } from './../../../services/product.service';
import { Product } from './../../../models/Product';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { DropDownComponent } from '../../drop-down/drop-down.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {

  pageLoading = false;
  product: Product
  productId: string;
  domain = constants.DOMAIN_URL;
  page: number = 1;
  user: User;

  constructor(private productService: ProductService, private route: ActivatedRoute, private popoverController: PopoverController,
              private toastService: ToastService, private alertCtrl: AlertController, private router: Router,
              private nativeStorage: NativeStorage) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.getProductId();
  }

  getProductId(){
    this.route.paramMap
    .subscribe(
      params => {
        this.productId = params.get('id');
        this.nativeStorage.getItem('user')
        .then(
          user => {
            this.user = new User().initialize(user)
            this.getProduct();
          }
        )
      }
    )
  }

  getProduct(event?){
    if(!event) this.pageLoading = true;
    this.productService.get(this.productId)
    .then(
      (resp: any) => {
        this.pageLoading = false;
        this.product = new Product(resp.data);
        console.log(this.product)
        this.page++;
        if(event) event.target.complete();
      },
      err => {
        this.pageLoading = false;
        console.log(err);
        if(event) event.target.complete();
        this.toastService.presentStdToastr(err)
      }
    )
  }

  removeProduct(){
    this.productService.remove(this.product.id)
    .then(
      (resp: any) => {
        console.log(resp);
        this.toastService.presentStdToastr(resp.message);
        this.router.navigateByUrl('/tabs/buy-and-sell/products/sell')
      },
      err => {
        console.log(err);
        this.toastService.presentStdToastr(err);
      }
    )
  }

  async removeConfirmation(){
    const alert = await this.alertCtrl.create({
      message: 'Do you really want to delete this product ?',
      header: 'Delete Product',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          cssClass: 'text-danger',
          handler: () => {
            this.removeProduct();
          }
        }
      ]
    });

    await alert.present();
  }

  markAsSold(){
    this.pageLoading = true;
    this.productService.sold(this.product.id)
    .then(
      (resp: any) => {
        this.toastService.presentStdToastr(resp.message)
        this.product.sold = true;
        this.pageLoading = false;
      },
      err => {
        this.toastService.presentStdToastr(err)
        this.pageLoading = false;
      }
    )
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
      if(data.event == 'report') this.reportPorduct();
    }
  }


  async reportPorduct(){
    const alert = await this.alertCtrl.create({
      header: 'Report ' + this.product.label,
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
            this.productService.report(this.product.id, message)
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
