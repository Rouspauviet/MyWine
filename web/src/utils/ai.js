// Assistant IA (optionnel) — lecture d'étiquette et profil attendu d'un vin, via l'API Claude.
// La clé d'API est saisie par l'utilisateur dans les paramètres et ne quitte jamais son appareil,
// sauf vers api.anthropic.com. Elle n'est ni dans le code, ni dans la sauvegarde exportée.
// Sans clé, l'app fonctionne entièrement : rien ici n'est requis.

const KEY_STORAGE = 'mywine.apiKey'
const MODEL_STORAGE = 'mywine.aiModel'

export const AI_MODELS = [
  { value: 'claude-haiku-5-5', label: 'Haiku 5.5', description: 'Le plus économique : une fraction de centime par étiquette.' },
  { value: 'claude-sonnet-5-5', label: 'Sonnet 5.5', description: 'Plus fiable sur les étiquettes difficiles : environ 1 à 2 centimes.' },
  { value: 'claude-opus-5-5', label: 'Opus 5.5', description: 'Le plus capable : environ 3 centimes par étiquette.' },
]
export const DEFAULT_AI_MODEL = 'claude-sonnet-5-5'
export const PROFILE_MAX_LENGTH = 320 // le profil attendu voyage dans le lien d'invitation : il doit rester court

function read(key) { try { return localStorage.getItem(key) } catch { return null } }

export function getApiKey() { return read(KEY_STORAGE) ?? '' }
export function hasApiKey() { return getApiKey().length > 0 }
export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim())
    else localStorage.removeItem(KEY_STORAGE)
  } catch { /* stockage indisponible */ }
}
export function getAiModel() {
  const stored = read(MODEL_STORAGE)
  return AI_MODELS.some(m => m.value === stored) ? stored : DEFAULT_AI_MODEL
}
export function setAiModel(model) { try { localStorage.setItem(MODEL_STORAGE, model) } catch { /* idem */ } }

// ─── Schémas et consignes ────────────────────────────────────────────────────

const LABEL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'cuvee', 'producer', 'vignerons', 'appellation', 'region', 'country', 'vintage', 'grapes', 'abv'],
  properties: {
    type: { type: 'string', enum: ['rouge', 'blanc', 'rose', 'petillant', 'orange', 'clairet', 'autre', ''] },
    cuvee: { type: 'string' },
    producer: { type: 'string' },
    vignerons: { type: 'string' },
    appellation: { type: 'string' },
    region: { type: 'string' },
    country: { type: 'string' },
    vintage: { type: 'string' },
    grapes: { type: 'array', items: { type: 'string' } },
    abv: { type: 'string' },
  },
}

const LABEL_PROMPT = `Voici une ou deux photos de l'étiquette d'une bouteille de vin (face et éventuellement contre-étiquette).
Remplis la fiche de cette bouteille.

Règles :
- Ne recopie que ce qui est lisible sur l'étiquette. Si une information est absente ou illisible, laisse une chaîne vide (ou un tableau vide pour les cépages). N'invente jamais.
- cuvee : le nom de la cuvée, s'il y en a un, distinct du producteur.
- producer : le domaine, le château ou la maison.
- vignerons : le nom des personnes, seulement s'il est écrit et différent du producteur.
- appellation : le nom seul, sans "AOC", "AOP" ni "Appellation … Contrôlée" (exemple : "Cornas"). Garde "IGP" devant une indication géographique protégée.
- region et country : en français. Tu peux les déduire de l'appellation quand elle les détermine sans ambiguïté. Pour un vin français, region est l'une de : Alsace, Beaujolais, Bordeaux, Bourgogne, Champagne, Corse, Jura, Languedoc, Loire, Provence, Rhône, Roussillon, Savoie, Sud-Ouest.
- vintage : l'année sur 4 chiffres.
- grapes : les cépages écrits sur l'étiquette, en français. Tu peux en déduire un seulement si l'appellation l'impose (un seul cépage autorisé).
- abv : le degré d'alcool, sous la forme "13,5".
- type : la couleur du vin, si l'étiquette ou l'appellation la détermine ; sinon chaîne vide.`

