import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.scss'],
})
export class ListSearchComponent implements OnInit {

  @Input("data") data: string[] = [];
  @Input("title") title: string;

  paginatedData = [];
  perPage = 40;
  page = 0;


  filtredData: string[];
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.filtredData = this.data;
    this.paginatedData = this.filtredData.slice(0, this.perPage)
  }

  ngOnChanges(changes: SimpleChanges) {
      if(changes.data){
        this.filtredData = this.data;
        this.paginatedData = this.filtredData.slice(0, this.perPage)
      }
  }

  search(val: string){
    this.filtredData = this.data.filter(d => d.toUpperCase().startsWith(val.toUpperCase(), 0));
    this.paginatedData = this.filtredData.slice(0, this.perPage);
  }

  selectData(data: string){
    this.modalCtrl.dismiss({
      data
    })
  }

  loadMore(event){
    console.log(this.filtredData.slice(this.page * this.perPage, this.perPage))
    this.paginatedData = [...this.paginatedData, ...this.filtredData.slice(this.page * this.perPage, this.perPage)];
    console.log(this.paginatedData)
    event.target.complete();
  }

  dismiss(){
    this.modalCtrl.dismiss({data: ''})
  }
}
