import { JobService } from './../../../../services/job.service';
import { Router } from '@angular/router';
import { ToastService } from './../../../../services/toast.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { UploadFileService } from './../../../../services/upload-file.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera/ngx';
import { Component, OnInit } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
import { ListSearchComponent } from 'src/app/pages/list-search/list-search.component';
import { AdMobFeeService } from './../../../../services/admobfree.service';

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.scss'],
})
export class JobFormComponent implements OnInit {

  countriesObject = {};
  countries: string[] = [];
  cities: string[] = [];
  selectedCountry: string;
  selectedCity: string;

  pageLoading = false;
  jobImage = {
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

  get email(){
    return this.form.get('email')
  }

  get description(){
    return this.form.get('description')
  }

  constructor(private camera: Camera, private formBuilder: FormBuilder, private uploadFile: UploadFileService, private nativeStorage: NativeStorage,
              private toastService: ToastService, private webView: WebView, private jobService: JobService,
              private router: Router, private modalController: ModalController, private adMobFeeService: AdMobFeeService) { }

  ngOnInit() {
    this.initializeForm();
  }

  ionViewWillEnter(){
  }

  initializeForm(){
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      company: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]]
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
        this.jobImage = {
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

  getJobForm(){
    const form: FormData = new FormData();
    form.append('title', this.title.value);
    form.append('company', this.company.value);
    form.append('email', this.email.value);
    form.append('country', this.selectedCountry);
    form.append('city', this.selectedCity);
    form.append('description', this.description.value);
    form.append('photo', this.jobImage.file, this.jobImage.name);
    return form;
  }

  clearJobForm(){
    this.form.patchValue({
      title: '',
      description: '',
      company: '',
      email: ''
    })
    this.jobImage = {
      url: "",
      file: null,
      name: ''
    }
  }

  submit(){
    if(!this.jobImage.file){
      this.toastService.presentStdToastr('Please select an image for the job')
      return
    }
    this.validatorErrors = {}
    this.pageLoading = true;
    this.jobService.store(this.getJobForm())
    .then(
      resp => {
        this.pageLoading = false;
        console.log(resp);
        this.toastService.presentStdToastr('job created successfully');
        this.router.navigateByUrl('/tabs/small-business/jobs');
        // this.adMobFeeService.showInterstitialAd();
        this.clearJobForm();
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
