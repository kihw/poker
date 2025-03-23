
import os
import shutil

def merge_components():
    # Mapping of improved components to their base versions
    component_mapping = {
        'ImprovedCombatInterface.jsx': 'CombatInterface.jsx',
        'ImprovedEventEncounter.jsx': 'EventEncounter.jsx',
        'ImprovedCard.jsx': 'EnhancedCard.jsx',
        'ImprovedBonusCardManager.jsx': 'BonusCardManager.jsx',
        'ImprovedRoguelikeWorldMap.jsx': 'RoguelikeWorldMap.jsx',
        'ImprovedActionFeedback.jsx': 'ActionFeedback.jsx',
        'ImprovedGameInterface.jsx': 'GameInterface.jsx'
    }

    base_path = 'src/components'

    for improved, base in component_mapping.items():
        improved_path = os.path.join(base_path, os.path.dirname(improved), improved)
        base_path_full = os.path.join(base_path, os.path.dirname(base), base)

        # If improved version exists and base version exists
        if os.path.exists(improved_path) and os.path.exists(base_path_full):
            # Read improved version
            with open(improved_path, 'r') as f:
                improved_content = f.read()

            # Check if improved version has significant changes
            if 'Improved' in improved_content:
                # Replace base version with improved content
                with open(base_path_full, 'w') as f:
                    f.write(improved_content)

                # Remove the improved version
                os.remove(improved_path)
                print(f"Merged {improved} into {base}")

def update_imports():
    # Function to recursively update imports in all files
    import re

    def update_file_imports(filepath):
        with open(filepath, 'r') as f:
            content = f.read()

        # Replacement rules
        replacements = {
            'from \'../components/card/ImprovedCard\'': 'from \'../components/card/EnhancedCard\'',
            'from \'../components/event/ImprovedEventEncounter\'': 'from \'../components/event/EventEncounter\'',
            'from \'../components/card/ImprovedBonusCardManager\'': 'from \'../components/card/BonusCardManager\'',
            'from \'../components/map/ImprovedRoguelikeWorldMap\'': 'from \'../components/map/RoguelikeWorldMap\'',
            'from \'../components/ui/ImprovedActionFeedback\'': 'from \'../components/ui/ActionFeedback\'',
            'from \'../components/ui/ImprovedGameInterface\'': 'from \'../components/ui/GameInterface\''
        }

        for old_import, new_import in replacements.items():
            content = content.replace(old_import, new_import)

        with open(filepath, 'w') as f:
            f.write(content)

    # Walk through all files in src directory
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                update_file_imports(filepath)

def main():
    merge_components()
    update_imports()

if __name__ == '__main__':
    main()
