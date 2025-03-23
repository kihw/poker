#!/bin/bash

# Project Refactoring Script

# 1. Update import paths
find ./src -type f \( -name "*.js" -o -name "*.jsx" \) | while read file; do
    # Replace old improved component imports
    sed -i 's|ImprovedCombatInterface|CombatInterface|g' "$file"
    sed -i 's|ImprovedEventEncounter|EventEncounter|g' "$file"
    sed -i 's|ImprovedCard|Card|g' "$file"
    sed -i 's|ImprovedBonusCardManager|BonusCardManager|g' "$file"
    sed -i 's|ImprovedRoguelikeWorldMap|RoguelikeWorldMap|g' "$file"
    sed -i 's|ImprovedActionFeedback|ActionFeedback|g' "$file"
    sed -i 's|ImprovedGameInterface|GameInterface|g' "$file"
done

# 2. Optimize imports
npx eslint ./src --fix

# 3. Performance optimization
npm run build

# 4. Run tests
npm test

echo "Refactoring complete! 🚀"
