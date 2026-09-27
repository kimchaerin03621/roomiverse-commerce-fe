import { Link, Navigate, useParams } from 'react-router-dom';
import './CultureDetail.css';

const detailScenes = {
  '001': {
    number: '001', title: ['HOUSE', 'PARTY'],
    essentials: [
      { title: 'DJ SET', copy: 'Everything you need to start the set.', image: 'dj-set.jpg' },
      { title: 'PARTY LIGHTS', copy: 'Color that moves with the room.', image: 'party-lights.jpg' },
      { title: 'SETUP CREW', copy: 'We build it, then let it play.', image: 'setup-crew.jpg' },
      { title: 'DANCE FLOOR', copy: 'Make space for one more song.', image: 'dance-floor.jpg' },
    ],
    addOns: [
      { title: 'KARAOKE', copy: 'Pass the mic around.', image: 'karaoke.jpg' },
      { title: 'DISCO BALL', copy: 'A little more sparkle.', image: 'disco-ball.jpg' },
      { title: 'PARTY DECOR', copy: 'Details that set the mood.', image: 'party-decor.jpg' },
      { title: 'TABLE SETUP', copy: 'Drinks, snacks, and somewhere to land.', image: 'table-setup.jpg' },
    ],
  },
  '002': { number: '002', title: ['LISTENING', 'PARTY'] },
  '003': { number: '003', title: ['DAY', 'PARTY'] },
  '004': { number: '004', title: ['THEMED', 'PARTY'] },
  '005': { number: '005', title: ['RAVE', 'PARTY'] },
  '006': { number: '006', title: ['AFTER', 'PARTY'] },
};

export default function CultureDetail() {
  const { sceneId } = useParams();
  const scene = detailScenes[sceneId];

  if (!scene) return <Navigate to="/culture" replace />;

  return (
    <main className="culture-detail-page">
      <nav className="culture-detail-nav" aria-label="Primary navigation">
        <Link to="/about">Meet ROOMi</Link>
        <Link className="active" to="/culture">What’s Going on?</Link>
        <Link to="/reservation">Let’s Party</Link>
      </nav>

      <Link className="culture-detail-logo" to="/" aria-label="ROOMiROOMi home">
        <img src="/logo1.png" alt="ROOMiROOMi" />
      </Link>

      <section className="culture-detail-heading">
        <p>SCENE {scene.number}</p>
        <h1>{scene.title.map(word => <span key={word}>{word}</span>)}</h1>
      </section>

      <section className="culture-detail-requirements">
        <h2>Requirements</h2>
        {scene.number === '001' && (
          <>
            <dl className="culture-detail-requirements-list">
              <div><dt className="sr-only">Minimum space</dt><dd>8평 ~</dd></div>
              <div><dt className="sr-only">Setting</dt><dd>Indoor</dd></div>
              <div><dt className="sr-only">Guests</dt><dd>6~12</dd></div>
              <div><dt className="sr-only">Electricity</dt><dd>Power Required</dd></div>
            </dl>
            <img className="culture-detail-home-icon" src="/figma/culture-detail-assets/home.png" alt="" />
          </>
        )}
        <div aria-hidden="true" />
      </section>

      <section className="culture-detail-options culture-detail-options--essentials">
        <h2>Essentials</h2>
        <div className="culture-detail-grid">
          {(scene.essentials ?? []).map(item => <article className="culture-detail-card" key={item.title}><img src={`/assets/culture/house-party/${item.image}`} alt="" /><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}
        </div>
      </section>

      <section className="culture-detail-options culture-detail-options--addons">
        <h2>Add-Ons</h2>
        <div className="culture-detail-grid">
          {(scene.addOns ?? []).map(item => <article className="culture-detail-card" key={item.title}><img src={`/assets/culture/house-party/${item.image}`} alt="" /><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}
        </div>
      </section>

      <Link className="culture-detail-party" to="/reservation">Let’s Party</Link>
    </main>
  );
}
