# Pulso · Emergencias hospitalarias

Prototipo académico de gestión de emergencias. Usa cuentas y pacientes de práctica. La muestra inicial incluye **120 pacientes** con nombres, procedencia, sexo, edad y diagnósticos estilo D2.

## Ejecutar con Visual Studio Code y Live Server

1. En Visual Studio Code, selecciona **Archivo → Abrir carpeta** y elige la carpeta que contiene `index.html`.
2. Con la extensión Live Server, haz clic derecho en `index.html` y selecciona **Open with Live Server**.
3. Inicia sesión con una cuenta de prueba. Los botones bajo **Cuentas de prueba** rellenan ambos campos.

Abre siempre el mismo origen local para conservar lo guardado. Los módulos JavaScript requieren un servidor HTTP local (no abras el HTML con `file://`).

## Cuentas de práctica

| Rol | Usuario | Contraseña | Permisos |
| --- | --- | --- | --- |
| Administrador | `admin` | `PulsoAdmin24` | Panel, cola, registro, estados e historial |
| Médico | `medico` | `PulsoMedico24` | Panel, cola, estados e historial |
| Recepcionista | `recepcion` | `PulsoRecepcion24` | Panel, cola y registro |

## Recorrido de prueba

1. Como administrador, registra un ingreso con DNI de ocho dígitos, por ejemplo `90000200`.
2. En **Cola de emergencias**, busca ese DNI, inicia y finaliza la atención.
3. En **Historial médico**, busca `90000001` (u otro DNI de la muestra) y agrega una observación.
4. Recarga la página y comprueba que la sesión y los datos siguen disponibles.

## Datos de pacientes

`hospitalizaciones.js` aporta 120 pacientes de práctica (nombre, sexo, edad, provincia, distrito y diagnóstico). `datos.js` genera ingresos con prioridades derivadas del diagnóstico y estados mixtos. Para regenerar la muestra: `python _generar_hospitalizaciones.py`. Luego borra `pulso.datos.v4` en Local Storage.

## Estructura

```text
index.html                Interfaz base, acceso y navegación
styles.css                Diseño responsive y estados visuales
app.js                    Navegación, formularios y eventos
vistas.js                 Plantillas, tablas y gráficos
datos.js                  Repositorio local, validaciones e indicadores
hospitalizaciones.js      Muestra D2 con nombres de práctica
_generar_hospitalizaciones.py  Regenera la muestra
README.md                 Ejecución y recorrido de prueba
```

## Persistencia e integración futura

Claves de almacenamiento: `pulso.datos.v4` y `pulso.sesion.v1`. Para empezar de cero, bórralas en el Local Storage del sitio.

Para desplegar en EC2 y probar fallos, sirve los estáticos con un servidor HTTP y, cuando integres API REST, sustituye las operaciones asíncronas de `repositorio` por `fetch` conservando el modelo de pacientes, ingresos y observaciones.
