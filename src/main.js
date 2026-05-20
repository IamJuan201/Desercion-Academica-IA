// ======================================================
// main.js — Lógica de EduAlerta
// ======================================================
// Este archivo controla toda la aplicación:
// 1. Verifica que Ollama esté corriendo
// 2. Lee el formulario
// 3. Envía el prompt a TinyLlama
// 4. Muestra la respuesta
// ======================================================

// Modelo a usar — TinyLlama es liviano y corre bien en PCs normales
const MODELO = 'tinyllama'

// Variable para guardar el resultado actual
let ultimoResultado = null

// ======================================================
// Al cargar la página, verificar si Ollama está corriendo
// ======================================================
window.addEventListener('load', () => {
  verificarOllama()
  mostrarHistorial()
})

// ======================================================
// FUNCIÓN: Verificar si Ollama está corriendo
// ======================================================
async function verificarOllama() {
  const estadoDiv = document.getElementById('estado-modelo')

  try {
    // Le preguntamos a Ollama qué modelos tiene instalados
    const respuesta = await fetch('/ollama/api/tags')
    const datos = await respuesta.json()

    // Buscamos si TinyLlama está instalado
    const modelos = datos.models || []
    const tieneTinyllama = modelos.some(m => m.name.includes('tinyllama'))

    if (tieneTinyllama) {
      estadoDiv.textContent = '✅ TinyLlama listo'
      estadoDiv.className = 'estado online'
    } else {
      // Ollama corre pero no tiene TinyLlama
      const nombresModelos = modelos.map(m => m.name).join(', ')
      estadoDiv.textContent = `⚠️ TinyLlama no encontrado. Modelos: ${nombresModelos || 'ninguno'}`
      estadoDiv.className = 'estado offline'
    }

  } catch (error) {
    // Ollama no está corriendo
    estadoDiv.textContent = '❌ Ollama no está corriendo'
    estadoDiv.className = 'estado offline'
  }
}

// ======================================================
// FUNCIÓN: Analizar el estudiante con IA
// (Se llama desde el botón en HTML)
// ======================================================
window.analizarEstudiante = async function () {
  // 1. Leer los datos del formulario
  const nombre     = document.getElementById('nombre').value.trim()
  const semestre   = document.getElementById('semestre').value
  const programa   = document.getElementById('programa').value.trim()
  const promedio   = document.getElementById('promedio').value
  const asistencia = document.getElementById('asistencia').value
  const perdidas   = document.getElementById('perdidas').value
  const trabaja    = document.getElementById('trabaja').value
  const emocional  = document.getElementById('emocional').value
  const comentario = document.getElementById('comentario').value.trim()

  // 2. Validar que los campos principales estén llenos
  if (!nombre || !semestre || !programa) {
    alert('Por favor completa el nombre, semestre y programa del estudiante.')
    return
  }

  // 3. Construir el prompt para la IA
  const prompt = `Eres un experto en bienestar estudiantil universitario en Colombia. Analiza este perfil y detecta el riesgo de deserción académica.

DATOS DEL ESTUDIANTE:
- Nombre: ${nombre}
- Semestre: ${semestre}
- Programa: ${programa}
- Promedio: ${promedio || 'No especificado'} / 5.0
- Asistencia: ${asistencia || 'No especificado'}%
- Materias perdidas: ${perdidas || '0'}
- Situación laboral: ${trabaja || 'No especificado'}
- Estado emocional: ${emocional || 'No especificado'}
- Comentario: ${comentario || 'Ninguno'}

Responde en español con este formato exacto:

NIVEL DE RIESGO: [BAJO / MEDIO / ALTO / CRÍTICO]

FACTORES DE RIESGO:
- (lista los principales problemas detectados)

RECOMENDACIONES:
- (lista acciones concretas para el tutor)

SEGUIMIENTO:
(indica cada cuánto tiempo hacer seguimiento y cómo)`

  // 4. Mostrar la sección de resultado y el spinner
  const seccionResultado = document.getElementById('seccion-resultado')
  const divCargando      = document.getElementById('cargando')
  const divTexto         = document.getElementById('resultado-texto')
  const divAcciones      = document.getElementById('acciones')
  const btnAnalizar      = document.getElementById('btn-analizar')

  seccionResultado.style.display = 'flex'
  divCargando.style.display = 'flex'
  divTexto.textContent = ''
  divAcciones.style.display = 'none'
  btnAnalizar.disabled = true

  // Hace scroll hasta el resultado
  seccionResultado.scrollIntoView({ behavior: 'smooth' })

  try {
    // 5. Llamar a Ollama con el prompt
    const respuesta = await fetch('/ollama/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODELO,
        prompt: prompt,
        stream: false   // false = espera la respuesta completa (más simple)
      })
    })

    if (!respuesta.ok) {
      throw new Error(`Error de Ollama: ${respuesta.status}`)
    }

    // 6. Leer la respuesta
    const datos = await respuesta.json()
    const textoIA = datos.response

    // 7. Detectar el nivel de riesgo para guardarlo
    const nivelRiesgo = detectarRiesgo(textoIA)

    // 8. Guardar resultado para el botón "Guardar"
    ultimoResultado = {
      nombre,
      programa,
      semestre,
      promedio,
      asistencia,
      nivelRiesgo,
      textoIA,
      fecha: new Date().toLocaleString('es-CO')
    }

    // 9. Mostrar el resultado en pantalla
    divCargando.style.display = 'none'
    divTexto.textContent = textoIA
    divAcciones.style.display = 'flex'

  } catch (error) {
    divCargando.style.display = 'none'
    divTexto.textContent = `❌ Error: ${error.message}\n\nVerifica que Ollama esté corriendo (ollama serve) y que TinyLlama esté instalado (ollama pull tinyllama).`
  } finally {
    btnAnalizar.disabled = false
  }
}

