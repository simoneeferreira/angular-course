import { Component, OnInit, Input, ViewChild, Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { subscribeOn } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { visibility } from '../animations/app.animation';
import { flyInOut, expand } from '../animations/app.animation';

@Component({
selector: 'app-dishdetail',
templateUrl: './dishdetail.component.html',
styleUrls: ['./dishdetail.component.scss'],
animations: [
  visibility(),
  flyInOut(),
  expand()
],
// tslint:disable-next-line: no-host-metadata-property
host: {
  '[@flyInOut]': 'true',
  style: 'display: block;'
  }

})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;

  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('fform') commentFormDirective;
  dishcopy: Dish;
  visibility = 'shown';

  formErrors = {
    author: '',
    comment: '',
  };

  validatorMessages = {
    author: {
      required:      'Name is required.',
      minlength:     'Name must be at least 2 characters long.',
    },
    comment: {
      required:      'Comment is required.',
      minlength:     'Last Name must be at least 2 characters long.',
    },
  };

  constructor(private dishservice: DishService,
              private route: ActivatedRoute,
              private location: Location,
              private fb: FormBuilder,
              @Inject('baseURL') private baseURL) {

              }


  // tslint:disable-next-line: typedef
  ngOnInit() {
    this.createForm();
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    // tslint:disable-next-line: no-string-literal
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      errmess => this.errMess = <any>errmess);

  }

  // tslint:disable-next-line: typedef
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  // tslint:disable-next-line: typedef

  // tslint:disable-next-line: typedef
  formatLabel(value: number) {
    if (value >= 1) {
      return value;
    }
    return value;
  }

  createForm(): void {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: '5',
      date: '',
      // tslint:disable-next-line: no-unused-expression
      comment: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now

  }
  // tslint:disable-next-line: typedef
  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validatorMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  // tslint:disable-next-line: typedef
  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = (new Date()).toISOString();
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    console.log(this.comment);
    this.commentForm.reset({
      name: '',
      comment: '',
      rating: '5',
      date: ''
    });
    this.commentFormDirective.resetForm();
  }
}
