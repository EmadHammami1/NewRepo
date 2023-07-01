import { Router } from '@angular/router';
import { UploadFileService } from './../../../../services/upload-file.service';
import { ServiceService } from './../../../../services/service.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastService } from './../../../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Component, OnInit } from '@angular/core';
import { ListSearchComponent } from 'src/app/pages/list-search/list-search.component';
import { ModalController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AdMobFeeService } from './../../../../services/admobfree.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss'],
})
export class ServiceFormComponent implements OnInit {


  countriesObject = {};
  countries: string[] = [];
  cities: string[] = [];
  selectedCountry: string;
  selectedCity: string;

  pageLoading = false;
  serviceImage = {
    url: "",
    file: null,
    name: ''
  };
  validatorErrors = {};
  form: FormGroup;
  imageLoading = false;

  get title(){
    return this.form.get('title')
  }

  get company(){
    return this.form.get('company')
  }

  get phone(){
    return this.form.get('phone')
  }

  get description(){
    return this.form.get('description')
  }

  constructor(private camera: Camera, private formBuilder: FormBuilder, private uploadFile: UploadFileService, private modalController: ModalController,
              private toastService: ToastService, private webView: WebView, private serviceService: ServiceService, private nativeStorage: NativeStorage,
              private router: Router, private adMobFeeService: AdMobFeeService) { }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(){
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      company: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern("^[+]?[(]?[0-9]{3}[)]?[- \.]?[0-9]{3}[- \.]?[0-9]{4,6}$"), Validators.maxLength(20)]]
    });

    this.nativeStorage.getItem('countries').then(resp => {
      this.countriesObject = JSON.parse(resp);
      this.countries = Object.keys(this.countriesObject);
    })
  }

  pickImage(){
    this.imageLoading = true;
    this.uploadFile.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY)
    .then(
      (resp: any) => {
        this.imageLoading = false;
        this.serviceImage = {
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

  getServiceForm(){
    const form: FormData = new FormData();
    form.append('title', this.title.value);
    form.append('company', this.company.value);
    form.append('phone', this.phone.value);
    form.append('country', this.selectedCountry);
    form.append('city', this.selectedCountry);
    form.append('description', this.description.value);
    form.append('photo', this.serviceImage.file, this.serviceImage.name);
    return form;
  }

  clearServiceForm(){
    this.form.patchValue({
      title: '',
      description: '',
      company: '',
      phone: ''
    })
    this.serviceImage = {
      url: "",
      file: null,
      name: ''
    }
  }

  submit(){
    if(!this.serviceImage.file){
      this.toastService.presentStdToastr('Please select an image for the service')
      return
    }
    this.validatorErrors = {}
    this.pageLoading = true;
    this.serviceService.store(this.getServiceForm())
    .then(
      resp => {
        this.pageLoading = false;
        console.log(resp);
        this.toastService.presentStdToastr('service created successfully');
        this.router.navigateByUrl('/tabs/small-business/services');
        // this.adMobFeeService.showInterstitialAd();
        this.clearServiceForm();
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


  async presentCountriesModal(){
    const result = await this.presentSearchListModal(this.countries, 'Countries');
    if(result){
      this.selectedCountry = result;
      this.cities = this.countriesObject[this.selectedCountry];
    }
  }

  async presentCitiesModal(){
    const result = await this.presentSearchListModal(this.cities, 'Cities');
    if(result){
      this.selectedCity = result;
    }
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

  isFormValid(form){
    return !form.valid || !this.selectedCountry || !this.selectedCountry
  }

}
