import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Settings,
  Key,
  Sparkles,
  ArrowLeft,
  Check,
  Activity,
  ShieldAlert,
} from 'lucide-react'

interface MedicalAIChatProps {
  userRole: 'doctor' | 'patient'
  userName: string
}

interface Message {
  id: string
  sender: 'user' | 'bot' | 'system'
  text: string
  timestamp: Date
}

export function MedicalAIChat({ userRole, userName }: MedicalAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [inputKey, setInputKey] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Determine accents and labels based on user role
  const isDoctor = userRole === 'doctor'
  const themeColor = isDoctor
    ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 text-red-600 bg-red-50 border-red-200'
    : 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:ring-emerald-500 text-emerald-600 bg-emerald-50 border-emerald-200'
  const buttonBg = isDoctor ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'

  // Load API key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('medcore_gemini_api_key') || ''
    setApiKey(savedKey)
    setInputKey(savedKey)
  }, [])

  // Initialize welcome message when chat opens or role changes
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = isDoctor
        ? `Hola, Dr(a). ${userName}. Soy **Health Flow AI**, su asistente clínico inteligente. ¿En qué fármaco, dosificación o consulta médica puedo asistirle hoy?`
        : `Hola, ${userName}. Soy **Health Flow AI**, tu asistente de salud. ¿Qué síntomas o molestias estás experimentando hoy? Cuéntame para poder guiarte sobre qué hacer y con qué especialista consultar.`;

      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: welcomeText,
          timestamp: new Date(),
        },
      ])
    }
  }, [userRole, userName, messages.length, isDoctor])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputKey.trim()
    localStorage.setItem('medcore_gemini_api_key', trimmed)
    setApiKey(trimmed)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
    setShowSettings(false)

    // Add info message about the API key setup
    setMessages((prev) => [
      ...prev,
      {
        id: `key-sys-${Date.now()}`,
        sender: 'system',
        text: trimmed
          ? '🔑 Conexión establecida con Gemini API. Las próximas consultas serán procesadas por la IA en la nube.'
          : 'ℹ️ Se ha removido la clave API. El chatbot funcionará en Modo de Demostración local.',
        timestamp: new Date(),
      },
    ])
  }

  // Local rule-based responder for offline/demo mode
  const getMockAIResponse = (userText: string): string => {
    const text = userText.toLowerCase().trim()

    // 1. Strict medical filtering
    const nonMedicalKeywords = [
      'capital de', 'quien escribio', 'receta de cocina', 'recetas de cocina', 
      'python', 'javascript', 'html', 'programacion', 'codigo', 'chiste', 
      'cancion', 'jugar', 'videojuego', 'clima', 'futbol', 'deporte', 
      'musica', 'pelicula', 'cine', 'finanzas', 'dolar', 'politica',
    ]
    
    // Check if the query is simple greeting or identification
    const greetings = ['hola', 'buenos dias', 'buenas tardes', 'quien eres', 'que haces', 'gracias', 'adios']
    const isGreeting = greetings.some((g) => text === g || text.startsWith(g + ' '))

    if (!isGreeting) {
      // Check for non-medical keywords or lack of medical keywords
      const medicalKeywords = [
        'dolor', 'cabeza', 'estomago', 'fiebre', 'tos', 'gripe', 'medicamento', 
        'dosis', 'paracetamol', 'ibuprofeno', 'amoxicilina', 'omeprazol', 
        'tratamiento', 'diagnostico', 'cita', 'doctor', 'medico', 'sintoma', 
        'malestar', 'nausea', 'vomito', 'diarrea', 'infeccion', 'alergia', 
        'pastilla', 'jarabe', 'prescripcion', 'recetar', 'corazon', 'pecho',
        'pulmon', 'respirar', 'musculo', 'hueso', 'espalda', 'fractura',
      ]
      
      const hasMedicalKeyword = medicalKeywords.some((k) => text.includes(k))
      const hasNonMedicalKeyword = nonMedicalKeywords.some((k) => text.includes(k))

      if (hasNonMedicalKeyword || !hasMedicalKeyword) {
        return 'Lo siento, como **Health Flow AI**, estoy diseñado estrictamente para responder **consultas médicas y de salud**. No puedo proporcionarte información sobre temas de cultura general, programación, entretenimiento o cualquier área no relacionada con la medicina.'
      }
    }

    // 2. Urgent Emergency Warning
    const emergencies = [
      'dolor de pecho', 'no puedo respirar', 'dificultad para respirar', 
      'infarto', 'derrame', 'perdida de conciencia', 'desmayo', 'sangrado abundante',
    ]
    if (emergencies.some((k) => text.includes(k))) {
      return '⚠️ **¡ATENCIÓN DE EMERGENCIA!** Los síntomas descritos (como dolor torácico o problemas respiratorios graves) representan una **urgencia médica crítica**.\n\nPor favor, dirígete de inmediato a la sala de emergencias más cercana o comunícate con la línea de urgencias de tu país. **No intentes programar una cita o esperar una respuesta.**'
    }

    if (isDoctor) {
      // Doctor-oriented mock answers
      if (text.includes('paracetamol') || text.includes('acetaminofen')) {
        return `**Información Clínica: Paracetamol (Acetaminofén)**
- **Clase:** Analgésico y antipirético no antiinflamatorio.
- **Indicaciones:** Manejo del dolor de leve a moderado y control de la fiebre.
- **Dosis Adulto:** 500 mg a 1000 mg cada 6 u 8 horas por vía oral. No exceder 4 g diarios por riesgo de hepatotoxicidad.
- **Dosis Pediátrica:** 10 a 15 mg/kg por dosis cada 6 horas.
- **Precauciones:** Insuficiencia hepática severa, alcoholismo crónico.
- **Disponibilidad:** En stock (500 tabletas de 500mg disponibles).`;
      }
      if (text.includes('ibuprofeno')) {
        return `**Información Clínica: Ibuprofeno**
- **Clase:** Analgésico, antiinflamatorio y antipirético (AINE).
- **Indicaciones:** Procesos inflamatorios osteomusculares, artritis, dolor agudo posquirúrgico o postraumático.
- **Dosis Adulto:** 400 mg cada 8 horas. Dosis máxima diaria recomendada es de 2400 mg.
- **Precauciones:** Administrar con alimentos. Contraindicado en úlcera péptica activa, insuficiencia renal o cardíaca severa, y tercer trimestre del embarazo.
- **Disponibilidad:** Alerta de stock bajo (80 tabletas en inventario).`;
      }
      if (text.includes('amoxicilina')) {
        return `**Información Clínica: Amoxicilina**
- **Clase:** Antibiótico betalactámico (Penicilinas de amplio espectro).
- **Indicaciones:** Infecciones bacterianas respiratorias (amigdalitis bacteriana, otitis media, neumonía) y del tracto urinario.
- **Dosis Adulto:** 500 mg cada 8 horas o 875 mg cada 12 horas por 7-10 días.
- **Precauciones:** Excluir alergia conocida a penicilinas y cefalosporinas. Requiere receta médica.
- **Disponibilidad:** En stock (200 cápsulas de 500mg disponibles).`;
      }
      if (text.includes('omeprazol')) {
        return `**Información Clínica: Omeprazol**
- **Clase:** Inhibidor de la bomba de protones (IBP).
- **Indicaciones:** Gastritis aguda/crónica, reflujo gastroesofágico, profilaxis de úlcera inducida por AINEs.
- **Dosis:** 20 mg vía oral al día en ayunas, 30 minutos antes del desayuno.
- **Disponibilidad:** En stock (150 cápsulas de 20mg disponibles).`;
      }
      if (text.includes('medicamento') || text.includes('dosis') || text.includes('principio')) {
        return 'Para obtener información de un medicamento del stock de la clínica, ingresa su nombre (ej. *Paracetamol*, *Ibuprofeno*, *Amoxicilina* u *Omeprazol*). Te proporcionaré el perfil farmacológico y la dosis estándar.';
      }
      return 'Estimado Doctor, puedo facilitarle información de dosificación y especificaciones para los medicamentos del stock (Paracetamol, Ibuprofeno, Amoxicilina y Omeprazol). ¿Cuál de ellos desea consultar?';
    } else {
      // Patient-oriented mock answers
      if (text.includes('cabeza') || text.includes('migraña') || text.includes('cefalea')) {
        return `El dolor de cabeza (cefalea o migraña) suele ser tensional o debido a fatiga.
        
**Sugerencias generales:**
1. Descansa en un ambiente silencioso, fresco y oscuro.
2. Asegúrate de beber suficiente agua (la deshidratación es una causa común).
3. Evita el uso de pantallas de celular o TV.
4. Para dolores leves, medicamentos comunes como el **Paracetamol 500mg** ayudan a aliviarlo, pero consulta siempre a un profesional antes de automedicarte.

*⚠️ Advertencia: Si el dolor de cabeza es súbito, extremadamente severo, o va acompañado de entumecimiento, problemas para hablar o fiebre alta, acude inmediatamente a urgencias.*
\nTe sugerimos solicitar una cita en **Medicina General** a través del portal.`;
      }
      if (text.includes('estomago') || text.includes('acidez') || text.includes('gastritis') || text.includes('barriga') || text.includes('colico')) {
        return `El dolor de estómago o acidez puede relacionarse con indigestión, gases o gastritis.
        
**Sugerencias generales:**
1. Consume una dieta blanda (arroz blanco, pollo cocido, caldos desgrasados).
2. Evita lácteos, grasas, comidas muy picantes, cafeína y alcohol.
3. Para la acidez estomacal se suele recomendar **Omeprazol 20mg** en ayunas.

*⚠️ Advertencia: Si el dolor es insoportable, se localiza abajo a la derecha del abdomen, o presentas vómitos persistentes y fiebre, asiste a urgencias.*
\nTe sugerimos solicitar una cita médica para una evaluación formal.`;
      }
      if (text.includes('fiebre') || text.includes('gripe') || text.includes('tos') || text.includes('resfriado') || text.includes('garganta')) {
        return `Los síntomas respiratorios y la fiebre leve comúnmente indican un cuadro viral de gripe o resfriado.
        
**Sugerencias generales:**
1. Mantén un reposo absoluto en cama.
2. Hidrátate constantemente (toma té tibio, caldos, agua).
3. Para controlar la fiebre y el dolor de cuerpo, el **Paracetamol 500mg** cada 8 horas suele ser efectivo.
4. **IMPORTANTE:** Evita el uso de antibióticos (como la Amoxicilina) por iniciativa propia. La gripe es viral y los antibióticos solo combaten bacterias. El uso inadecuado genera resistencia bacteriana.

*⚠️ Advertencia: Si experimentas dificultad para respirar, dolor al inspirar o fiebre alta persistente (>38.5°C) por más de 3 días, acude al centro médico.*`;
      }
      if (text.includes('muscular') || text.includes('espalda') || text.includes('articulacion') || text.includes('golpe')) {
        return `Los dolores musculares o de espalda pueden deberse a una contractura o una mala postura.
        
**Sugerencias generales:**
1. Aplica compresas frías en golpes recientes, o paños calientes para contracturas.
2. Evita levantar peso o realizar movimientos bruscos.
3. Los antiinflamatorios como el **Ibuprofeno 400mg** pueden aliviar el dolor, tomados preferiblemente con alimentos.

Te sugerimos programar una cita en **Traumatología** o Medicina General en el portal si el dolor no cede en pocos días.`;
      }
      return `Lamento oír sobre tus molestias de salud. Como tu asistente virtual, puedo brindarte información preliminar de autocuidado y derivarte al especialista correcto de Health Flow. 

Cuéntame más, ¿qué síntomas tienes? (ej. *tengo dolor de cabeza*, *tengo fiebre y tos*, *me duele el estómago*).`;
    }
  }

  // Call Gemini API
  const handleCallGemini = async (userText: string, history: Message[]) => {
    const systemInstruction = `
Eres Health Flow AI, un asistente médico inteligente integrado en el sistema hospitalario Health Flow.
Tu rol depende de con quién estás hablando. El usuario actual es un ${isDoctor ? 'Médico/Doctor de la clínica' : 'Paciente de la clínica'}.

Instrucciones generales obligatorias:
1. SOLO debes responder preguntas relacionadas estrictamente con medicina, salud, anatomía, síntomas, tratamientos o medicamentos.
2. Si el usuario te hace una pregunta que NO es de medicina o salud (ej. programación, matemáticas, geografía, recetas de cocina no saludables, chistes, etc.), debes responder de manera educada pero firme que estás diseñado únicamente para consultas médicas y de salud, y declinar la respuesta.
3. Tu idioma de comunicación debe ser siempre el Español.
4. Mantén un tono profesional, compasivo y objetivo.

Instrucciones específicas por rol:
- Si el usuario es un PACIENTE:
  * Cuando te consulte por síntomas (ej. "me duele la cabeza"), proporciónale orientación clara sobre qué podría significar, qué cuidados generales en casa puede tener (hidratación, descanso) y qué especialista de la clínica Health Flow podría ver (Medicina General, Cardiología, Pediatría, Traumatología).
  * ADVIERTE SIEMPRE al final de cada respuesta que tu recomendación es informativa y no reemplaza el diagnóstico de un médico profesional, e insta a agendar una cita en la clínica Health Flow.
  * Si el paciente describe síntomas de alarma (dolor de pecho opresivo, dificultad grave para respirar, parálisis de un lado del cuerpo, pérdida súbita de visión, etc.), indícale inmediatamente en negrita y con el emoji ⚠️ que debe acudir al servicio de urgencias de inmediato.

- Si el usuario es un MÉDICO/DOCTOR:
  * Cuando te pregunte sobre medicamentos (ej. dosis de un medicamento, interacciones, guías de tratamiento), proporciona información farmacológica detallada y precisa (dosis usuales en adultos/niños, contraindicaciones, efectos adversos comunes, precauciones de uso).
  * Puedes hacer referencia a los medicamentos comunes en nuestro stock si el usuario lo solicita (Paracetamol, Ibuprofeno, Amoxicilina, Omeprazol).
  * Recuerda al médico de forma sutil que la prescripción final está bajo su criterio clínico y responsabilidad profesional.
`;

    // Map conversation history to Gemini structure
    // We filter out system messages to avoid confusing the API, and format roles
    const apiHistory = history
      .filter((m) => m.sender !== 'system')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }))

    // Add the new user input
    apiHistory.push({
      role: 'user',
      parts: [{ text: userText }],
    })

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: apiHistory,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Error API (${response.status})`)
      }

      const data = await response.json()
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!botText) {
        throw new Error('Formato de respuesta de API inválido')
      }

      return botText
    } catch (error) {
      console.error('Error al llamar a Gemini API:', error)
      return '⚠️ **Error al conectar con la IA en la nube.**\nNo pudimos obtener respuesta de Gemini en este momento. Revisa tu conexión a internet o tu clave de API en ajustes. Temporalmente puedes usar el Modo de Demostración local desactivando o corrigiendo la clave.'
    }
  }

  const handleSend = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault()
    
    const textToSend = presetText || inputText
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    // Call simulated or real AI depending on ApiKey presence
    let responseText = ''
    if (apiKey) {
      responseText = await handleCallGemini(textToSend, messages)
    } else {
      // Simulate typing delay for mock AI
      await new Promise((resolve) => setTimeout(resolve, 800))
      responseText = getMockAIResponse(textToSend)
    }

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: responseText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
    setIsLoading(false)
  }

  // Pre-made questions based on user roles
  const patientSuggestions = [
    'Tengo dolor de cabeza',
    'Tengo acidez estomacal',
    'Tengo gripe con tos y fiebre',
  ]

  const doctorSuggestions = [
    'Dosis de Paracetamol',
    'Perfil de Amoxicilina',
    'Uso de Ibuprofeno',
  ]

  const suggestions = isDoctor ? doctorSuggestions : patientSuggestions

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Helper to parse markdown-like bold (**text**) and bullet points in messages
  const parseMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Handle empty lines
      if (!line.trim()) return <div key={idx} className="h-2" />

      // Handle list items
      const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ')
      let cleanLine = isListItem ? line.trim().substring(2) : line

      // Handle bold **word**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g)
      const parsedElements = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
        }
        return part
      })

      if (isListItem) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-sm leading-relaxed">
            {parsedElements}
          </li>
        )
      }

      return (
        <p key={idx} className="text-sm leading-relaxed mb-1">
          {parsedElements}
        </p>
      )
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Pulse button to trigger chatbot */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-115 active:scale-95 ${buttonBg} animate-pulse`}
          title="Consúltale a MediCore AI"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="flex h-[520px] w-[370px] flex-col overflow-hidden rounded-2xl border border-rose-muted/30 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 sm:w-[390px]">
          {/* Header */}
          <div className={`flex items-center justify-between bg-gradient-to-r px-4 py-3.5 text-white ${isDoctor ? 'from-red-700 to-red-900' : 'from-emerald-700 to-emerald-950'}`}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">Health Flow AI</h3>
                  <span className="flex h-2 w-2 rounded-full bg-green-400 animate-ping" />
                </div>
                <p className="text-[10px] text-white/80">
                  {apiKey ? 'IA Activa (Gemini)' : 'Modo Demostración local'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition"
                title="Configurar API Key"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Warning banner when no API key is set */}
          {!apiKey && !showSettings && (
            <div className={`flex items-center justify-between border-b px-3.5 py-1.5 text-[11px] font-medium leading-tight ${isDoctor ? 'bg-red-50 text-red-800 border-red-100' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 shrink-0" />
                Demostración local activa.
              </span>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="underline hover:opacity-85"
              >
                Activar IA real
              </button>
            </div>
          )}

          {/* Main Body Area */}
          <div className="relative flex-1 bg-gradient-to-b from-slate-50 to-slate-100/30">
            {showSettings ? (
              /* Settings Screen */
              <div className="absolute inset-0 z-10 flex flex-col bg-white p-5">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver al Chat
                </button>
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>
                      Tu clave de API se guarda <strong>únicamente en tu navegador local</strong> (localStorage) y se comunica directamente con los servidores de Google Gemini.
                    </span>
                  </div>

                  <form onSubmit={handleSaveKey} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Gemini API Key
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={inputKey}
                          onChange={(e) => setInputKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs font-mono shadow-inner outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white shadow-md transition-all ${
                        isDoctor ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {keySaved ? (
                        <>
                          <Check className="h-4 w-4" />
                          ¡Guardado con éxito!
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Guardar Configuración
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 text-[11px] text-slate-500 leading-relaxed">
                    <p className="font-medium mb-1">¿Cómo obtener una clave gratuita?</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Ingresa a Google AI Studio.</li>
                      <li>Haz clic en &quot;Get API Key&quot;.</li>
                      <li>Genera una clave y pégala arriba.</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              /* Message logs */
              <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user'
                        ? 'items-end'
                        : m.sender === 'system'
                        ? 'items-center w-full'
                        : 'items-start'
                    }`}
                  >
                    {m.sender === 'system' ? (
                      <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-center text-[10px] font-medium text-slate-600 border border-slate-200">
                        {m.text}
                      </div>
                    ) : (
                      <>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-slate-800 leading-relaxed ${
                            m.sender === 'user'
                              ? isDoctor
                                ? 'bg-red-600 text-white rounded-tr-none'
                                : 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-white border border-slate-100 rounded-tl-none'
                          }`}
                        >
                          {parseMessageText(m.text)}
                        </div>
                        <span className="mt-1 px-1 text-[9px] text-slate-400">
                          {formatTime(m.timestamp)}
                        </span>
                      </>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-100 px-3.5 py-3 shadow-sm max-w-[80px]">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Quick suggestions area */}
          {!showSettings && (
            <div className="flex gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50/70 px-3 py-2 scrollbar-none">
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => handleSend(e, text)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition active:scale-95 ${themeColor}`}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Area */}
          {!showSettings && (
            <form
              onSubmit={(e) => handleSend(e)}
              className="flex items-center border-t border-slate-200/80 bg-white p-2.5 gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isDoctor ? 'Preguntar sobre un medicamento...' : 'Describe cómo te sientes...'}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${buttonBg}`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
