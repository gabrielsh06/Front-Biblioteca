import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'footer',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterClass {
myj = {nombre:"Libreria purpure"};
drw = {message:"*************"+
             "\n**-*******-**"+
             "\n*---*****---*"+
             "\n-+++-----+++-"+
             "\n-++00+++00++-"
             "\n-++00+^+00++-"+
             "\n-+++++=+++++-"
             "\n-------------"};
sumar(a:number, b:number): number{
return (a+b);
}

getstring(a:number): string{
return String(a);
}

  
getnumber(a: string): number{
return Number(a);
}  
  
multiplicar(a:number, b:number):number{
return (a*b);
}
  
dividir(a:number, b:number):number{
return (a/b);
}  
  
}

