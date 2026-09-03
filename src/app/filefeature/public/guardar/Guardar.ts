

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'GuardarDato',
  imports: [RouterModule],
template: `<label>Ingrese nombre</label> 
             <br>
<input #miInput (input)="inputnombre(miInput.value)">
             <br>
             <br>
<label>Ingrese codigo</label>
<input #mitwoInput (input)="InputDeviceInfo(mitwoInput.value)">
<br>
<button (click)="AccionarGuardado()">Guardar </button>
`

})
export class GuardadorAni {
grannombre = "";
contrasenna = "";
datoslocales = {};
inputnombre(vari: string){
this.grannombre = vari;
}
InputDeviceInfo(vari: string){
this.contrasenna = vari;
}


AccionarGuardado(){


const datos = {nombre: this.grannombre, cod: this.contrasenna};

localStorage.setItem("SF", JSON.stringify(datos));



}
extraer(){
const datoGuardado= localStorage.getItem("SF");
const entregable = JSON.parse(datoGuardado);

this.datoslocales = entregable;
}



}


