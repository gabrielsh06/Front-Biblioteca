import { Component } from '@angular/core';
import {Donacion} from './donacion.ts';
import {SobreNosotros} from './Sobrenosotros/SobreNosotros.ts';
import {terminoscondiciones} from './TerminosyCondiciones/terminos-condiciones.ts';

@Component({
    selector: 'app-legal',
    imports: [Donacion, SobreNosotros, terminoscondiciones],
    templateUrl: './legal.html',
    styleUrl: './legal.scss',
})
export class Legal {}
