import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommunModule} from '@angular/common';
@Component({
  selector: 'footer',
  imports: [RouterOutlet, CommunModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterClass {




}
