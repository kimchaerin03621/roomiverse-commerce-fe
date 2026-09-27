import { Link } from 'react-router-dom';
import './About.css';

const brandStory = 'For those who love DJing but have been held back by the barriers of equipment, ROOMi offers an experience where anyone can become an artist. ROOMi empowers anyone, anywhere, to freely create a space that reflects their own musical universe. ROOMiVERSE is a DJ lifestyle brand for people who love music and want to play it themselves. Wherever they are and whoever they are with, ROOMiVERSE helps them create the party space they want through DJ equipment, spatial styling, and on-site setup services.';

const mission = 'Our mission is to lower the barriers to DJing and make it easier for anyone to play, share, and enjoy music anywhere, with anyone. We envision a world where playing music becomes an everyday form of play, and any space can become a place where people connect through music.';

const values = [
  ['Play', 'Touch it. Try it.\nMake it yours.'],
  ['Immersion', 'Less setup.\nMore music.'],
  ['Expansion', 'Start small.\nMake it bigger.'],
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <img src="/figma/about-assets/hero.png" alt="People at a ROOMiVERSE party" />
        <div className="about-hero-shade" />
        <nav className="about-nav">
          <Link className="active" to="/about">Meet ROOMi</Link>
          <Link to="/culture">What’s Going on?</Link>
          <Link to="/reservation">Let’s Party</Link>
        </nav>
        <Link className="about-logo" to="/"><img src="/logo1.png" alt="ROOMiROOMi" /></Link>
        <div className="about-brand">
          <div className="about-roomi-mark" role="img" aria-label="ROOMi ROOMi, ROOMiVERSE" />
          <h1>BRAND STORY</h1>
          <p>{brandStory}</p>
        </div>
        <a className="about-down" href="#about-us"><img src="/figma/about-assets/down.svg" alt="Scroll down" /></a>
      </section>
      <section className="about-us" id="about-us">
        <div className="about-us-photo"><img src="/figma/about-assets/about-photo.png" alt="Friends raising bottles at a party" /></div>
        <div className="about-us-copy"><h2>ABOUT<br />US</h2><img src="/figma/about-assets/graffiti-x.svg" alt="" /><p>{mission}</p></div>
      </section>
      <section className="about-values">
        <h2>Value</h2>
        <div>{values.map(([title, copy], index) => <article key={title}><div className={`about-value-art about-value-art--${index + 1}`} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="about-how"><h2>HOW</h2><div><img src="/figma/about-assets/how-left.png" alt="Purple neon room" /><img src="/figma/about-assets/how-right.png" alt="Pink room with disco balls" /></div></section>
    </main>
  );
}
