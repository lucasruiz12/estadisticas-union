# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase

La aplicacion usa Firebase de forma opcional. Si `.env` no tiene todas las variables `VITE_FIREBASE_*`, continua usando los JSON locales y las credenciales ficticias de desarrollo. Con la configuracion completa, usa Firebase Authentication y Firestore.

### Configuracion local

1. En Firebase Console, abre `estadisticas-voley`.
2. Agrega una aplicacion web desde Project settings > Your apps.
3. Copia la configuracion del SDK en `.env` usando las claves de `.env.example`.
4. En Authentication > Sign-in method, habilita Email/Password.
5. Para el primer usuario, crea en Authentication > Users el email tecnico generado desde su usuario. Por ejemplo, `juan.perez` se convierte en `juan.perez@estadisticas-voley.firebaseapp.com`.
6. Crea Firestore Database en modo produccion y publica `firestore.rules`.
7. Carga documentos con estas colecciones:

- `equipos`: documento `union-electrica`, campos `nombre`, `codigo`, `activo`.
- `jugadores`: documento con el codigo actual del jugador, campos del perfil y `teamId` apuntando a `union-electrica`.
- `registros`: un documento por registro estadistico, conservando los campos `F`, `R`, `Fa`, `J`, `Fu`, `T`, `E` y `Er`.

Por ahora el cliente solo lee Firestore. Las escrituras estan bloqueadas en las reglas hasta implementar el panel de profesores y sus roles.

La aplicacion muestra usuario y contraseña, pero Firebase Auth recibe internamente un email tecnico. Esto permite conservar el proveedor nativo Email/Password sin exponer emails a los jugadores.

### Pendiente de Firebase

- Proporcionar la configuracion de la aplicacion web: `apiKey`, `authDomain`, `storageBucket`, `messagingSenderId` y `appId`.
- Habilitar Email/Password.
- Crear el usuario inicial usando el email tecnico derivado de su nombre de usuario.
- Crear Firestore y publicar las reglas.
- Para crear usuarios desde la plataforma, agregar una Cloud Function o backend con Firebase Admin SDK. Nunca se debe usar el Admin SDK ni una clave privada en el frontend.
- Los documentos de `jugadores` pueden conservar el codigo actual como ID para mantener la relacion con `registros.playerId`.
- No se usa una coleccion `torneos`: el listado de torneos se deriva de `registros.fase` en memoria.

### Usuarios de jugadores

El username inicial se genera con el primer nombre y el apellido sin espacios ni acentos:

- `Sofía Miguel` -> `sofia.miguel`
- `Milagros Belén Luján` -> `milagros.lujan`
- `Candela Amiel Galvan Di Leo` -> `candela.galvandileo`

La contraseña inicial será el DNI normalizado a números. Es una contraseña temporal y deberá reemplazarse por un flujo de cambio o recuperación antes de usar el sistema en producción.

### Importador administrativo

La pestaña `ADMINISTRACIÓN` permite importar JSON o CSV. Para JSON de jugadores se admite tanto un array como el formato actual de `profiles.json`:

```json
[
	{
		"id": "1Ieo9cImZEXIlqUWy1Pu",
		"apellido": "PRUEBA",
		"nombreOnly": "Jugador",
		"nombre": "Jugador PRUEBA",
		"pos": "Punta",
		"edad": 15,
		"teamId": "ID_DEL_EQUIPO",
		"fotoUrl": "https://dominio-publico.example/jugador.jpg"
	}
]
```

Para `usuarios`, `id` debe ser el UID que ya existe en Firebase Authentication. La importacion no crea cuentas Auth; solo crea o actualiza el perfil Firestore:

```json
[
	{
		"id": "UID_DE_AUTH",
		"username": "jugador",
		"rol": "jugador",
		"playerId": "ID_DEL_JUGADOR",
		"teamIds": ["ID_DEL_EQUIPO"],
		"activo": true
	}
]
```

Para CSV, la primera fila debe contener los nombres de los campos. Los campos `T`, `P`, `Er` y `edad` se convierten a numero; `teamIds` acepta IDs separados por coma.

### Registros estadisticos

Los registros usan nombres descriptivos. El archivo local `src/data/records.json` ya esta normalizado y puede importarse directamente en `registros`:

```json
{
	"fecha": "2026-08-17",
	"rival": "ONCATIVO",
	"fase": "PLAYOFF - CUARTOS",
	"playerId": "MIGUEL S.",
	"fundamento": "Levantada",
	"totalAcciones": 3,
	"eficiencia": "100%",
	"puntos": 0,
	"errores": 0,
	"teamId": "ID_DEL_EQUIPO"
}
```

La aplicacion sigue pudiendo leer registros legacy con `F`, `R`, `Fa`, `J`, `Fu`, `T`, `E`, `P` y `Er`, pero las nuevas importaciones se guardan con el esquema descriptivo.

El importador acepta los Excel exportados por la plataforma del profesor aunque se conviertan a CSV tabulado, separado por `;` o separado por comas. Mapea `ID_Partido`, `Fecha`, `Equipo_Propio`, `Rival`, `Fase_Torneo`, `Fundamento`, `Jugador`, `Indice`, `E%`, `Tot`, los seis resultados simbolicos, `Nro_Jugador` y sus porcentajes. En esta etapa `#` se toma como puntos y `=` como errores, manteniendo tambien todos los conteos y porcentajes individuales.
