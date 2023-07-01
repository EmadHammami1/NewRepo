import { MessengerService } from './../../messenger.service';
import { ListSearchComponent } from './../../list-search/list-search.component';
import { ToastService } from './../../../services/toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AuthService } from './../../../services/auth.service';
import { UserService } from './../../../services/user.service';
import { User } from './../../../models/User';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {

  countriesObject = {};
  countries: string[] = [];
  cities: string[] = [];
  interests: string[] = [];
  professions: string[] = [];
  educations: string[] = [];

  selectedCountry: string;
  selectedCity: string;
  selectedProfession: string;
  selectedInterests: string[] = [];

  pageLoading = false;
  user: User;

  validatoErrors = {};
  form: FormGroup;

  get firstName(){
    return this.form.get('firstName')
  }
  get lastName(){
    return this.form.get('lastName')
  }
  get gender(){
    return this.form.get('gender')
  }
  get birthDate(){
    return this.form.get('birthDate')
  }
  get school(){
    return this.form.get('school')
  }
  get education(){
    return this.form.get('education')
  }

  constructor(private userService: UserService, private router: Router, private auth: AuthService, private messengerService: MessengerService,
              private nativeStorage: NativeStorage, private formBuilder: FormBuilder,
              private toastService: ToastService, private modalController: ModalController) { }

  ngOnInit() {
    this.getUser();
    this.intiializeForm();
  }

  intiializeForm(){
    this.form = this.formBuilder.group({
      firstName:  ['', [Validators.required, Validators.max(50)]],
      lastName:  ['', [Validators.required, Validators.max(50)]],
      gender:  ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      address: ['', [Validators.max(255)]],
      school:  ['', [Validators.max(50)]],
      education:  ['', [Validators.max(30)]]
    })
    this.nativeStorage.getItem('countries').then(resp => {
      this.countriesObject = JSON.parse(resp);
      this.countries = Object.keys(this.countriesObject);
    })
    this.countries = Object.keys(this.countriesObject);
    this.nativeStorage.getItem('educations').then(resp => {
      this.educations = JSON.parse(resp);
    })
    this.nativeStorage.getItem('professions').then(resp => {
      this.professions = JSON.parse(resp);
    })
    this.nativeStorage.getItem('interests').then(resp => {
      this.interests = JSON.parse(resp);
    })

  }

  formPatchValues(){
    this.form.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      gender: this.user.gender,
      birthDate: this.user.birthDate.toJSON() ? this.user.birthDate.toJSON().slice(0, 10) : null,
      school: this.user.school,
      education: this.user.education,
    });
    this.selectedCountry = this.user.country;
    if(this.user.country && this.countriesObject[this.user.country])
      this.cities = this.countriesObject[this.user.country];
    this.selectedCity = this.user.city;
    this.selectedProfession = this.user.profession;
    this.selectedInterests = this.user.interests;
  }

  getUserForm(){
    return {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      gender: this.gender.value,
      birthDate: this.birthDate.value,
      city: this.selectedCity,
      country: this.selectedCountry,
      school: this.school.value,
      profession: this.selectedProfession,
      education: this.education.value,
      interests: this.selectedInterests
    }
  }

  addInterest(interest: string){
    if(!this.selectedInterests.includes(interest)){
      this.selectedInterests.push(interest);
      if(this.selectedInterests) this.sortInterests();
    }
  }

  public removeInterest(ind: number): void{
    this.selectedInterests.splice(ind, 1);
    this.sortInterests();
  }

  private sortInterests(){
    this.selectedInterests = this.selectedInterests.sort((int1, int2) => {
      return int1.length - int2.length;
    })
  }

  submit(){
    this.pageLoading = true;
    this.userService.update(this.getUserForm())
    .then(
      resp => {
        this.pageLoading = false;
        this.toastService.presentStdToastr('updated successfully')
      }, err => {
        this.pageLoading = false;
        if(err.errors){
          this.validatoErrors = err.errors;
          this.toastService.presentStdToastr('invalid data');
        }else if(typeof err == 'string'){
          this.toastService.presentStdToastr(err);
        }
        console.log(err);
      }
    )
  }

  getUser(){
    this.pageLoading = true;
    this.auth.getAuthUser()
    .then(
      (resp: any) => {
        this.user = new User().initialize(resp.data);
        this.formPatchValues();
        this.messengerService.sendMessage({event: 'update-user'});
        console.log(this.user);
        this.pageLoading = false;
      },
      err => {
        this.pageLoading = false;
        console.log(err);
        this.toastService.presentStdToastr('enexpected error occured, please try again later')
      }
    )
  }

  async presentCountriesModal(){
    const result = await this.presentSearchListModal(this.countries, 'Countries');
    if(result){
      this.selectedCountry = result;
      this.cities = this.countriesObject[this.selectedCountry];
      this.selectedCity = undefined;
    }
  }

  async presentCitiesModal(){
    const result = await this.presentSearchListModal(this.cities, 'Cities');
    if(result){
      this.selectedCity = result;
    }
  }

  async presentProfessionsModal(){
    const result = await this.presentSearchListModal(this.professions, 'Professions');
    if(result){
      this.selectedProfession = result;
    }
  }

  async presentInterestsModal(){
    const result = await this.presentSearchListModal(this.interests, 'Interests');
    if(result){
      this.addInterest(result);
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

  getMaxDate(){
    const currDate = new Date();
    currDate.setFullYear(currDate.getFullYear() - 18);
    return currDate.toJSON().slice(0, 10);
  }

}
