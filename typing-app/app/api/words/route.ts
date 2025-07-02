import { NextResponse } from 'next/server';

// Comprehensive list of common English words for typing practice
const WORD_BANK = [
  // Programming & Tech
  'javascript', 'typescript', 'react', 'nextjs', 'framer', 'motion', 'animation', 'component',
  'useState', 'useEffect', 'tailwind', 'programming', 'developer', 'frontend', 'backend', 'fullstack',
  'nodejs', 'express', 'mongodb', 'postgresql', 'firebase', 'vercel', 'github', 'coding', 'algorithms',
  'functions', 'variables', 'constants', 'arrays', 'objects', 'classes', 'methods', 'properties',
  'interface', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'debugging', 'testing',
  'deployment', 'version', 'control', 'repository', 'branch', 'commit', 'merge', 'pull', 'request',
  
  // Common English Words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our',
  'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way',
  'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'about', 'after', 'again',
  'back', 'came', 'come', 'could', 'dear', 'does', 'down', 'each', 'find', 'first', 'from', 'give',
  'good', 'great', 'hand', 'have', 'here', 'home', 'house', 'just', 'keep', 'kind', 'know', 'last',
  'left', 'life', 'like', 'line', 'live', 'long', 'look', 'made', 'make', 'many', 'most', 'move',
  'much', 'name', 'never', 'night', 'only', 'open', 'over', 'part', 'place', 'play', 'right', 'said',
  'same', 'seem', 'show', 'side', 'such', 'take', 'than', 'that', 'them', 'they', 'this', 'time',
  'very', 'want', 'water', 'were', 'what', 'when', 'where', 'will', 'with', 'work', 'year', 'your',
  
  // Action Words
  'build', 'create', 'design', 'develop', 'write', 'read', 'think', 'learn', 'teach', 'speak', 'listen',
  'watch', 'wait', 'walk', 'run', 'jump', 'sit', 'stand', 'eat', 'drink', 'sleep', 'wake', 'start',
  'stop', 'begin', 'end', 'help', 'ask', 'tell', 'talk', 'call', 'meet', 'visit', 'leave', 'stay',
  'go', 'come', 'bring', 'take', 'give', 'get', 'buy', 'sell', 'pay', 'cost', 'save', 'spend',
  
  // Descriptive Words
  'big', 'small', 'large', 'little', 'high', 'low', 'long', 'short', 'wide', 'narrow', 'thick', 'thin',
  'heavy', 'light', 'strong', 'weak', 'fast', 'slow', 'quick', 'easy', 'hard', 'soft', 'smooth', 'rough',
  'hot', 'cold', 'warm', 'cool', 'dry', 'wet', 'clean', 'dirty', 'new', 'old', 'young', 'fresh', 'stale',
  'bright', 'dark', 'clear', 'cloudy', 'loud', 'quiet', 'busy', 'free', 'full', 'empty', 'rich', 'poor',
  'happy', 'sad', 'angry', 'calm', 'excited', 'bored', 'tired', 'energetic', 'healthy', 'sick', 'safe',
  
  // Objects & Things
  'book', 'computer', 'phone', 'car', 'house', 'door', 'window', 'table', 'chair', 'bed', 'room',
  'kitchen', 'bathroom', 'garden', 'tree', 'flower', 'grass', 'sky', 'sun', 'moon', 'star', 'cloud',
  'rain', 'snow', 'wind', 'fire', 'water', 'earth', 'mountain', 'river', 'ocean', 'beach', 'forest',
  'animal', 'bird', 'fish', 'dog', 'cat', 'horse', 'cow', 'pig', 'chicken', 'sheep', 'lion', 'tiger',
  'elephant', 'monkey', 'rabbit', 'mouse', 'snake', 'spider', 'butterfly', 'bee', 'apple', 'orange',
  'banana', 'grape', 'strawberry', 'lemon', 'tomato', 'carrot', 'potato', 'onion', 'bread', 'cheese',
  
  // Time & Numbers
  'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'week', 'month', 'year',
  'hour', 'minute', 'second', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october',
  'november', 'december', 'spring', 'summer', 'autumn', 'winter', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'hundred',
  
  // Places & Locations
  'city', 'town', 'village', 'country', 'state', 'street', 'road', 'park', 'school', 'hospital', 'store',
  'shop', 'restaurant', 'hotel', 'airport', 'station', 'office', 'factory', 'farm', 'church', 'library',
  'museum', 'theater', 'cinema', 'stadium', 'beach', 'mountain', 'desert', 'island', 'bridge', 'tunnel',
  
  // People & Relationships
  'person', 'people', 'man', 'woman', 'child', 'baby', 'boy', 'girl', 'family', 'parent', 'father',
  'mother', 'son', 'daughter', 'brother', 'sister', 'husband', 'wife', 'friend', 'neighbor', 'teacher',
  'student', 'doctor', 'nurse', 'police', 'farmer', 'worker', 'manager', 'boss', 'employee', 'customer',
  
  // Abstract Concepts
  'idea', 'thought', 'dream', 'hope', 'fear', 'love', 'hate', 'peace', 'war', 'freedom', 'justice',
  'truth', 'lie', 'secret', 'promise', 'mistake', 'success', 'failure', 'problem', 'solution', 'question',
  'answer', 'reason', 'cause', 'effect', 'chance', 'choice', 'decision', 'plan', 'goal', 'purpose',
  
  // Technology & Modern Life
  'internet', 'website', 'email', 'password', 'download', 'upload', 'social', 'media', 'network', 'cloud',
  'software', 'hardware', 'application', 'database', 'server', 'client', 'browser', 'search', 'click',
  'keyboard', 'mouse', 'screen', 'mobile', 'tablet', 'laptop', 'desktop', 'camera', 'video', 'photo',
  
  // Sports & Activities
  'sport', 'game', 'play', 'team', 'player', 'coach', 'win', 'lose', 'score', 'goal', 'ball', 'run',
  'jump', 'swim', 'dance', 'sing', 'music', 'song', 'movie', 'show', 'party', 'holiday', 'vacation',
  'travel', 'trip', 'adventure', 'explore', 'discover', 'experience', 'enjoy', 'fun', 'exciting',
  
  // Education & Learning
  'education', 'knowledge', 'skill', 'talent', 'ability', 'practice', 'study', 'research', 'experiment',
  'test', 'exam', 'grade', 'lesson', 'class', 'course', 'subject', 'science', 'math', 'history',
  'language', 'art', 'music', 'literature', 'philosophy', 'psychology', 'biology', 'chemistry', 'physics'
];

export async function GET() {
  try {
    // Shuffle the word bank and select 300 random words
    const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
    const randomWords = shuffled.slice(0, Math.min(300, shuffled.length));
    
    // If we need more words, we can repeat the process
    while (randomWords.length < 300) {
      const additionalShuffle = [...WORD_BANK].sort(() => Math.random() - 0.5);
      const needed = 300 - randomWords.length;
      randomWords.push(...additionalShuffle.slice(0, needed));
    }
    
    return NextResponse.json({
      words: randomWords,
      count: randomWords.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating word list:', error);
    return NextResponse.json(
      { error: 'Failed to generate word list' },
      { status: 500 }
    );
  }
} 