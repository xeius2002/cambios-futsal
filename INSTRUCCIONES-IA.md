# Instrucciones para la IA — app "Cambios Futsal"

> **Cómo usar este archivo:** cópialo entero y pégalo al principio de una conversación nueva con ChatGPT (o cualquier IA). Después, en otro mensaje, pega el trozo de `index.html` que quieras cambiar y explica qué quieres.

---

## Contexto para la IA

Eres un ayudante que modifica una app web pequeña. Lee todo esto antes de responder.

### Qué es la app
- App web para gestionar los cambios de un equipo de **fútbol sala** durante el partido. La usa el entrenador (Xavi) en el móvil, sin internet.
- Pantallas (todas en `index.html`, se muestran y ocultan con `show(nombre)`):
  - `screenHome`: Inicio.
  - `screenNew`: Nuevo partido (rival y fecha).
  - `screenMatch`: el partido.
  - `screenHist`: Histórico.
  - `screenSet`: Ajustes.
- Durante el partido:
  - con una pulsación larga sobre la ficha de un jugador en pista se apuntan ⚽ gol, 🅰️ asistencia, 🟨 o 🟥 (función `addEvent`);
  - "+ Gol rival" suma un gol en contra;
  - "+PP" suma un gol en propia del rival (a nuestro favor);
  - "⏸ Jugadores" (bajo el reloj) para solo los tiempos de los jugadores mientras el partido sigue (`S.pjPaused`);
  - "⇄" (esquina de la pista) gira el campo; en la 2ª parte se gira solo (`S.flip`, solo visual);
  - "Terminar" abre el resumen y guarda el partido en el histórico.
- Cada gol guarda quién estaba en pista (`pista` en el registro) y cada partido guarda `tramos` (quién estuvo en pista y cuánto rato). Con eso, Histórico → **Análisis** calcula el +/- de jugadores, parejas y cuartetos y en qué minutos se marca y se encaja.
- Funciona como app instalada (PWA). Está publicada en GitHub Pages: `https://xeius2002.github.io/cambios-futsal/`
- Muestra:
  - un cronómetro;
  - una pista con 5 jugadores (portero, 2 defensas y 2 atacantes);
  - el banquillo;
  - los minutos jugados y el cardio (minutos seguidos) de cada jugador;
  - una tarjeta con el próximo cambio sugerido.
- El partido se divide en 10 bloques. La app calcula un plan de rotaciones que respeta el cardio de cada jugador, sus posiciones y las reglas del entrenador. Si el entrenador se sale del plan, lo recalcula sola.
- Todo se guarda en el propio móvil (localStorage). No hay servidor ni base de datos. Hay tres claves:
  - `cambios-futsal-v5`: el partido en curso.
  - `cambios-futsal-ajustes`: los ajustes editados desde la app.
  - `cambios-futsal-historial`: los partidos guardados.

  El histórico se puede exportar a CSV (Excel) o como copia de seguridad JSON.

### Archivos
| Archivo | Qué es | ¿Se toca? |
|---|---|---|
| `index.html` | Toda la app: estilos, pantalla y lógica | Normalmente solo la sección CONFIGURACIÓN |
| `sw.js` | Hace que funcione sin internet | Solo cambiar `VERSION` en cada actualización |
| `manifest.webmanifest`, iconos `.png`, fuentes `.woff2` | Instalación y aspecto | No |
| `LEEME.txt` | Guía de uso | Opcional |

### La sección CONFIGURACIÓN (al principio del `<script>` de `index.html`)
**Importante:** jugadores, posiciones, cardio, referentes, portero y minutos se editan normalmente **desde la propia app (Inicio → Ajustes)**. La sección CONFIGURACIÓN del código son solo los **valores de fábrica**: se usan la primera vez o al pulsar "Restaurar valores de fábrica" en Ajustes. Si el móvil ya tiene ajustes guardados, cambiar CONFIGURACIÓN no tendrá efecto hasta restaurar.

Empieza con `CONFIGURACIÓN DEL EQUIPO` y termina con `FIN DE LA CONFIGURACIÓN`. Contiene:
- `portero`: nombre del portero (fijo, no rota).
- `minutosPorParte`: duración de cada parte. Los bloques se ajustan solos.
- `jugadores`: un objeto por jugador de campo con:
  - `nivel`: 1 bueno, 2 aceptable, 3 más flojo. **Nunca juegan dos de nivel 3 en la misma línea.**
  - `def` / `ata`: 0 = posición preferida, 1 = también puede, 3 = no juega ahí.
  - `cardio`: `[ideal, máximo]` en minutos seguidos.
  - `pos`: texto descriptivo.
