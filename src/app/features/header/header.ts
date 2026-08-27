import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Aquí puedes agregar variables como el contador del carrito o el estado del usuario
  cartItemCount: number = 0;
  
  onSearch(term: string) {
    console.log('Buscando:', term);
    // Lógica de búsqueda
  }
}