// Tout ce que l'assistant prépare pour une dégustation à plusieurs, en un seul appel
const TASTING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['profile', 'clue1', 'clue2', 'focus_debutant', 'focus_amateur', 'grape_decoys', 'place_decoys'],
  properties: {
    profile: { type: 'string' },
    clue1: { type: 'string' },
    clue2: { type: 'string' },
    focus_debutant: { type: 'string' },
    focus_amateur: { type: 'string' },
    grape_decoys: { type: 'array', items: { type: 'string' } },
    place_decoys: { type: 'array', items: { type: 'string' } },
  },
}

const FRENCH_REGIONS = 'Alsace, Beaujolais, Bordeaux, Bourgogne, Champagne, Corse, Jura, Languedoc, Loire, Provence, Rhône, Roussillon, Savoie, Sud-Ouest'

function tastingPrompt(reality) {
  const facts = [
    reality.type && `Type : ${reality.type}`,
    reality.cuvee && `Cuvée : ${reality.cuvee}`,
    reality.producer && `Producteur : ${reality.producer}`,
    reality.appellation && `Appellation : ${reality.appellation}`,
    reality.region && `Région : ${reality.region}`,
    reality.country && `Pays : ${reality.country}`,
    reality.vintage && `Millésime : ${reality.vintage}`,
    reality.grapes?.length && `Cépages : ${reality.grapes.join(', ')}`,
    reality.abv && `Alcool : ${reality.abv} %`,
  ].filter(Boolean).join('\n')
  const french = /^france$/i.test((reality.country ?? '').trim())

  return `Un hôte fait déguster ce vin à l'aveugle à ses invités, chacun sur son téléphone. Prépare ce qui va les accompagner. Écris en français, en tutoyant.

La bouteille (les invités ne la connaissent pas) :
${facts}

Deux moments, deux règles opposées.

PENDANT la dégustation, les invités ne doivent rien apprendre de la bouteille. Dans clue1, clue2, focus_debutant et focus_amateur, ne cite JAMAIS le cépage, la région, l'appellation, le pays, le producteur, la cuvée ni le millésime. Tu peux t'appuyer sur ce qui se voit dans le verre : la couleur, les bulles.
- focus_debutant : une phrase (110 caractères au plus) qui dit à un débutant sur quoi porter son attention avec ce vin précis, en mots simples. Exemple de ton : "Regarde la finesse des bulles, puis demande-toi si le vin te paraît sec ou un peu sucré."
- focus_amateur : une phrase (110 caractères au plus) pour quelqu'un qui connaît le vocabulaire : l'axe de structure ou l'arôme qui en dit le plus sur l'origine de ce vin.
- clue1 : un premier indice volontairement vague (80 caractères au plus), sur le climat, le style ou l'élevage.
- clue2 : un second indice plus précis (80 caractères au plus), qui rapproche de la réponse sans la donner.

APRÈS la révélation :
- profile : ce qu'on attend en général d'un vin comme celui-ci, en deux ou trois phrases et ${PROFILE_MAX_LENGTH} caractères au plus : sa structure en bouche, deux ou trois arômes typiques, puis un détail qui aide à le reconnaître la prochaine fois. Parle de tendances ("souvent", "en général") : tu n'as pas goûté cette bouteille.

Pour le quiz des débutants :
- grape_decoys : exactement 3 cépages de la même couleur, qu'on pourrait vraiment confondre avec le cépage principal à l'aveugle, aucun n'étant un cépage de cette bouteille. Tableau vide si aucun cépage n'est indiqué.
- place_decoys : ${french ? `exactement 3 autres régions viticoles françaises plausibles, choisies dans cette liste : ${FRENCH_REGIONS}` : 'exactement 3 autres pays producteurs plausibles'}. Tableau vide si l'origine n'est pas indiquée.`
}

// ─── Appel ───────────────────────────────────────────────────────────────────

export class AiError extends Error {}

