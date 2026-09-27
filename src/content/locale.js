export const DEFAULT_LOCALE = 'en';

export const NAV_ITEMS = [
  { key: 'about', path: '/about' },
  { key: 'culture', path: '/culture' },
  { key: 'reservation', path: '/reservation' },
];

export const localeContent = {
  ko: {
    nav: { about: 'Meet ROOMi', culture: "What's going on?", reservation: "Let's party", cart: 'Shopping Cart' },
    about: {
      hero: {
        index: 'ABOUT / 00', eyebrow: 'ROOMiVERSE 소개', issue: 'ISSUE NO. 01 — SEOUL',
        titleTop: 'THIS IS', titleBottom: 'ROOMiVERSE.', tag: 'MEET ROOMi',
        subcopy: '너의 방. 너의 우주.',
        description: 'ROOMiVERSE는 음악을 플레이하는 장벽을 낮추고, 누구나 자신만의 음악적 공간을 만들 수 있도록 합니다.',
        descriptionSecondary: 'ROOMiVERSE lowers the barrier to playing music and helps anyone create their own musical space.',
        signal: 'TURN THE ROOM UP ↗',
      },
      problem: {
        index: '01', label: 'THE PROBLEM', statement: 'MUSIC SHOULD BE EASIER TO PLAY.', handNote: '왜 이렇게 복잡해?',
        description: ['음악을 직접 플레이하거나 파티 경험을 만드는 과정에는 장비, 기술, 세팅, 준비 등의 장벽이 존재합니다.', '하고 싶은 순간은 분명한데, 시작하기까지 너무 많은 것이 필요합니다.'],
        barriers: ['GEAR', 'TECHNICAL SKILLS', 'SETUP', 'PREPARATION'],
        visualLabel: 'IMAGE PLACEHOLDER / CLUB CULTURE', visualStamp: 'TOO MUCH SETUP',
      },
      idea: {
        index: '02', label: 'THE ROOMiVERSE IDEA', signal: 'LOWER THE BARRIER', statement: 'YOUR ROOM. YOUR UNIVERSE.',
        description: 'ROOMiVERSE는 이러한 장벽을 낮춰 누구나 더 직관적으로 음악을 플레이하고, 자신의 공간을 하나의 음악적 세계로 만들 수 있도록 합니다.',
        visualLabel: 'ROOM → SOUND → UNIVERSE',
      },
      ways: {
        index: '03', label: 'TWO WAYS TO EXPERIENCE ROOMiVERSE', statement: 'ONE IDEA. TWO WAYS TO PLAY.',
        intro: '방식은 다르지만, 같은 브랜드 철학을 구현합니다.',
        items: [
          { index: 'A', category: 'PRODUCT', direction: 'ROOMi GOES WITH YOU', title: 'PLAY IT YOURSELF', description: 'Take ROOMi with you and play anywhere.', detail: 'Product는 사용자가 직접 ROOMiVERSE를 경험하는 방식입니다. 휴대 가능하고 직관적인 도구를 통해 원하는 곳에서 직접 음악을 플레이할 수 있습니다.', cta: 'EXPLORE THE PRODUCT' },
          { index: 'B', category: 'PARTY DELIVERY', direction: 'ROOMi COMES TO YOU', title: 'WE BRING THE PARTY', description: 'Your space. Our gear. One party.', detail: 'Party Delivery는 ROOMiVERSE가 사용자에게 찾아가는 방식입니다. 장비와 조명, 공간 연출을 통해 사용자의 공간을 함께 즐기는 음악 경험으로 바꿉니다.', cta: 'LET’S PARTY' },
        ],
      },
      values: {
        index: '04', label: 'CORE VALUES', intro: '직접 플레이하든 ROOMiVERSE가 파티를 가져가든, 그 경험은 세 가지 핵심 가치 위에서 만들어집니다.', handNote: 'FEEL IT!',
        items: [
          { title: 'PLAY', description: '직접 만지고, 시도하고, 나만의 방식으로 즐깁니다.', tag: 'TOUCH / TRY / OWN' },
          { title: 'IMMERSION', description: '복잡한 준비는 줄이고, 음악과 공간에 더 깊게 몰입합니다.', tag: 'LESS SETUP / MORE MUSIC' },
          { title: 'EXPANSION', description: '작은 플레이에서 시작해 기능, 공간, 사람으로 확장됩니다.', tag: 'ROOM / PEOPLE / UNIVERSE' },
        ],
      },
      finalCta: {
        index: '05', label: 'CHOOSE YOUR WAY IN', title: '이제, 어떤 방식으로 ROOMiVERSE에 들어올래?', sticker: 'THIS WAY →',
        play: 'I WANT TO PLAY.', party: 'BRING THE PARTY TO ME.', footer: 'PLAY THE ROOM / BUILD THE UNIVERSE',
      },
    },
    culture: { placeholder: 'CULTURE WIREFRAME CANVAS' },
    reservation: { placeholder: 'RESERVATION WIREFRAME CANVAS' },
  },
  en: {
    nav: { about: 'Meet ROOMi', culture: "What's going on?", reservation: "Let's party", cart: 'Shopping Cart' },
    about: {
      hero: {
        index: 'ABOUT / 00', eyebrow: 'Introducing ROOMiVERSE', issue: 'ISSUE NO. 01 — SEOUL',
        titleTop: 'THIS IS', titleBottom: 'ROOMiVERSE.', tag: 'MEET ROOMi',
        subcopy: 'Your room. Your universe.',
        description: 'ROOMiVERSE lowers the barrier to playing music and helps anyone create their own musical space.',
        descriptionSecondary: 'ROOMiVERSE는 음악을 플레이하는 장벽을 낮추고, 누구나 자신만의 음악적 공간을 만들 수 있도록 합니다.',
        signal: 'TURN THE ROOM UP ↗',
      },
      problem: {
        index: '01', label: 'THE PROBLEM', statement: 'MUSIC SHOULD BE EASIER TO PLAY.', handNote: 'too complicated?',
        description: ['Playing music or creating a party experience often comes with barriers—gear, technical skills, setup, and preparation.', 'The urge to play is simple. Getting started should be, too.'],
        barriers: ['GEAR', 'TECHNICAL SKILLS', 'SETUP', 'PREPARATION'],
        visualLabel: 'IMAGE PLACEHOLDER / CLUB CULTURE', visualStamp: 'TOO MUCH SETUP',
      },
      idea: {
        index: '02', label: 'THE ROOMiVERSE IDEA', signal: 'LOWER THE BARRIER', statement: 'YOUR ROOM. YOUR UNIVERSE.',
        description: 'ROOMiVERSE lowers those barriers so anyone can play music more intuitively and turn their space into their own musical universe.',
        visualLabel: 'ROOM → SOUND → UNIVERSE',
      },
      ways: {
        index: '03', label: 'TWO WAYS TO EXPERIENCE ROOMiVERSE', statement: 'ONE IDEA. TWO WAYS TO PLAY.',
        intro: 'Two different ways, one same philosophy.',
        items: [
          { index: 'A', category: 'PRODUCT', direction: 'ROOMi GOES WITH YOU', title: 'PLAY IT YOURSELF', description: 'Take ROOMi with you and play anywhere.', detail: 'Product is the way you experience ROOMiVERSE by yourself—a portable and intuitive tool for playing music in your own space.', cta: 'EXPLORE THE PRODUCT' },
          { index: 'B', category: 'PARTY DELIVERY', direction: 'ROOMi COMES TO YOU', title: 'WE BRING THE PARTY', description: 'Your space. Our gear. One party.', detail: 'Party Delivery is the way ROOMiVERSE comes to you—bringing gear, lighting, and atmosphere to transform your space into a shared music experience.', cta: 'LET’S PARTY' },
        ],
      },
      values: {
        index: '04', label: 'CORE VALUES', intro: 'Whether you play it yourself or let ROOMiVERSE bring the party, the experience is built on three core values.', handNote: 'FEEL IT!',
        items: [
          { title: 'PLAY', description: 'Touch it. Try it. Make it yours.', tag: 'TOUCH / TRY / OWN' },
          { title: 'IMMERSION', description: 'Less setup. More music.', tag: 'LESS SETUP / MORE MUSIC' },
          { title: 'EXPANSION', description: 'Start small. Make it bigger.', tag: 'ROOM / PEOPLE / UNIVERSE' },
        ],
      },
      finalCta: {
        index: '05', label: 'CHOOSE YOUR WAY IN', title: 'NOW, CHOOSE YOUR WAY IN.', sticker: 'THIS WAY →',
        play: 'I WANT TO PLAY.', party: 'BRING THE PARTY TO ME.', footer: 'PLAY THE ROOM / BUILD THE UNIVERSE',
      },
    },
    culture: { placeholder: 'CULTURE WIREFRAME CANVAS' },
    reservation: { placeholder: 'RESERVATION WIREFRAME CANVAS' },
  },
};
