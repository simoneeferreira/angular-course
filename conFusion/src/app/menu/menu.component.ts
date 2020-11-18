import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
// tslint:disable-next-line: whitespace
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})

export class MenuComponent implements OnInit {

  dishes: Dish[];
  errMess: string;


  constructor(private dishService: DishService,
              @Inject('baseURL') private baseURL) { }

  // tslint:disable-next-line: typedef
  ngOnInit() {
    this.dishService.getDishes().subscribe(dishes => this.dishes = dishes,
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      errmess => this.errMess = <any>errmess);
  }

}
