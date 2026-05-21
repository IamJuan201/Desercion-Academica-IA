# Analizador de Deserción Académica


## Industria
**Educación Superior**


## Problemática
Muchos estudiantes universitarios desertan sin que los tutores lo detecten a tiempo. No existe una herramienta sencilla que analice múltiples factores de riesgo (académico, económico, emocional) y genere recomendaciones concretas.


## Solución
EduAlerta permite al tutor ingresar el perfil de un estudiante y obtiene con IA local (TinyLlama):
- Nivel de riesgo de deserción (Bajo / Medio / Alto / Crítico)
- Factores de riesgo identificados
- Recomendaciones de intervención
- Plan de seguimiento


## ¿Cómo correrlo?

### Paso 1 — Instala Node.js
Descárgalo de: https://nodejs.org (versión LTS)

### Paso 2 — Instala Ollama
Descárgalo de: https://ollama.com
Después de instalarlo, abre una terminal y escribe:
```
ollama serve
```
Déjalo corriendo en esa terminal.

### Paso 3 — Descarga TinyLlama
Abre OTRA terminal y escribe:
```
ollama pull tinyllama
```

### Paso 4 — Instala las dependencias del proyecto
Abre una terminal DENTRO de la carpeta del proyecto y escribe:
```
npm install
```

### Paso 5 — Corre la aplicación
En la misma terminal escribe:
```
npm run dev
```
Luego abre tu navegador en: **http://localhost:5173**

---


## ¿Para qué sirve Vite?
Vite es un servidor local que permite ver la aplicación en el navegador mientras se desarrollas. Es como un "puente" entre el código y el navegador. 


## Estructura del proyecto
```

DESERCION-ACADEMICA-IA/

├── index.html        ← La pantalla principal (formulario y resultados)

├── vite.config.js    ← Configuración de Vite

├── package.json      ← Lista de dependencias

├── src/

│   ├── main.js       ← Toda la lógica: leer formulario, llamar IA, mostrar resultado

│   └── style.css     ← Los estilos visuales

└── README.md         ← Este archivo

```
