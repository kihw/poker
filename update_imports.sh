#!/bin/bash

# Update import paths in all files
find ./src -type f -name "*.js" -o -name "*.jsx" | while read file; do
    # List of old to new mappings for import paths
    sed -i 's|ImprovedCombatInterface|CombatInterface|g' "$file"
    sed -i 's|ImprovedEventEncounter|EventEncounter|g' "$file"
    sed -i 's|ImprovedCard|Card|g' "$file"
    sed -i 's|ImprovedBonusCardManager|BonusCardManager|g' "$file"
    sed -i 's|ImprovedRoguelikeWorldMap|RoguelikeWorldMap|g' "$file"
    sed -i 's|ImprovedActionFeedback|ActionFeedback|g' "$file"
    sed -i 's|ImprovedGameInterface|GameInterface|g' "$file"
done

echo "Import paths updated successfully!"