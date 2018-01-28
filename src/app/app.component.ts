import { Component, OnInit } from '@angular/core';
import { VersionsService } from './odata-services/version.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private versions: VersionsService) {
  }

  ngOnInit(): void {
    this.versions.Query().exec();
  }

}
