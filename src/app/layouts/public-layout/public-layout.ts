import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../features/public/footer/footer';
import { HeaderComponent } from '../../features/public/header/header';

@Component({
  selector: 'app-public-layout',
  imports: [RouterModule, FooterComponent, HeaderComponent],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {}
