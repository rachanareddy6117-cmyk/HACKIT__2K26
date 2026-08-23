import { PRACTICE_LESSONS } from './gestureData';

const HAND_TEMPLATE = [
  [0.5, 0.82], [0.46, 0.7], [0.41, 0.58], [0.37, 0.47], [0.34, 0.36],
  [0.5, 0.68], [0.55, 0.54], [0.58, 0.4], [0.6, 0.27],
  [0.5, 0.68], [0.51, 0.52], [0.52, 0.37], [0.52, 0.23],
  [0.5, 0.7], [0.46, 0.57], [0.44, 0.44], [0.43, 0.31],
  [0.5, 0.74], [0.54, 0.62], [0.57, 0.51], [0.59, 0.42],
].map(([x, y]) => ({ x, y }));

const ACTIONS = [
  'Notice the shape, then hold it steady for the camera.',
  'Match the reference pose with relaxed shoulders.',
  'Move slowly so the hand landmarks stay visible.',
  'Keep your hand centered and well lit.',
  'Hold the sign until the confirmation appears.',
];

function createModule(level, moduleNumber, lesson, category) {
  return {
    ...lesson,
    id: `${category}-${level}-${moduleNumber}`,
    module: moduleNumber,
    level,
    subtitle: category === 'deaf_mute' ? 'Communication sign' : 'Expression and action',
    description: `${lesson.title}. Practice this gesture as part of Level ${level}.`,
    instruction: lesson.instruction,
    hint: lesson.hint,
    skeletonTemplate: HAND_TEMPLATE,
    actionCue: ACTIONS[(level + moduleNumber) % ACTIONS.length],
  };
}

function createRoadmap(category, titles) {
  return Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;
    return {
      level,
      title: titles[index % titles.length],
      badge: level <= 3 ? 'STARTER' : level <= 10 ? 'BUILDER' : level <= 17 ? 'FLUENT' : 'MASTER',
      description: `Build confidence with five guided gestures in Level ${level}.`,
      modules: PRACTICE_LESSONS.map((lesson, lessonIndex) =>
        createModule(level, lessonIndex + 1, lesson, category)
      ),
    };
  });
}

export const DEAF_MUTE_ROADMAP = createRoadmap('deaf_mute', [
  'Foundations', 'Clear Shapes', 'Everyday Greetings', 'Useful Answers', 'Direction and Choice',
]);

export const AUTISM_INTROVERT_ROADMAP = createRoadmap('autism_introvert', [
  'Comfort Signals', 'Simple Choices', 'Daily Routines', 'Calm Communication', 'Confident Expression',
]);

export function getRoadmapByCategory(category = 'deaf_mute') {
  return category === 'autism_introvert' ? AUTISM_INTROVERT_ROADMAP : DEAF_MUTE_ROADMAP;
}
