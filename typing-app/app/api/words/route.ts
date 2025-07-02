import { NextResponse } from 'next/server';

// Top 300 Most Common English Words
const WORD_BANK = [
  'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are',
  'as', 'with', 'his', 'they', 'I', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by',
  'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'use',
  'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out',
  'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him',
  'time', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who',
  'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part', 'over',
  'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'year', 'live', 'me', 'back',
  'give', 'most', 'very', 'after', 'thing', 'our', 'just', 'name', 'good', 'sentence', 'man', 'think',
  'say', 'great', 'where', 'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean', 'old',
  'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form', 'three',
  'small', 'set', 'put', 'end', 'does', 'another', 'well', 'large', 'must', 'big', 'even', 'such',
  'because', 'turn', 'here', 'why', 'ask', 'went', 'men', 'read', 'need', 'land', 'different', 'home',
  'us', 'move', 'try', 'kind', 'hand', 'picture', 'again', 'change', 'off', 'play', 'spell', 'air',
  'away', 'animal', 'house', 'point', 'page', 'letter', 'mother', 'answer', 'found', 'study', 'still',
  'learn', 'should', 'America', 'world', 'high', 'every', 'near', 'add', 'food', 'between', 'own',
  'below', 'country', 'plant', 'last', 'school', 'father', 'keep', 'tree', 'never', 'start', 'city',
  'earth', 'eye', 'light', 'thought', 'head', 'under', 'story', 'saw', 'left', 'don\'t', 'few',
  'while', 'along', 'might', 'close', 'something', 'seem', 'next', 'hard', 'open', 'example', 'begin',
  'life', 'always', 'those', 'both', 'paper', 'together', 'got', 'group', 'often', 'run', 'important',
  'until', 'children', 'side', 'feet', 'car', 'mile', 'night', 'walk', 'white', 'sea', 'began',
  'grow', 'took', 'river', 'four', 'carry', 'state', 'once', 'book', 'hear', 'stop', 'without',
  'second', 'late', 'miss', 'idea', 'enough', 'eat', 'face', 'watch', 'far', 'Indian', 'really',
  'almost', 'let', 'above', 'girl', 'sometimes', 'mountain', 'cut', 'young', 'talk', 'soon', 'list',
  'song', 'being', 'leave', 'family', 'it\'s', 'body', 'music', 'color', 'stand', 'sun', 'questions',
  'fish', 'area', 'mark', 'dog', 'horse', 'birds', 'problem', 'complete', 'room', 'knew', 'since',
  'ever', 'piece', 'told', 'usually', 'didn\'t', 'friends', 'easy', 'heard', 'order', 'red', 'door',
  'sure', 'become', 'top', 'ship', 'across', 'today', 'during', 'short', 'better', 'best', 'however',
  'low', 'hours', 'black', 'products', 'happened', 'whole', 'measure', 'remember', 'early', 'waves',
  'reached', 'listen', 'wind', 'rock', 'space', 'covered', 'fast', 'several', 'hold', 'himself',
  'toward', 'five', 'step', 'morning', 'passed', 'vowel', 'true', 'hundred', 'against', 'pattern',
  'numeral', 'table', 'north', 'slowly', 'money', 'map', 'farm', 'pulled', 'draw', 'voice', 'seen',
  'cold', 'cried', 'plan', 'notice', 'south', 'sing', 'war', 'ground', 'fall', 'king', 'town',
  'I\'ll', 'unit', 'figure', 'certain', 'field', 'travel', 'wood', 'fire', 'upon'
];

export async function GET() {
  try {
    // Shuffle the word bank and return all 300 words
    const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
    
    return NextResponse.json({
      words: shuffled,
      count: shuffled.length,
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