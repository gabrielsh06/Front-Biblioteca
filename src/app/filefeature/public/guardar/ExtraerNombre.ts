import {Component} from "@angular/core";
@Component({
selector: 'extraer-nombre',
imports: [],
templateUrl: 'extraer-nombre.html',
styleUrl: 'extraer-nombre.scss'
})

export class ExtraerNombre{
datoslocales = {};

extraer(){
const datoGuardado= localStorage.getItem("SF");
const entregable = JSON.parse(datoGuardado);

this.datoslocales = entregable;
}

	recargar(){
	
	this.extraer();
	}
	
	
}