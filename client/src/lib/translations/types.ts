export interface Translations {
  about: string;
  aboutDescription: string;
  accuracy: string;
  adaptiveLearning: string;
  appearance: string;
  appName: string;
  bestTime: string;
  builtWith: string;
  chooseTheme: string;
  converter: string;
  copied: string;
  copyFailed: string;
  correct: string;
  correctAnswer: string;
  currentStreak: string;
  dailyReminders: string;
  darkTheme: string;
  enterText: string;
  exampleAnswers: string;
  femaleVoice: string;
  hideStats: string;
  hint: string;
  incorrect: string;
  interfaceLanguage: string;
  language: string;
  lastFiveTimes: string;
  learning: string;
  learningProgress: string;
  lightTheme: string;
  maleVoice: string;
  markAllAsRead: string;
  mastered: string;
  natoAlphabet: string;
  natoHints: Record<string, string>;
  nextQuestion: string;
  noNotifications: string;
  notificationDescription: string;
  notifications: string;
  notificationsPanelTitle: string;
  noTimesRecorded: string;
  placeholder: string;
  playPronunciation: string;
  pressEnterToSubmit: string;
  pressEscapeToSkip: string;
  question: string;
  questionCount: string;
  quickReference: string;
  quiz: string;
  wordQuiz: string;
  quizTimes: string;
  rainbowTheme: string;
  restartQuiz: string;
  review: string;
  reviewYourAnswers: string;
  robotVoice: string;
  score: string;
  sessionComplete: string;
  settings: string;
  showLess: string;
  showStats: string;
  skipQuestion: string;
  spacedRepetitionDescription: string;
  spacedRepetitionReminders: string;
  speakAnswer: string;
  speechNotAvailable: string;
  startQuiz: string;
  startVoiceInput: string;
  stop: string;
  stopVoiceInput: string;
  submitAnswer: string;
  systemTheme: string;
  testVoice: string;
  textToSpeechVoice: string;
  theme: string;
  totalSessions: string;
  tryAgain: string;
  typeNatoWordForLetter: string;
  version: string;
  viewFullAlphabet: string;
  voiceInputActive: string;
  voiceSettings: string;
  yourAnswer: string;
  speechRate: string;
  pitch: string;
  volume: string;
  enterCustomWord: string;
  enterYourWordOrPhrase: string;
  useThisWord: string;
  // WordDisplay localization
  currentWordLabel: string;
  customWordLabel: string;
  currentWordSpeech: string; // e.g., 'Current word is: {word}'
  difficultyLabels: {
    easy: string;
    medium: string;
    hard: string;
  };
  categoryLabels: {
    animals: string;
    places: string;
    nature: string;
    technology: string;
    home: string;
    objects: string;
    transport: string;
    [key: string]: string;
  };
  // NATO Input specific translations
  natoInputTitle: string;
  natoInputPlaceholder: string;
  natoInputListening: string;
  natoInputLiveScore: string;

  // Quiz Header translations
  wordQuizInstructions: string;

  // Quiz Actions translations
  retry: string;
  checkAnswer: string;
  newRandomWord: string;
  cancelCustom: string;
  customWord: string;

  // Quiz Results translations
  perfect: string;
  results: string;
  expectedNato: string;
  play: string;
  letterByLetter: string;
}
