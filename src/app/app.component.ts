import { Component, OnInit } from '@angular/core';
import { PeopleService } from './odata-services/people.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  peopleResponse;

  constructor(private people: PeopleService) {
  }

  ngOnInit(): void {
    this.peopleResponse = this.people.Query().get('russellwhyte').exec();
  }

}
