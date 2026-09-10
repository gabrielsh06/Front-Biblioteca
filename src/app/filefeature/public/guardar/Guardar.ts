

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
/* <GuardarDato> */
@Component({
  selector: 'GuardarDato',
  imports: [RouterModule],
templateUrl: 'Guardar.html',
styleUrl: 'guardar-stylo.scss'
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


