import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../features/public/footer/footer';

@Component({
  selector: 'app-public-layout',
  imports: [RouterModule, FooterComponent],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {}
