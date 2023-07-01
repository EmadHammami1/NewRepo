import { IonInfiniteScroll } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from './../../../services/toast.service';
import { ProductService } from './../../../services/product.service';
import { Product } from './../../../models/Product';
import { Component, OnInit, ViewChild } from '@angular/core';
import constants from 'src/app/helpers/constants';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  @ViewChild('infinitScroll') infinitScroll: IonInfiniteScroll;

  pageLoading = false;
  products: Product[];
  domain = constants.DOMAIN_URL;
  page: number;
  searchQuery: string;
  type: string;

  constructor(private productService: ProductService, private toastService: ToastService, private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {}

  ionViewWillEnter(){
    this.pageLoading = true;
    this.searchQuery = "";
    this.page = 0;
    this.getPageType();
  }


  showProductForm(){
    this.pageLoading = true;
    this.productService.getStorePermession()
    .then(
      (resp: any) => {
        if(resp.data.date){
          this.router.navigate(['/tabs/subscription'], {
            queryParams: {
              lastDate: resp.data.date
            }
          });
        }else this.router.navigateByUrl('/tabs/buy-and-sell/product/form')
        this.pageLoading = false;
      },
      err => {
        console.log(err);
        this.pageLoading = false;
      }
    )
  }

  getPageType(){
    this.route.paramMap
    .subscribe(
      param => {
        this.type = param.get('type');
        this.page = 0;
        this.getProducts(null);
      }
    )
  }

  search(val: string){
    this.searchQuery = val;
    this.page = 0;
    this.getProducts(null);
  }

  handleResponse(event, refresh, resp: any){
    if(!event || refresh) this.products = [];

    resp.data.products.forEach(prd => {
      const product = new Product(prd);
      this.products.push(product);
    })

    if(refresh) this.infinitScroll.disabled = false

    if(event){
       event.target.complete();
       if(!resp.data.more && !refresh) event.target.disabled = true;
    }

    this.pageLoading = false;
    console.log(this.products);
  }

  handleError(err){
    console.log(err);
    this.pageLoading = false;
    this.toastService.presentStdToastr(err);
  }

  getProducts(event, refresh?){
    if(refresh) this.page = 0;
    if(this.type == 'sell'){
      this.productService.posted(this.page++, this.searchQuery)
      .then(
        resp => this.handleResponse(event, refresh, resp),
        err => this.handleError(err)
      );
    }else{
      this.productService.available(this.page++, this.searchQuery)
      .then(
        resp => this.handleResponse(event, refresh, resp),
        err => this.handleError(err)
      );
    }
  }

}
