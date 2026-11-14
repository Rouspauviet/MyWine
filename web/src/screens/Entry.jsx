// Fiche complète — souvenir de la bouteille + (en mode Aveugle) notes, hypothèses et comparaison
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2, Heart, Users } from 'lucide-react'
import { Screen, Header, Body, Card, InfoRow, ConfirmModal, Loading, useAsync } from '../components/Layout'
import { RATING_LABELS } from '../components/Inputs'
import { ComparisonTable, Insights, summarize, ShareResultButton, HostNote, Lesson, OriginMap, FlavorCard } from './Comparison'
import { LEVELS } from '../data/levels'
import * as db from '../db/db'
import { usePhotoUrls } from '../utils/photos'
import { formatDate, formatPrice, labelOf, labelsOf, recordTitle, hasReality } from '../utils/text'
import {
  WINE_TYPES, STYLE_OPTIONS,
  TANNIN_INTENSITY, TANNIN_TEXTURE, FRUIT_MATURITY, ACIDITY_RED,
  ACIDITY_5, TEXTURE_WHITE, MINERALITY, MINERALITY_TYPE, OAK,
  VIVACITY, PERCEIVED_SWEETNESS, LIGHT_STRUCTURE,
  BUBBLE_QUALITY, PERCEIVED_DOSAGE, SPARKLING_REGISTER,
  PHENOLIC_INTENSITY, PHENOLIC_TYPE, BITTERNESS, BITTERNESS_TYPE, OXIDATIVE_REGISTER, RESIDUAL_ACIDITY,
  BODY_3, FINISH_3,
} from '../data/wineData'

// Lignes de la section Structure, par type : [libellé, clé, options, multi]
const STRUCTURE_ROWS = {
  rouge: [
    ['Tanins', 'taninIntensity', TANNIN_INTENSITY], ['Texture', 'taninTexture', TANNIN_TEXTURE, true],
    ['Fruit', 'fruitMaturity', FRUIT_MATURITY], ['Corps', 'body', BODY_3],
    ['Acidité', 'acidity', ACIDITY_RED], ['Longueur', 'finish', FINISH_3],
  ],
  blanc: [
    ['Acidité', 'acidity', ACIDITY_5], ['Texture', 'texture', TEXTURE_WHITE],
    ['Minéralité', 'minerality', MINERALITY], ['Type de minéralité', 'mineralityType', MINERALITY_TYPE, true],
    ['Boisé', 'boise', OAK], ['Longueur', 'finish', FINISH_3],
  ],
  rose: [
    ['Vivacité', 'vivacity', VIVACITY], ['Corps', 'body', BODY_3],
    ['Sucrosité', 'perceivedSweetness', PERCEIVED_SWEETNESS], ['Structure', 'lightStructure', LIGHT_STRUCTURE],
    ['Longueur', 'finish', FINISH_3],
  ],
  petillant: [
    ['Bulles', 'bubbleQuality', BUBBLE_QUALITY], ['Dosage perçu', 'perceivedDosage', PERCEIVED_DOSAGE],
    ['Registre', 'sparklingRegister', SPARKLING_REGISTER], ['Vivacité', 'vivacity', VIVACITY],
    ['Corps', 'body', BODY_3],
  ],
  orange: [
    ['Texture phénolique', 'phenolicIntensity', PHENOLIC_INTENSITY], ['Type de texture', 'phenolicType', PHENOLIC_TYPE, true],
    ['Amers', 'bitterness', BITTERNESS], ['Type d\'amers', 'bitternessType', BITTERNESS_TYPE, true],
    ['Registre oxydatif', 'oxidativeRegister', OXIDATIVE_REGISTER], ['Acidité résiduelle', 'residualAcidity', RESIDUAL_ACIDITY],
    ['Longueur', 'finish', FINISH_3],
  ],
  default: [['Corps', 'body', BODY_3], ['Longueur', 'finish', FINISH_3], ['Notes', 'paletteFree']],
}

function StructureCard({ structure }) {
  const data = structure?.data ?? {}
  const rows = (STRUCTURE_ROWS[structure?.wineType] ?? STRUCTURE_ROWS.default)
    .map(([label, key, options, multi]) => ({
      label,
      value: !options ? data[key] : multi ? labelsOf(options, data[key]) : labelOf(options, data[key]),
    }))
    .filter(r => r.value)
  if (!rows.length) return null
  return (
    <Card title="Structure en bouche" tight>
      {rows.map(r => <InfoRow key={r.label} label={r.label} value={r.value} />)}
    </Card>
  )
}