// Envoie une demande à Claude et renvoie l'objet JSON conforme au schéma.
// Le SDK est chargé à la demande : il ne pèse rien pour qui n'utilise pas l'assistant.
export async function askClaude({ apiKey, model, content, schema }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  // dangerouslyAllowBrowser : assumé ici, car la clé est celle de l'utilisateur, sur son propre appareil
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 })

  let response
  try {
    response = await client.messages.create({
      model,
      max_tokens: 4000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content }],
    })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new AiError('La clé d\'API est refusée. Vérifie-la dans les paramètres.')
    if (err instanceof Anthropic.PermissionDeniedError) throw new AiError('Cette clé n\'a pas accès à ce modèle. Essaie un autre modèle dans les paramètres.')
    if (err instanceof Anthropic.RateLimitError) throw new AiError('Limite d\'utilisation atteinte pour cette clé. Réessaie dans un moment.')
    if (err instanceof Anthropic.APIConnectionError) throw new AiError('Pas de connexion : l\'assistant a besoin d\'Internet.')
    if (err instanceof Anthropic.APIError && /credit balance/i.test(err.message)) {
      throw new AiError('Ton compte Claude n\'a plus de crédit. Ajoute-en depuis la console Anthropic (Plans & Billing).')
    }
    if (err instanceof Anthropic.APIError) throw new AiError(`L'assistant a répondu par une erreur (${err.status ?? '?'}). ${err.message}`)
    throw err
  }

  if (response.stop_reason === 'refusal') throw new AiError('L\'assistant n\'a pas voulu traiter cette demande.')
  if (response.stop_reason === 'max_tokens') throw new AiError('La réponse de l\'assistant a été coupée. Réessaie.')
  const text = response.content.find(block => block.type === 'text')?.text
  try {
    return { data: JSON.parse(text), usage: response.usage }
  } catch {
    throw new AiError('La réponse de l\'assistant est illisible. Réessaie.')
  }
}

// images : [{ mediaType: 'image/jpeg', data: '<base64>' }] — deux au maximum (face et contre-étiquette)
export async function readLabel(images, { apiKey = getApiKey(), model = getAiModel() } = {}) {
  const content = [
    ...images.slice(0, 2).map(img => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } })),
    { type: 'text', text: LABEL_PROMPT },
  ]
  const { data, usage } = await askClaude({ apiKey, model, content, schema: LABEL_SCHEMA })
  return {
    usage,
    reality: {
      type: data.type || null,
      cuvee: data.cuvee ?? '',
      producer: data.producer ?? '',
      vignerons: data.vignerons ?? '',
      appellation: data.appellation ?? '',
      region: data.region ?? '',
      country: data.country ?? '',
      vintage: /^\d{4}$/.test(data.vintage ?? '') ? data.vintage : '',
      grapes: Array.isArray(data.grapes) ? data.grapes.filter(Boolean) : [],
      abv: data.abv ?? '',
    },
  }
}

// Prépare l'accompagnement d'une dégustation à plusieurs : profil attendu (lu après la révélation),
// indices et pistes d'attention (lus pendant), leurres du quiz.
export async function prepareTasting(reality, { apiKey = getApiKey(), model = getAiModel() } = {}) {
  const { data, usage } = await askClaude({ apiKey, model, content: [{ type: 'text', text: tastingPrompt(reality) }], schema: TASTING_SCHEMA })
  const text = (value, max) => String(value ?? '').trim().slice(0, max)
  const list = (value) => (Array.isArray(value) ? value.map(v => String(v).trim()).filter(Boolean).slice(0, 3) : [])
  return {
    usage,
    profile: text(data.profile, PROFILE_MAX_LENGTH + 80),
    clues: [text(data.clue1, 120), text(data.clue2, 120)].filter(Boolean),
    focus: { debutant: text(data.focus_debutant, 160), amateur: text(data.focus_amateur, 160) },
    grapeDecoys: list(data.grape_decoys),
    placeDecoys: list(data.place_decoys),
  }
}

// Convertit une photo du formulaire (Blob) au format attendu par readLabel
export function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ mediaType: blob.type || 'image/jpeg', data: String(reader.result).split(',')[1] })
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
