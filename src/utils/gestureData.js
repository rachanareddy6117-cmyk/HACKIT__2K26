/**
 * Practice and Translation Demo Data for EchoSign
 */

export const PRACTICE_LESSONS = [
  {
    id: 1,
    targetSign: 'OPEN_HAND',
    title: 'Open Hand (Hello / Wave)',
    instruction: 'Extend all 5 fingers facing the camera.',
    hint: 'Keep your palm open towards the lens.',
    emoji: '👋',
    text: 'HELLO'
  },
  {
    id: 2,
    targetSign: 'THUMBS_UP',
    title: 'Thumbs Up (Yes / Affirmative)',
    instruction: 'Make a fist and extend your thumb upwards.',
    hint: 'Point your thumb directly up.',
    emoji: '👍',
    text: 'YES'
  },
  {
    id: 3,
    targetSign: 'FIST',
    title: 'Fist (Stop / Wait)',
    instruction: 'Curle all fingers tightly into a fist.',
    hint: 'Keep all fingers closed against your palm.',
    emoji: '✊',
    text: 'STOP'
  },
  {
    id: 4,
    targetSign: 'POINT',
    title: 'Point (There / Direction)',
    instruction: 'Extend only your index finger while curling other fingers.',
    hint: 'Point up or straight ahead.',
    emoji: '👉',
    text: 'THERE'
  },
  {
    id: 5,
    targetSign: 'TWO_FINGERS',
    title: 'Two Fingers (Victory / Peace / Two)',
    instruction: 'Extend your index and middle fingers in a V-shape.',
    hint: 'Peace sign with index and middle fingers.',
    emoji: '✌️',
    text: 'TWO'
  }
];

export const DEMO_TRANSLATIONS = {
  "hello": { sign: "OPEN_HAND", output: "HELLO 👋", speech: "Hello, nice to meet you." },
  "yes": { sign: "THUMBS_UP", output: "YES 👍", speech: "Yes, I agree." },
  "stop": { sign: "FIST", output: "STOP ✊", speech: "Please stop." },
  "there": { sign: "POINT", output: "THERE 👉", speech: "Over there." },
  "two": { sign: "TWO_FINGERS", output: "TWO ✌️", speech: "Quantity of two." },
  "help": { sign: "OPEN_HAND", output: "HELP 🆘", speech: "I need assistance." },
  "thank you": { sign: "THUMBS_UP", output: "THANK YOU 🙏", speech: "Thank you very much." },
  "water": { sign: "OPEN_HAND", output: "WATER 💧", speech: "I need water." }
};