export default function Entry() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: record } = useAsync(() => db.getRecord(id), [id])
  const photos = usePhotoUrls(id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [zoom, setZoom] = useState(null)

  if (record === undefined) return <Loading />
  if (!record) {
    return (
      <Screen>
        <Header title="Fiche introuvable" onBack={() => navigate('/journal', { replace: true })} />
      </Screen>
    )
  }

  const r = record.reality || {}
  const style = record.style || {}
  const perc = record.perception || {}
  const isBlind = record.mode === 'blind'
  const known = hasReality(r)
  const summary = summarize(record.comparison?.matches)

  const remove = async () => {
    await db.deleteRecord(id)
    navigate('/journal', { replace: true })
  }

  return (
    <Screen>
      <Header
        title={recordTitle(record)}
        label={record.session?.role === 'guest' ? `Dégustation chez ${record.session.hostName}` : isBlind ? 'Dégustation à l\'aveugle' : 'Souvenir'}
        onBack={() => navigate('/journal', { replace: true })}
        actions={<>
          <button className="icon-btn" onClick={() => navigate(`/entry/${id}/edit`)} aria-label="Modifier"><Pencil size={20} /></button>
          <button className="icon-btn danger" onClick={() => setConfirmDelete(true)} aria-label="Supprimer"><Trash2 size={20} /></button>
        </>}
      />
      <Body>
        {photos.length > 0 && (
          <div className="photo-gallery">
            {photos.map(url => <img key={url} src={url} alt="Photo de la bouteille" onClick={() => setZoom(url)} />)}
          </div>
        )}

        {record.session?.role === 'host' && (
          <button className="btn btn-secondary block" onClick={() => navigate(`/host/${id}`)}>
            <Users size={18} /> Rouvrir l'invitation et le code
          </button>
        )}

        {!known && photos.length === 0 && (
          <button className="banner" onClick={() => navigate(`/entry/${id}/edit`)}>
            Bouteille non renseignée. Touche ici pour compléter la fiche.
          </button>
        )}

        {(known || photos.length > 0) && (
          <Card title="La bouteille" tight>
            <InfoRow label="Type" value={labelOf(WINE_TYPES, r.type)} />
            <InfoRow label="Cuvée" value={r.cuvee} />
            <InfoRow label="Producteur" value={r.producer} />
            <InfoRow label="Vignerons" value={r.vignerons} />
            <InfoRow label="Appellation" value={r.appellation} />
            <InfoRow label="Région" value={r.region} />
            <InfoRow label="Pays" value={r.country} />
            <InfoRow label="Millésime" value={r.vintage} />
            <InfoRow label="Cépages" value={r.grapes?.join(', ')} />
            <InfoRow label="Alcool" value={r.abv ? `${r.abv} %` : null} />
            <InfoRow label="Prix" value={formatPrice(r.price) ?? r.price} />
            <InfoRow label="Lieu d'achat" value={r.purchasePlace} />
          </Card>
        )}

        <HostNote record={record} />

        <Card title="Mon impression" tight>
          <InfoRow label="Date" value={formatDate(record.tastedAt || record.createdAt, true)} />
          {style.rating ? (
            <InfoRow label="Note">
              <span className="rating-text">{'★'.repeat(style.rating)}{'☆'.repeat(5 - style.rating)}</span> {RATING_LABELS[style.rating]}
            </InfoRow>
          ) : null}
          {style.favorite && (
            <InfoRow label="Coup de cœur"><Heart size={16} className="fav" fill="currentColor" /></InfoRow>
          )}
          <InfoRow label="Style" value={labelOf(STYLE_OPTIONS, style.category)} />
          <InfoRow label="Accords" value={style.pairings?.join(', ')} />
          <InfoRow label="Commentaire" value={style.overallImpression} />
          <InfoRow label="Occasion" value={style.context} />
        </Card>

        {isBlind && (
          <>
            {summary && (
              <section className="card summary">
                <p className="summary-main">{summary}</p>
                <p className="summary-sub">Confiance annoncée : {record.hypotheses?.confidence}/5</p>
              </section>
            )}
            <ComparisonTable record={record} />
            {summary && <ShareResultButton record={record} />}
            <OriginMap record={record} />
            <FlavorCard record={record} />
            <Lesson record={record} />
            <Insights record={record} />

            <Card title="Perception sensorielle" tight>
              <InfoRow label="Niveau" value={labelOf(LEVELS, record.level)} />
              <InfoRow label="Indices demandés" value={record.cluesUsed ? String(record.cluesUsed) : null} />
              <InfoRow label="Aide au raisonnement" value={record.reasoningUsed ? 'Oui' : null} />
              <InfoRow label="Type supposé" value={labelOf(WINE_TYPES, record.wineType)} />
              <InfoRow label="Robe" value={perc.robe?.join(', ')} />
              <InfoRow label="Intensité" value={perc.aromaIntensity ? `${perc.aromaIntensity}/5` : null} />
              <InfoRow label="Arômes" value={perc.aromaFamilies?.join(', ')} />
              <InfoRow label="Arômes précis" value={perc.aromaNotes?.join(', ')} />
              <InfoRow label="Notes" value={perc.notes} />
            </Card>
            <StructureCard structure={record.structure} />
          </>
        )}

        {/* Souvenir sans dégustation à l'aveugle : la fiche pédagogique seule */}
        {!isBlind && <OriginMap record={record} />}
        {!isBlind && <FlavorCard record={record} />}
        {!isBlind && <Lesson record={record} />}
      </Body>

      <ConfirmModal
        open={confirmDelete}
        title="Supprimer cette fiche ?"
        text="Cette action est irréversible. La fiche et ses photos seront supprimées du journal."
        confirmLabel="Supprimer"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <img src={zoom} alt="Photo de la bouteille" />
        </div>
      )}
    </Screen>
  )
}
