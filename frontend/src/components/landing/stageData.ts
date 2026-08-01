import type { ImageSourcePropType } from 'react-native';

/**
 * Content for the pinned landing stage.
 *
 * The stage is a gallery: one viewport-tall canvas that stays pinned while the
 * visitor scrolls, with a philosopher's portrait behind each scene. Each `Act`
 * pairs a thinker with the thing Alex actually does — Socrates asks, Marcus
 * separates what you control, Seneca is about the time worry eats, Epicurus is
 * about enough. The portraits are public-domain Wikimedia sources processed by
 * `scripts/build-portraits.py`; see that file for provenance and licences.
 *
 * Copy lives here rather than inside the animation engine so the web stage and
 * the reduced-motion / native fallback render exactly the same words.
 */

export interface Act {
  id: string;
  /** Roman-numeral-ish index shown in the rail and the label. */
  index: string;
  /** Name, shown small above the quote. */
  name: string;
  /** Lifespan, set in the same micro-label. */
  years: string;
  /** One-word theme, used as the section's eyebrow. */
  theme: string;
  /**
   * The display quote, split into lines by hand. Each line animates as its own
   * masked reveal, so where it breaks is a design decision, not a wrap.
   */
  lines: string[];
  /** Attribution suffix under the quote, when the quote needs a source. */
  source?: string;
  /** What Alex does with this idea — the line that keeps the page honest. */
  application: string;
  /** Which side the portrait sits on. Alternates down the page. */
  side: 'left' | 'right';
  /** Colour of the light behind the portrait for this act. */
  glow: string;
  portrait: ImageSourcePropType;
  /**
   * Natural width/height of the processed portrait. Recorded here because the
   * four sources crop to different shapes and the layer sizes off height alone.
   */
  aspect: number;
  /**
   * Portrait height as a fraction of the stage, art-directed per act.
   *
   * Sizing them all off one number does not work: the four crops range from
   * nearly square (Socrates) to narrow (Marcus), so a shared height makes the
   * wide ones swallow the copy column while the narrow ones look undersized.
   */
  portraitHeight: number;
}

export const ACTS: Act[] = [
  {
    id: 'socrates',
    index: '01',
    name: 'Socrates',
    years: 'c. 470 – 399 BC',
    theme: 'The question',
    lines: ['The unexamined', 'life is not', 'worth living.'],
    application:
      'Alex only asks. No diagnosis, no advice — one question at a time until the thing you are circling has a shape you can look at.',
    side: 'right',
    glow: '#3E7A57',
    portrait: require('../../../assets/people/socrates.webp'),
    aspect: 942 / 950,
    portraitHeight: 0.72,
  },
  {
    id: 'marcus',
    index: '02',
    name: 'Marcus Aurelius',
    years: '121 – 180 AD',
    theme: 'What is yours',
    lines: ['You have power', 'over your mind —', 'not outside events.'],
    source: 'Meditations',
    application:
      'For the days that are heavy without being a crisis. Alex helps you set down what is actually yours to carry, and leave the rest where it is.',
    side: 'left',
    glow: '#58A97A',
    portrait: require('../../../assets/people/marcus.webp'),
    aspect: 647 / 950,
    portraitHeight: 0.94,
  },
  {
    id: 'seneca',
    index: '03',
    name: 'Seneca',
    years: 'c. 4 BC – 65 AD',
    theme: 'The rehearsal',
    lines: ['We suffer more', 'in imagination', 'than in reality.'],
    application:
      'The thought on its fourth lap. Alex names the pattern behind it — a cognitive distortion, not a verdict — and asks what happens just before it arrives.',
    side: 'right',
    glow: '#E3D9A0',
    portrait: require('../../../assets/people/seneca.webp'),
    aspect: 838 / 950,
    portraitHeight: 0.84,
  },
  {
    id: 'epicurus',
    index: '04',
    name: 'Epicurus',
    years: '341 – 270 BC',
    theme: 'What is enough',
    lines: ['Nothing is enough', 'for the man to whom', 'enough is too little.'],
    application:
      'Alex is not another feed promising more. A library of quotes, books and short courses — brought up mid-sentence when it genuinely fits, and left alone otherwise.',
    side: 'left',
    glow: '#7FBF9A',
    portrait: require('../../../assets/people/epicurus.webp'),
    aspect: 560 / 950,
    portraitHeight: 0.92,
  },
];

/** The overlay that closes the pinned sequence — the objection, answered. */
export const STAGE_OUTRO = {
  eyebrow: 'Where the gallery ends',
  title: 'Not a therapist. On purpose.',
  body: 'Alex listens, asks, and points at ideas that are two thousand years old. Everything past that line is a person’s job, and Alex will say so.',
  points: [
    {
      title: 'No diagnoses',
      body: 'General ideas from psychology — never a verdict about your particular situation.',
    },
    {
      title: 'The conversation is yours',
      body: 'Tied to your account, visible only to you, deletable in one tap.',
    },
    {
      title: 'In a crisis, to people',
      body: 'A message that signals a threat to yourself stops the ordinary conversation and points you to a professional.',
    },
  ],
};

/** Drifts across the bottom of the stage, scrubbed by scroll. */
export const STAGE_TICKER = [
  'Stoicism',
  'Attachment',
  'Cognitive distortions',
  'Mindfulness',
  'Boundaries',
  'Meaning',
  'Self-knowledge',
  'Emotional intelligence',
];
