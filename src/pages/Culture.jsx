import { Link } from 'react-router-dom';
import './Culture.css';

const scenes=[
 {n:'001',title:'HOUSE PARTY',tags:'# HOME # FRIENDS # DANCE  # LATE NIGHT',ko:'거창한 장소 없이도 친구들과 음악, 조명, 작은 공간만으로 만들어지는 가장 개인적인 파티 문화.',space:'Living room / Bedroom',sound:'House / Pop / Hip-hop',mood:'Casual / Warm / Loud',keys:'DJ setup / Mood lighting / Drinks / Friends'},
 {n:'002',title:'LISTENING PARTY',tags:'# MUSIC # ALBUM # TALK # SLOW NIGHT',ko:'춤추는 것보다 음악 자체에 집중하는 파티. 좋아하는 앨범이나 플레이리스트를 함께 듣고,\n음악에 대한 취향과 이야기를 나누는 방식이다.',space:'Living room / Studio / Lounge',sound:'R&B / Jazz / Indie / Ambient',mood:'Calm / Intimate / Focused',keys:'Speakers / Vinyl or Playlist /\nSoft Lighting / Comfortable Seating'},
 {n:'003',title:'DAY PARTY',tags:'# SUNLIGHT # OPEN AIR # EASY # TOGETHER',ko:'밤이 아니어도 파티는 가능하다.\n햇빛이 드는 공간이나 야외에서 음악과 가벼운 활동을 함께 즐기는 밝고 느슨한 파티 문화.',space:'Rooftop / Terrace / Garden / Bright Room',sound:'Disco / Funk / House / Indie Pop',mood:'Bright / Easy / Social',keys:'Portable Speaker / Natural Light / Colorful Objects / Picnic Setup'},
 {n:'004',title:'THEMED PARTY',tags:'# DRESS CODE # COLOR # CONCEPT # PLAY',ko:'하나의 컬러, 시대, 영화, 스타일 같은 테마를 정하고\n공간과 음악, 옷까지 하나의 컨셉으로 연결해 즐기는 파티.',space:'Any Room / Studio / Small Venue',sound:'Depends on the Theme',mood:'Playful / Expressive / Unexpected',keys:'Dress Code / Decorations /\nProps / Themed Playlist'},
 {n:'005',title:'RAVE NIGHT',tags:'# DARK # ELECTRONIC # DANCE # REPEAT',ko:'강한 비트와 반복되는 리듬, 빛과 움직임에 몰입하는 파티 문화. 음악을 듣는 것보다 몸으로 경험하는 감각에 가까운 밤.',space:'Dark Room / Basement / Studio',sound:'Techno / Trance / Electro / Hard House',mood:'Intense / Immersive / Energetic',keys:'DJ Setup / Strobe or Moving Light / Dark Space / Visual Graphics'},
 {n:'006',title:'AFTER PARTY',tags:'# LATE # SMALL # CHILL # STAY A LITTLE LONGER',ko:'큰 파티가 끝난 뒤 소수의 사람들이 남아\n음악을 조금 낮추고 대화와 여운을 이어가는 느슨하고 사적인 파티 문화.',space:'Bedroom / Living Room / Small Lounge',sound:'Downtempo / R&B / Ambient / Chill House',mood:'Loose / Intimate / Late-night',keys:'Low Lighting / Small Speakers /\nFloor Seating / Slow Playlist'}
];
const sceneImages=[
 ['/assets/culture/house-main.jpg','/assets/culture/house-detail.jpg','/assets/culture/house-candid.jpg'],
 ['/assets/culture/listening-detail.jpg','/assets/culture/listening-wide.jpg'],
 ['/assets/culture/day-main.jpg'],
 ['/assets/culture/themed-main.jpg','/assets/culture/themed-detail.jpg','/assets/culture/themed-style.jpg'],
 ['/assets/culture/rave-main.jpg'],
 ['/assets/culture/after-main.jpg','/assets/culture/after-detail.jpg']
];

function Logo(){return <Link className="culture-logo" to="/"><img src="/logo1.png" alt="ROOMiROOMi"/></Link>}
function Record(){return <span className="culture-vinyl" aria-hidden="true"><i/><b/></span>}
function Details({scene}){return <div className="culture-details"><h3>MAKE IT YOURS</h3><dl><dt>SPACE</dt><dd>{scene.space}</dd><dt>SOUND</dt><dd>{scene.sound}</dd><dt>MOOD</dt><dd>{scene.mood}</dd><dt>KEY ELEMENTS</dt><dd>{scene.keys}</dd></dl></div>}
function Scene({scene,index}){const images=sceneImages[index];const detailPath=`/culture/${String(index+1).padStart(3,'0')}`;return <section className={`culture-scene culture-scene--${index+1}`}>
 <header><small>SCENE {scene.n}</small><h2>{scene.title}<Record/></h2></header>
 <div className="culture-block culture-block--a">{images[0]&&<img src={images[0]} alt={`${scene.title} main scene`}/>}</div><div className="culture-block culture-block--b">{images[1]&&<img src={images[1]} alt={`${scene.title} detail`}/>}</div><div className="culture-block culture-block--c">{images[2]&&<img src={images[2]} alt={`${scene.title} candid`}/>}</div>
 <div className="culture-description"><strong>{scene.tags}</strong><p>{scene.ko}</p></div><Details scene={scene}/>
 <Link className="culture-explore" to={detailPath}>Explore This Scene</Link>
 </section>}

export default function Culture(){return <main className="culture-page">
 <nav className="culture-nav"><Link to="/about">Meet ROOMi</Link><Link className="active" to="/culture">What’s Going on?</Link><Link to="/reservation">Let’s Party</Link></nav><Logo/>
 <div className="culture-intro"><h1>ROOMi SCENE</h1><p>Different ways to gather, listen and party.<br/>Find a scene that feels like yours.</p></div>
 {scenes.map((scene,index)=><Scene key={scene.n} scene={scene} index={index}/>)}
 <section className="culture-session"><h2>ROOMi SESSION</h2><div className="culture-playlists">{[1,2,3].map(n=><article key={n}><div className="playlist-art"><img src={`/figma/culture-assets/vinyl-${n}.svg`} alt=""/></div><div><h3>Playlist {n}</h3>{Array.from({length:7},(_,i)=><p key={i}>0{i+1} Music</p>)}</div></article>)}</div></section>
 <section className="culture-tag"><h2>ROOMi TAG</h2><div className="culture-tag-art"><img className="tag-love" src="/figma/culture-assets/graffiti-love.svg" alt=""/><img className="tag-word" src="/figma/culture-assets/graffiti-word.svg" alt=""/></div></section>
 </main>}