// ======================================================
// FUNCIÓN: Detectar nivel de riesgo del texto
// ======================================================
function detectarRiesgo(texto) {
  const t = texto.toUpperCase()
  if (t.includes('CRÍTICO') || t.includes('CRITICO')) return 'critico'
  if (t.includes('ALTO')) return 'alto'
  if (t.includes('MEDIO')) return 'medio'
  if (t.includes('BAJO')) return 'bajo'
  return 'medio'
}

// ======================================================
// FUNCIÓN: Guardar en historial (localStorage)
// ======================================================
window.guardarHistorial = function () {
  if (!ultimoResultado) return

  // Leer historial existente del navegador
  const historial = JSON.parse(localStorage.getItem('edualerta_historial') || '[]')

  // Agregar al inicio
  historial.unshift(ultimoResultado)

  // Guardar (máximo 20 registros)
  if (historial.length > 20) historial.pop()
  localStorage.setItem('edualerta_historial', JSON.stringify(historial))

  alert('✅ Guardado en el historial')
  mostrarHistorial()
}

// ======================================================
// FUNCIÓN: Mostrar historial guardado
// ======================================================
function mostrarHistorial() {
  const historial = JSON.parse(localStorage.getItem('edualerta_historial') || '[]')
  const seccion   = document.getElementById('seccion-historial')
  const lista     = document.getElementById('lista-historial')

  if (historial.length === 0) {
    seccion.style.display = 'none'
    return
  }

  seccion.style.display = 'flex'

  // Crear HTML para cada registro
  lista.innerHTML = historial.map(item => `
    <div class="item-historial">
      <div class="nombre">
        ${item.nombre}
        <span class="badge-riesgo ${item.nivelRiesgo}">${item.nivelRiesgo.toUpperCase()}</span>
      </div>
      <div class="meta">${item.programa} · ${item.semestre} · ${item.fecha}</div>
      <div class="preview">${item.textoIA}</div>
    </div>
  `).join('')
}

// ======================================================
// FUNCIÓN: Limpiar historial
// ======================================================
window.limpiarHistorial = function () {
  if (confirm('¿Seguro que quieres borrar todo el historial?')) {
    localStorage.removeItem('edualerta_historial')
    mostrarHistorial()
  }
}

// ======================================================
// FUNCIÓN: Resetear para un nuevo análisis
// ======================================================
window.nuevoAnalisis = function () {
  document.getElementById('seccion-resultado').style.display = 'none'
  document.getElementById('nombre').focus()
  ultimoResultado = null
}