- `referentes`: listas `defensa` y `ataque`. **Siempre debe haber al menos un referente en cada línea.** Los nombres deben coincidir exactamente con los de `jugadores`.

Si se cambia algo de la configuración, la app lo detecta sola. Deja de usar los 13 planes precalculados (`PLANS`) y calcula planes nuevos en el móvil. **No hace falta tocar `PLANS` ni `PLANS_CONFIG`.**

### Lo que NO debes tocar (salvo que se pida expresamente y se entienda bien)
- Todo lo que hay debajo de `FIN DE LA CONFIGURACIÓN`, sobre todo estas funciones: `buildPlan`, `planState`, `replanFromCourt`, `afterManualChange`, `pendingTarget`, `normalizeLines`, `changeSet`, `scenarioKey`, `doTap`, `tick`, `syncConfig`. Están probadas con cientos de partidos simulados y se rompen con facilidad.
- Las constantes `PLANS` y `PLANS_CONFIG`, que son líneas enormes.
- Las constantes `KEY='cambios-futsal-v5'`, `AJ_KEY` y `HIST_KEY`. Si cambian, se pierden los datos guardados en el móvil (incluido el histórico).
- El formato de los partidos guardados en el histórico, para no romper los que ya existen. Si hay que añadir un dato, añádelo como campo nuevo opcional.

### Cómo debes responder (MUY IMPORTANTE)
1. **Nunca devuelvas el archivo entero.** Es demasiado largo y se cortaría.
2. Da cada cambio como **BUSCAR / REEMPLAZAR**:
   - el texto exacto que hay que buscar (copiado tal cual del código, lo bastante largo para que sea único);
   - el texto nuevo que lo sustituye.
3. Haz el **mínimo cambio posible** y explica en una frase qué hace.
4. Recuerda siempre al final: **"En `sw.js` cambia `VERSION` al número siguiente"** (por ejemplo, de `cambios-futsal-8` a `cambios-futsal-9`).
5. Si el cambio pedido es grande o afecta a la lógica (planes, avisos, cálculo de minutos), dilo claramente y recomienda que lo haga Lucas.
6. Si no estás seguro del código actual, **pide que te peguen el trozo** en vez de inventarlo.

---

## Guía para Xavi: cómo hacer un cambio en GitHub

1. Entra en `https://github.com/xeius2002/cambios-futsal` (mejor desde el ordenador).
2. Pulsa `index.html` y luego el **lápiz** ✏️ (arriba a la derecha).
3. Busca con **Ctrl+F** (Cmd+F en Mac) el texto que te ha dado ChatGPT en "BUSCAR", sustitúyelo por el de "REEMPLAZAR" y pulsa **Commit changes**.
4. Abre `sw.js`, pulsa el lápiz, cambia `VERSION` al número siguiente y pulsa **Commit changes**.
5. Espera 2–5 minutos y abre la app en el móvil con internet. Ciérrala y vuelve a abrirla: ya tendrá la versión nueva.
6. **Pruébala** antes del partido:
   - pulsa Empezar;
   - haz un cambio;
   - mira la tarjeta de sugerencias y la pestaña Plan.

### Si algo se rompe
- En GitHub, entra en `index.html` y pulsa **History**. Ahí están todas las versiones anteriores.
- Abre la última que funcionaba, copia su contenido y pégalo con el lápiz (o pídeselo a Lucas).
- **Nunca hagas cambios el día de partido.**

### Lo que se cambia desde la propia app, SIN ChatGPT ni código
- **Inicio → Ajustes:**
  - jugadores (añadir, quitar, nombre, nivel, posición, cardio, referente);
  - portero;
  - minutos por parte;
  - copia de seguridad.
- **Durante el partido → Plantilla:** quién viene y el cardio de ese día.

### Ejemplos de lo que sí tiene sentido pedir a ChatGPT
- "Cambia el color del botón Nuevo partido a verde."
- "En el histórico, añade una columna con los goles por partido de cada jugador."
- "Cambia el texto 'Terminar' por 'Final'."
- Cambios grandes (nuevas estadísticas, cambiar cómo se calculan los planes) → mejor que los haga Lucas.
