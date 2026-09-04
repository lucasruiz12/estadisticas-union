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
- Decidir si los documentos de `jugadores` tendran como ID el codigo actual o un ID generado. La implementacion actual admite ambos, pero recomienda conservar el codigo actual para mantener la relacion con `registros.J`.
