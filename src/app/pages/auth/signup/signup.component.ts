import { ListSearchComponent } from './../../list-search/list-search.component';
import { AuthService } from './../../../services/auth.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { TermsOfServiceComponent } from '../../terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from '../../privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  gender = "male";
  step = 0;
  steps = ['email', 'name', 'password', 'birthDate', 'gender', 'location', 'success']
  validationErrors = {};
  btnLoading = false;
  pageLoading = false;
  form: FormGroup

  countriesObject;
  countries: string[] = [];
  cities: string[] = [];
  selectedCountry: string;
  selectedCity: string;

  get firstName(){
    return this.form.get('firstName');
  }

  get lastName(){
    return this.form.get('lastName');
  }

  get email(){
    return this.form.get('email');
  }

  get password(){
    return this.form.get('password');
  }

  get password_confirmation(){
    return this.form.get('password_confirmation');
  }

  get birthDate(){
    return this.form.get('birthDate');
  }

  constructor(private router: Router, private auth: AuthService, private formBuilder: FormBuilder,private modalCtrl: ModalController,
              private cdr: ChangeDetectorRef, private modalController: ModalController, private nativeStorage: NativeStorage) { }

  ionViewWillEnter(){
    this.step = 0;
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(){
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.max(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z-_]+'), Validators.maxLength(40)]],
      lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z-_]+'), Validators.maxLength(40)]],
      birthDate: ['', [Validators.required]],
    })
    this.nativeStorage.getItem('countries').then(resp => {
      this.countriesObject = JSON.parse(resp);
      this.countries = Object.keys(this.countriesObject);
    })
  }

  continue(){
    if(this.steps[this.step] == 'email') this.verifyEmail();
    else if(this.step < this.steps.length - 2){
      this.validationErrors[this.steps[this.step]] = undefined;
      this.step++;
    }
    else this.submit()
  }

  back(){
    if(this.step > 0) this.step--;
    else this.router.navigate(['/auth/home'])
  }

  getUserInfo(){
    return {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      email: this.email.value,
      password: this.password.value,
      password_confirmation: this.password_confirmation.value,
      city: this.selectedCity,
      country: this.selectedCountry,
      gender: this.gender,
      birthDate: this.birthDate.value
    }
  }

  backToError(){
    for(let ind = 0; ind < this.steps.length; ++ind){
      const step = this.steps[ind]
      if(this.validationErrors[step] || (step == 'name' && (this.validationErrors['firstName'] || this.validationErrors['lastName']))){
        console.log("selected ind : " + ind);
        this.step = ind;
        break;
      }
    }
  }

  verifyEmail(){
    this.btnLoading = true;
    this.auth.verifyEmail(this.email.value)
    .then((resp: any) => {
      console.log(resp);
        this.btnLoading = false;
        this.cdr.detectChanges();
        if(!resp.data) ++this.step;
        else this.validationErrors['email'] = ['this email is already existe'];
    }, err => {
        this.btnLoading = false;
        if(err.errors) this.validationErrors = err.errors;
        else if(err.status == 500){

        }
    })
  }

  submit(){
    this.pageLoading = true
    this.validationErrors = {};
    this.auth.signup(this.getUserInfo())
    .then(resp => {
      this.pageLoading = false;
      this.step++;
    }, err => {
      this.pageLoading = false;
      if(err.errors){
        this.validationErrors = err.errors;
        this.backToError();
      }
    })
  }

  isValid(){
    if(this.steps[this.step] == 'name'){
      return this.firstName.valid && this.lastName.valid;
    }else if(this.steps[this.step] == 'password'){
      return this.password.valid && this.password.value === this.password_confirmation.value;
    }else if(this.steps[this.step] == 'location'){
      return this.selectedCountry && this.selectedCity;
    }else if(this.steps[this.step] != 'gender'){
      return this.form.get(this.steps[this.step]).valid;
    }
    return true
  }

  async presentCountriesModal(){
    const modal = await this.modalController.create({
      componentProps: {
        data: this.countries,
        title: 'Countries'
      },
      component: ListSearchComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    this.selectedCountry = data.data;
    this.cities = this.countriesObject[this.selectedCountry];
    console.log(this.cities);
  }

  async presentCitiesModal(){
    console.log('hi');
    const modal = await this.modalController.create({
      componentProps: {
        data: this.cities,
        title: 'Cities'
      },
      component: ListSearchComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('done');
    this.selectedCity = data.data;
  }

  getMaxDate(){
    const currDate = new Date();
    currDate.setFullYear(currDate.getFullYear() - 18);
    // alert(currDate.toJSON().slice(0, 10);)
    return currDate.toJSON().slice(0, 10);
  }
  async openPrivacyPolicy(){
    const modal = await this.modalCtrl.create({
      component: PrivacyPolicyComponent
    });

    await modal.present();
  }

  async openTermsOfService(){
    const modal = await this.modalCtrl.create({
      component: TermsOfServiceComponent
    });

    await modal.present();
  }
}
