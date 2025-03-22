// src/utils/random.js

export function getRandomEnemyName() {
    const enemies = [
      "Goblin", 
      "Orc", 
      "Squelette", 
      "Troll", 
      "Bandit", 
      "Loup", 
      "Araignée", 
      "Zombie", 
      "Fantôme", 
      "Démon"
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
  
  export function getRandomEnemyImage() {
    const images = [
      "👺", 
      "👹", 
      "💀", 
      "👻", 
      "🧟", 
      "🐺", 
      "🕷️", 
      "🧙", 
      "👿", 
      "🧌"
    ];
    return images[Math.floor(Math.random() * images.length)];
  }
  
  export function weightedRandomChoice(choices, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const randomValue = Math.random() * totalWeight;
    
    let weightSum = 0;
    for (let i = 0; i < choices.length; i++) {
      weightSum += weights[i];
      if (randomValue <= weightSum) {
        return choices[i];
      }
    }
    
    return choices[choices.length - 1];
  }
  
  export function generateRandomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  }