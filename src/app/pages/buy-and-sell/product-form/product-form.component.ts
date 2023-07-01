import { ProductService } from './../../../services/product.service';
import { ToastService } from './../../../services/toast.service';
import { UploadFileService } from './../../../services/upload-file.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera/ngx';
import { Component, OnInit } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ListSearchComponent } from '../../list-search/list-search.component';
import { ModalController } from '@ionic/angular';
import { AdMobFeeService } from './../../../services/admobfree.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {

  pageLoading = false;
  productImage = {
    url: "",
    file: null,
    name: ''
  };
  validatorErrors = {};
  form: FormGroup;
  imageLoading = false;

  currencies = [];
  selectedCurrency;

  get label(){
    return this.form.get('label')
  }

  get price(){
    return this.form.get('price')
  }

  get description(){
    return this.form.get('description')
  }

  constructor(private camera: Camera, private formBuilder: FormBuilder, private uploadFile: UploadFileService,
              private toastService: ToastService, private webView: WebView, private productService: ProductService,
              private router: Router, private nativeStorage: NativeStorage, private modalController: ModalController,
              private adMobFeeService: AdMobFeeService) { }

  ngOnInit(){
    this.initializeForm();
  }

  ionViewWillEnter(){
  }

  initializeForm(){
    this.form = this.formBuilder.group({
      label: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      price: ['', [Validators.required, Validators.maxLength(12)]]
    });
    this.nativeStorage.getItem('currencies').then(resp => {
      this.currencies = Object.keys(JSON.parse(resp))
    })
  }

  pickImage(){
    this.imageLoading = true;
    this.uploadFile.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY)
    .then(
      (resp: any) => {
        this.imageLoading = false;
        this.productImage = {
          url: this.webView.convertFileSrc(resp.imageData),
          file: resp.file,
          name: resp.name
        }
      },
      err => {
        this.imageLoading = false;
        this.toastService.presentStdToastr(err);
      }
    )
  }

  getProductForm(){
    const form: FormData = new FormData();
    form.append('label', this.label.value);
    form.append('price', this.price.value);
    form.append('currency', this.selectedCurrency);
    form.append('description', this.description.value);
    form.append('photo', this.productImage.file, this.productImage.name);
    return form;
  }

  clearProductForm(){
    this.form.patchValue({
      label: '',
      description: '',
      price: ''
    })
    this.productImage = {
      url: "",
      file: null,
      name: ''
    }
  }

  submit(){
    if(!this.productImage.file){
      this.toastService.presentStdToastr('Please select an image for your product')
      return
    }
    this.validatorErrors = {}
    this.pageLoading = true;
    this.productService.store(this.getProductForm())
    .then(
      (resp: any) => {
        this.pageLoading = false;
        this.toastService.presentStdToastr('product created successfully');
        this.router.navigateByUrl('/tabs/buy-and-sell/products/sell');
        // this.adMobFeeService.showInterstitialAd();
        this.clearProductForm();
      },
      err => {
        this.pageLoading = false;
        if(err.errors){
          this.validatorErrors = err.errors;
        }
        if(typeof err == 'string'){
          this.toastService.presentStdToastr(err);
        }
        console.log(err);
      }
    )
  }

  async presentCurrenciesModal(){
    const result = await this.presentSearchListModal(this.currencies, 'Currencies');
    if(result) this.selectedCurrency = result;
  }

  async presentSearchListModal(list: any, title: string){
    const modal = await this.modalController.create({
      componentProps: {
        data: list,
        title
      },
      component: ListSearchComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    return data.data;
  }
}
