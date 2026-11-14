// Mon palais — ce que je bois, ce que j'aime, ce que je reconnais à l'aveugle.
// Un portrait, pas un bulletin : ni score, ni niveau, ni comparaison avec d'autres.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'
import { Screen, Header, Body, Card, Loading, useAsync } from '../components/Layout'
import { StackBar, BarList } from '../components/Charts'
import FranceMap from '../components/FranceMap'
import * as db from '../db/db'
import { buildPalate } from '../utils/palate'

const stars = (value) => `${value.toFixed(1).replace('.', ',')} ★`

export default function Palate() {
  const navigate = useNavigate()
  const { data: records } = useAsync(() => db.listRecords(), [])
  const [region, setRegion] = useState(null)

  if (records === undefined) return <Loading />
  const palate = buildPalate(records)
  const back = () => navigate(-1)

  if (palate.total === 0) {
    return (
      <Screen>
        <Header title="Mon palais" onBack={back} />
        <div className="empty">
          <p className="empty-title">Ton palais se dessine au fil des bouteilles</p>
          <p className="empty-text">Après quelques vins, tu verras ici ce que tu bois, ce que tu aimes et ce que tu reconnais à l'aveugle.</p>
          <button className="btn btn-primary" onClick={() => navigate('/', { replace: true })}>Retour à l'accueil</button>
        </div>
      </Screen>
    )
  }

  const regionNames = Object.keys(palate.regionCounts)
  const liked = palate.likedGrapes.length > 0 || palate.likedRegions.length > 0

  return (
    <Screen>
      <Header title="Mon palais" label={`${palate.total} ${palate.total > 1 ? 'vins' : 'vin'} au journal`} onBack={back} />
      <Body>
        <Card title="Ce que je bois">
          <StackBar label="Répartition par type" segments={palate.types} />
          {palate.grapes.length > 0 && (
            <>
              <p className="chart-title">Cépages les plus goûtés</p>
              <BarList items={palate.grapes} />
            </>
          )}
        </Card>

        {(regionNames.length > 0 || palate.countries.length > 0) && (
          <Card title="Mon tour de France">
            <FranceMap counts={palate.regionCounts} selected={region} onPick={name => setRegion(r => (r === name ? null : name))} />
            <p className="muted">
              {region
                ? `${region} : ${palate.regionCounts[region]} ${palate.regionCounts[region] > 1 ? 'bouteilles' : 'bouteille'}`
                : `${regionNames.length} ${regionNames.length > 1 ? 'régions goûtées' : 'région goûtée'} sur 14`}
            </p>
            {region && (
              <button className="btn btn-ghost block" onClick={() => navigate(`/journal?q=${encodeURIComponent(region)}`)}>
                Voir ces bouteilles dans le journal
              </button>
            )}
            {palate.countries.length > 0 && (
              <>
                <p className="chart-title">Hors de France</p>
                <BarList items={palate.countries} />
              </>
            )}
          </Card>
        )}

        <Card title="Ce que j'aime">
          {liked ? (
            <>
              {palate.likedGrapes.length > 0 && (
                <>
                  <p className="chart-title">Cépages les mieux notés</p>
                  <BarList items={palate.likedGrapes.map(g => ({ ...g, note: stars(g.value) }))} />
                </>
              )}
              {palate.likedRegions.length > 0 && (
                <>
                  <p className="chart-title">Régions les mieux notées</p>
                  <BarList items={palate.likedRegions.map(r => ({ ...r, note: stars(r.value) }))} />
                </>
              )}
            </>
          ) : (
            <p className="muted left">Note au moins deux vins d'un même cépage ou d'une même région pour voir tes préférences se dessiner.</p>
          )}
          {palate.favorites > 0 && <p className="muted left">{palate.favorites} {palate.favorites > 1 ? 'coups de cœur' : 'coup de cœur'} au journal.</p>}
        </Card>

        <Card title="Ce que je reconnais à l'aveugle">
          {palate.blind.length > 0 ? (
            <>
              {palate.blind.map(field => (
                <div key={field.key} className="chart-block">
                  <p className="chart-title">{field.label}</p>
                  <StackBar label={field.label} segments={[
                    { key: 'exact', label: field.exact > 1 ? 'justes' : 'juste', value: field.exact, tone: 'match' },
                    { key: 'close', label: field.close > 1 ? 'proches' : 'proche', value: field.close, tone: 'close' },
                    { key: 'miss', label: 'à revoir', value: field.miss, tone: 'miss' },
                  ]} />
                </div>
              ))}
              <p className="muted left">Sur {palate.blindCount} {palate.blindCount > 1 ? 'dégustations' : 'dégustation'} à l'aveugle. Un repère pour toi, pas une note.</p>
            </>
          ) : (
            <p className="muted left">Fais une dégustation à l'aveugle jusqu'à la révélation : tu verras ici ce que tu reconnais le mieux.</p>
          )}
        </Card>

        <Card title="Mes penchants">
          {palate.leanings.length > 0 ? (
            <>
              {palate.leanings.map(l => (
                <p key={l.key} className="insight"><Lightbulb size={16} /><span>Tu perçois souvent {l.text} que le profil typique du cépage ({l.count} dégustations).</span></p>
              ))}
              <p className="muted left">Ce n'est pas une erreur, c'est ton palais. Le savoir aide à ajuster tes hypothèses.</p>
            </>
          ) : (
            <p className="muted left">
              {palate.profiled >= 3
                ? 'Aucun penchant net : ta perception suit de près les profils typiques.'
                : 'Après trois dégustations à l\'aveugle de rouges ou de blancs, tu verras ici si tu perçois les tanins, le corps ou l\'acidité plus ou moins que la moyenne.'}
            </p>
          )}
        </Card>
      </Body>
    </Screen>
  )
}
