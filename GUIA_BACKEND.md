# Backend — estado final verificado

Documento de cierre de la integración entre el front Angular y el backend Spring Boot.

- **Backend:** `https://back-biblioteca-ytgd.onrender.com`
- **Front:** Angular, consume `/api` con JWT Bearer.
- **Admin de prueba:** `admin@gmail.com` / `admin123`

---

## 1. Verificado contra Render

Todo esto se probó con curl usando el backend real:

### Libros

- Listar, buscar, filtrar por categoría, ordenar y paginar.
- Crear, editar y eliminar.
- **ISBN duplicado al crear → `409`.** Corregido.
- **ISBN duplicado al editar → `409`.** Corregido.
- Conservar el propio ISBN al editar → `200`.
- Lookup de ISBN con token.
- Eliminar un libro con préstamo activo → `409` con mensaje legible. Corregido.
- Validaciones: `pages: 0` o categoría vacía → `400` con `message` y `errors`.

### Préstamos y stock

- Crear préstamo y devolverlo.
- El stock se descuenta al prestar.
- Con stock 0 el libro pasa a `CHECKED_OUT`.
- Al devolver se restaura el stock y el libro vuelve a `AVAILABLE`.
- Préstamo duplicado activo → `409`.
- Libro `IN_LIBRARY` → `409`.
- Libro con stock 0 → `409`.
- Permisos: sin token → `401`; cliente en endpoints admin → `403`.

### Usuarios

- `GET /api/users` ya no devuelve `password`.
- Registro público con `"role": "ADMIN"` → se guarda como `CUSTOMER`.
- **Activar/suspender con `PUT /api/users/{id}` y `state`.** Corregido.
- Un usuario suspendido no puede iniciar sesión (`401`).
- Al reactivarlo puede iniciar sesión de nuevo.
- Editar nombre, apellidos, correo y estado.
- `DELETE /api/users/{id}` ahora desactiva el usuario (`state: false`) en vez de borrarlo
  físicamente.

### Donaciones

- Crear donación pública.
- Listar, consultar y filtrar por estado.
- Aprobar y rechazar.
- **`DELETE /api/admin/donations/{id}` → `204`; inexistente → `404`.** Corregido.
- **`reviewedBy` devuelve el email del admin** en registros nuevos. Corregido.
- Se eliminó la donación de prueba que había quedado.

### Autenticación y errores

- Login correcto e incorrecto (`401`).
- `forgot-password` responde genérico exista o no el correo.
- `reset-password` con token inválido → `400` con mensaje.
- Ruta inexistente → `404` con `message`.
- CORS correcto para `http://localhost:4200`.

---

## 2. Verificaciones manuales pendientes

Estas dependen del entorno y no se pueden probar solo con el front/API:

### 2.1. Correo real de recuperación

- [ ] Confirmar variables SMTP en Render.
- [ ] Solicitar recuperación con un correo real.
- [ ] Revisar que el correo llegue (incluida la carpeta de spam).
- [ ] Confirmar que el enlace apunte a:

```text
https://<dominio-del-front>/restablecer-password?token=<token>
```

- [ ] Confirmar que el token sirve una sola vez.
- [ ] Confirmar que vence.
- [ ] Cambiar la contraseña e iniciar sesión con la nueva.

El front acepta también `/reset-password` y token por ruta, por si el enlace usa otra forma.

### 2.2. Préstamos vencidos (`OVERDUE`)

No se puede crear un préstamo con fecha pasada desde la API. Para comprobarlo:

1. Crear un préstamo.
2. En la base de datos, cambiar su `due_date` a una fecha anterior a hoy.
3. Llamar:

```bash
curl "$BASE/api/loans/my-loans" -H "Authorization: Bearer $TOKEN"
curl "$BASE/api/admin/loans" -H "Authorization: Bearer $TOKEN"
curl "$BASE/api/admin/loans/overdue" -H "Authorization: Bearer $TOKEN"
```

El préstamo debe aparecer con `status: "OVERDUE"`.

### 2.3. CORS de producción

Cuando se despliegue el front, agregar su dominio exacto a los orígenes permitidos:

```text
https://<dominio-del-front>
```

Mantener `localhost:4200` para desarrollo.

---

## 3. Datos de prueba que quedaron

### Préstamos

No existe endpoint para eliminarlos. Quedaron tres préstamos de prueba, todos `RETURNED`:

- `id 1`
- `id 2`
- `id 3`

Se pueden borrar directo en la base de datos o agregar:

```http
DELETE /api/admin/loans/{id}
Authorization: Bearer <token ADMIN>
```

### Usuarios inactivos

`DELETE /api/users/{id}` ahora hace desactivación lógica. Quedaron usuarios de prueba con
`state: false`. Se ven en el filtro “Inactivos” del admin:

- `test_biblioteca_tmp@example.com`
- `registro_tmp_biblioteca@example.com`
- `hack_admin_tmp@example.com`
- `temp_cliente_front@example.com`
- `audit_customer_tmp@example.com`
- `state_test_tmp@example.com`

No afectan al funcionamiento. Para limpiarlos haría falta borrado físico directo en la BD.

### Donaciones

Sin registros de prueba: la donación que había fue eliminada con el nuevo endpoint.

### Libros

Solo queda el libro real:

- `Tokio blues` — ISBN `9788483103074`

---

## 4. Detalle menor

Un método HTTP no soportado devuelve `404` en lugar de `405`. No afecta al front porque no usa
métodos no soportados. Si se quiere afinar, agregar un handler para
`HttpRequestMethodNotSupportedException`.

---

## 5. Front actualizado

El front ya está conectado a todo lo que el backend expone:

### Público

- Home, catálogo, detalle y reserva.
- Login y registro.
- Mis préstamos y devolución.
- Donar libro con envío real.
- Recuperar contraseña.
- Restablecer contraseña con token.

### Admin

- Dashboard con datos reales y cola de donaciones real.
- Libros: listar, crear, editar, eliminar y autocompletar con OpenLibrary.
- Clientes: listar, crear, editar, activar/suspender y filtrar por estado.
- Préstamos: listar, filtrar y marcar devuelto.
- Donaciones: listar, aprobar, rechazar y eliminar.

`ng build` y los 6 tests pasan.

---

## 6. Opcional para más adelante

No bloquea la entrega:

- Favoritos persistentes (hoy son locales).
- Campos extendidos del libro (sinopsis, idioma, dimensiones).
- `DELETE /api/admin/loans/{id}` para limpiar préstamos.
- Borrado físico de usuarios inactivos.
- Devolver `405` para métodos no soportados.
