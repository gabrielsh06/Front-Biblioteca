import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../footer/footer';
import { Navbar } from '../../navbar/navbar';

@Component({
    selector: 'app-public-layout',
    imports: [RouterModule, FooterComponent, Navbar],
    templateUrl: './public-layout.html',
    styleUrl: './public-layout.scss',
})
export class PublicLayout {}
