/*
 * The six ROOMi party scenes ("tracks").
 * Hashtags, descriptions and MAKE IT YOURS specs come from the user's Figma
 * (What's Going On, node 186:906). Requirements, essentials and add-ons are
 * the draft copy from the earlier build: exhibition examples, not venue rules.
 * Photos: Pexels License, see docs/IMAGE_SOURCES-parties.md.
 */

export type Card = { title: string; copy: string; image: string; /** CSS object-position when the square crop should favour one side. */ pos?: string };

export type Party = {
  slug: string;
  no: string;
  name: string;
  short: string;
  tags: string[];
  description: string;
  lead: string;
  intro: string;
  spec: { space: string; sound: string; mood: string; key: string };
  requirements: { size: string; place: string; guests: string; power: string };
  hero: string;
  heroAlt: string;
  side: string;
  /** A third photo used only by the What's Going On list layouts that show three images. */
  extra?: { src: string; alt: string };
  essentials: Card[];
  addOns: Card[];
};

const p = (name: string) => `/parties/${name}.webp`;

export const PARTIES: Party[] = [
  {
    slug: "house-party",
    no: "01",
    name: "House Party",
    short: "House",
    tags: ["HOME", "FRIENDS", "DANCE", "LATE NIGHT"],
    description: "거창한 장소 없이도 친구들과 음악, 조명, 작은 공간만으로 만들어지는 가장 개인적인 파티 문화.",
    lead: "거실이 오늘 밤의\n댄스 플로어가 된다.",
    intro: "Turn your living room into a dance floor. Familiar faces, your favorite tracks, and a little room to move.",
    spec: { space: "Living room / Bedroom", sound: "House / Pop / Hip-hop", mood: "Casual / Warm / Loud", key: "DJ setup / Mood lighting / Drinks / Friends" },
    requirements: { size: "8평 ~", place: "Indoor", guests: "6–12", power: "Power required" },
    hero: p("house-main"),
    heroAlt: "거실에서 음악에 맞춰 춤추는 친구들",
    side: p("house-detail"),
    extra: { src: p("house-candid"), alt: "파란 조명 아래 춤추는 사람" },
    essentials: [
      { title: "DJ Set", copy: "Your playlist, mixed into one shared night.", image: p("details/dj-set") },
      { title: "Party Lights", copy: "A little color to change the room.", image: p("details/party-lights") },
      { title: "Setup Crew", copy: "Sound and lighting, ready before friends arrive.", image: p("details/setup-crew") },
      { title: "Dance Space", copy: "Move the furniture. Make room for the music.", image: p("details/dance-space") },
    ],
    addOns: [
      { title: "Karaoke", copy: "Pass the mic. Give everyone a chorus.", image: p("house-party/karaoke") },
      { title: "Disco Ball", copy: "Small reflections, a bigger party mood.", image: p("house-party/disco-ball") },
      { title: "Party Decor", copy: "A few details that make it yours.", image: p("house-party/party-decor") },
      { title: "Table Setup", copy: "A place for drinks, snacks, and a quick break.", image: p("house-party/table-setup") },
    ],
  },
  {
    slug: "listening-party",
    no: "02",
    name: "Listening Party",
    short: "Listening",
    tags: ["MUSIC", "ALBUM", "TALK", "SLOW NIGHT"],
    description: "춤추는 것보다 음악 자체에 집중하는 파티. 좋아하는 앨범이나 플레이리스트를 함께 듣고, 음악에 대한 취향과 이야기를 나누는 방식.",
    lead: "좋아하는 앨범 한 장,\n함께 들으면 다른 이야기.",
    intro: "Give the album your full attention. Sit close, listen together, and trade stories between tracks.",
    spec: { space: "Living room / Studio / Lounge", sound: "R&B / Jazz / Indie / Ambient", mood: "Calm / Intimate / Focused", key: "Speakers / Vinyl or Playlist / Soft Lighting / Comfortable Seating" },
    requirements: { size: "6평 ~", place: "Quiet indoor", guests: "4–8", power: "Power required" },
    hero: p("listening-wide"),
    heroAlt: "소파에 모여 앉아 음악을 듣는 친구들",
    side: p("listening-detail"),
    essentials: [
      { title: "Vinyl & Playlist", copy: "One album or a selection worth sharing.", image: p("details/vinyl-playlist") },
      { title: "Shared Listening", copy: "A clear sound setup at a comfortable volume.", image: p("details/shared-listening") },
      { title: "Comfortable Seats", copy: "Find a seat and stay for the whole record.", image: p("details/comfortable-seats") },
      { title: "Soft Lighting", copy: "Warm light that lets the music lead.", image: p("details/soft-lighting") },
    ],
    addOns: [
      { title: "Vinyl Session", copy: "Bring a favorite record to the turntable.", image: p("listening-detail") },
      { title: "Album Talk", copy: "Share the story behind your favorite track.", image: p("listening-wide") },
      { title: "Cozy Corner", copy: "Add cushions for a slower listening night.", image: p("after-detail") },
      { title: "Refreshment Table", copy: "Keep a drink nearby between album sides.", image: p("house-party/table-setup") },
    ],
  },
  {
    slug: "day-party",
    no: "03",
    name: "Day Party",
    short: "Day",
    tags: ["SUNLIGHT", "OPEN AIR", "EASY", "TOGETHER"],
    description: "밤이 아니어도 파티는 가능하다. 햇빛이 드는 공간이나 야외에서 음악과 가벼운 활동을 함께 즐기는 밝고 느슨한 파티 경험.",
    lead: "햇살 좋은 오후,\n파티는 지금부터.",
    intro: "Follow the daylight. Easy music, open air, and friends who have nowhere else to be.",
    spec: { space: "Rooftop / Terrace / Garden / Bright room", sound: "Disco / Funk / House / Indie Pop", mood: "Bright / Easy / Social", key: "Portable speaker / Natural light / Colorful objects / Picnic setup" },
    requirements: { size: "10평 ~", place: "Indoor · Outdoor", guests: "8–16", power: "Power nearby" },
    hero: p("day-main"),
    heroAlt: "햇살 좋은 루프톱에서 웃고 있는 친구들",
    side: p("day-rooftop"),
    essentials: [
      { title: "Daytime Sound", copy: "An easy playlist for an afternoon together.", image: p("details/daytime-sound") },
      { title: "Open-air Space", copy: "Room to gather, with shade within reach.", image: p("details/open-air-space") },
      { title: "Relaxed Seating", copy: "A place to sit, talk, and slow down.", image: p("details/relaxed-seating") },
      { title: "Drinks & Table", copy: "Keep refreshments close to the conversation.", image: p("details/drinks-table") },
    ],
    addOns: [
      { title: "Sunset Session", copy: "Let the afternoon playlist roll into evening.", image: p("day-main") },
      { title: "Colorful Details", copy: "Bring a little color into the daylight.", image: p("themed-detail") },
      { title: "Group Moments", copy: "Make space for photos with your people.", image: p("day-rooftop") },
      { title: "Evening Lights", copy: "Warm accents for when the sun goes down.", image: p("house-party/party-decor") },
    ],
  },
  {
    slug: "themed-party",
    no: "04",
    name: "Themed Party",
    short: "Themed",
    tags: ["DRESS CODE", "COLOR", "CONCEPT", "PLAY"],
    description: "하나의 컬러, 시대, 영화, 스타일 같은 테마를 정하고 공간과 음악, 옷까지 하나의 컨셉으로 연결해 즐기는 파티.",
    lead: "하나의 컨셉으로,\n완전히 다른 하루.",
    intro: "Pick a world and step into it. Match the music, the room, and the dress code to one playful idea.",
    spec: { space: "Any room / Studio / Small venue", sound: "Depends on the theme", mood: "Playful / Expressive / Unexpected", key: "Dress code / Decorations / Props / Themed playlist" },
    requirements: { size: "8평 ~", place: "Indoor", guests: "6–12", power: "Power required" },
    hero: p("themed-main"),
    heroAlt: "유령 의상을 맞춰 입은 친구들",
    side: p("themed-detail"),
    extra: { src: p("themed-style"), alt: "붉은 조명 아래 분장한 사람들" },
    essentials: [
      { title: "Dress Code", copy: "A shared color, character, or era.", image: p("details/dress-code") },
      { title: "Theme Decor", copy: "Carry the concept into the smallest details.", image: p("details/theme-decor") },
      { title: "Themed Playlist", copy: "Build a soundtrack that belongs to your world.", image: p("details/themed-playlist") },
      { title: "Photo Moment", copy: "A corner made for your costumes and friends.", image: p("details/photo-moment") },
    ],
    addOns: [
      { title: "Costume Props", copy: "A little extra character for everyone.", image: p("themed-main") },
      { title: "Color Lighting", copy: "Give the room its own signature color.", image: p("house-party/party-lights") },
      { title: "Sing-along", copy: "Turn the theme songs into a shared chorus.", image: p("house-party/karaoke") },
      { title: "Themed Table", copy: "Let the table join the dress code.", image: p("house-party/table-setup") },
    ],
  },
  {
    slug: "rave-party",
    no: "05",
    name: "Rave Party",
    short: "Rave",
    tags: ["DARK", "ELECTRONIC", "DANCE", "REPEAT"],
    description: "강한 비트와 반복되는 리듬, 빛과 움직임에 몰입하는 파티 문화. 음악을 듣는 것보다 몸으로 경험하는 감각에 가까운 파티.",
    lead: "비트가 흐르는 곳,\n우리의 밤이 시작된다.",
    intro: "Build the night around the beat. A dark room, a focused dance floor, and a sound that keeps moving.",
    spec: { space: "Dark room / Basement / Studio", sound: "Techno / Trance / Electro / Hard House", mood: "Intense / Immersive / Energetic", key: "DJ setup / Strobe or moving light / Dark space / Visual graphics" },
    requirements: { size: "15평 ~", place: "Dark indoor", guests: "12–20", power: "DJ · PA · lights" },
    hero: p("rave-main"),
    heroAlt: "어두운 공간에서 레이저 조명 아래 춤추는 사람들",
    side: p("dance-floor"),
    essentials: [
      { title: "DJ Booth", copy: "A continuous set with room to build momentum.", image: p("details/dj-booth") },
      { title: "Dance Floor", copy: "Open space to move with the crowd.", image: p("details/dance-floor") },
      { title: "Immersive Lights", copy: "Color and movement that follow the night.", image: p("details/immersive-lights") },
      { title: "Sound Setup", copy: "A dedicated DJ and speaker setup for the room.", image: p("details/sound-setup") },
    ],
    addOns: [
      { title: "Disco Reflections", copy: "Add another layer of light above the floor.", image: p("house-party/disco-ball") },
      { title: "Color Accents", copy: "Shape a distinct mood around the booth.", image: p("house-party/party-lights") },
      { title: "Setup Support", copy: "Help arranging the booth and lighting.", image: p("house-party/setup-crew") },
      { title: "Chill Zone", copy: "A quieter corner for water and a breather.", image: p("after-detail") },
    ],
  },
  {
    slug: "after-party",
    no: "06",
    name: "After Party",
    short: "After",
    tags: ["LATE", "SMALL", "CHILL", "STAY A LITTLE LONGER"],
    description: "큰 파티가 끝난 뒤 소수의 사람들이 남아 음악을 조금 낮추고 대화와 여운을 이어가는 느슨하고 사적인 파티 경험.",
    lead: "끝내기 아쉬운 밤,\n조금만 더 함께.",
    intro: "Stay a little longer. Lower the volume, find a comfortable seat, and let the night settle.",
    spec: { space: "Bedroom / Living room / Small lounge", sound: "Downtempo / R&B / Ambient / Chill House", mood: "Loose / Intimate / Late-night", key: "Low lighting / Small speakers / Floor seating / Slow playlist" },
    requirements: { size: "5평 ~", place: "Indoor lounge", guests: "3–6", power: "Power required" },
    hero: p("after-main"),
    heroAlt: "소파에 모여 편안하게 웃고 있는 친구들",
    side: p("after-detail"),
    essentials: [
      { title: "Slow Playlist", copy: "Keep the music low and the mood unhurried.", image: p("details/slow-playlist") },
      { title: "Lounge Seating", copy: "Sofas and cushions for the last conversation.", image: p("details/lounge-seating") },
      { title: "Warm Light", copy: "A softer glow to close the night.", image: p("details/warm-light") },
      { title: "Small Gathering", copy: "Just a few friends, without a schedule.", image: p("details/small-gathering"), pos: "92% 50%" },
    ],
    addOns: [
      { title: "One Last Record", copy: "Pick a final album before heading home.", image: p("listening-vinyl") },
      { title: "Late-night Table", copy: "Make room for a snack and a glass of water.", image: p("house-party/table-setup") },
      { title: "Extra Cushions", copy: "Make the quiet corner a little more comfortable.", image: p("after-detail") },
      { title: "After-hours Talk", copy: "Let the best stories outlast the party.", image: p("after-main") },
    ],
  },
];

export const partyBySlug = (slug: string) => PARTIES.find((p) => p.slug === slug);
