// src/components/map/DebugOverlay.jsx
import React, { useEffect } from 'react';

// Composant temporaire pour trouver les overlays qui bloquent l'interaction
const DebugOverlay = () => {
  useEffect(() => {
    // Recherche les éléments qui pourraient bloquer l'interaction
    const findBlockingElements = () => {
      // Recherche des éléments avec position fixed/absolute qui couvrent une grande partie de l'écran
      const potentialBlockers = document.querySelectorAll(
        '.fixed, .absolute, [style*="position: fixed"], [style*="position:fixed"], [style*="position: absolute"], [style*="position:absolute"]'
      );

      console.log('Potentiels éléments bloquants:', potentialBlockers.length);

      potentialBlockers.forEach((el, index) => {
        // Récupère la taille et la position
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);

        // Vérifie si l'élément couvre une grande partie de l'écran
        const isLarge =
          rect.width > window.innerWidth * 0.5 &&
          rect.height > window.innerHeight * 0.5;

        if (isLarge) {
          console.log(`Élément bloquant potentiel #${index}:`, {
            element: el,
            width: rect.width,
            height: rect.height,
            position: styles.position,
            zIndex: styles.zIndex,
            pointerEvents: styles.pointerEvents,
            className: el.className,
            id: el.id,
          });

          // Marquer temporairement l'élément pour le rendre visible
          el.setAttribute('data-debug', 'potential-blocker');
          el.style.border = '3px solid red';

          // Vérifier si les pointer-events sont à 'none'
          if (styles.pointerEvents === 'none') {
            console.log(
              `L'élément #${index} a pointer-events: none et ne bloque pas les interactions`
            );
          } else {
            console.log(
              `L'élément #${index} pourrait bloquer les interactions`
            );
          }
        }
      });
    };

    // Exécute la fonction de détection après un court délai
    const timer = setTimeout(findBlockingElements, 1000);

    // Fonction pour désactiver temporairement tous les overlays potentiels
    window.disableAllOverlays = () => {
      document
        .querySelectorAll('[data-debug="potential-blocker"]')
        .forEach((el) => {
          el.style.pointerEvents = 'none';
          el.style.border = '3px dashed green';
          console.log('Overlay désactivé temporairement:', el);
        });
      alert(
        "Tous les overlays potentiels ont été temporairement désactivés. Essayez maintenant d'interagir avec la carte."
      );
    };

    console.log(
      'Composant de débogage des overlays activé. Pour désactiver temporairement tous les overlays potentiels, exécutez disableAllOverlays() dans la console.'
    );

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 p-2 bg-red-600 text-white text-xs z-50 pointer-events-none">
      Mode débogage des overlays actif
    </div>
  );
};

export default DebugOverlay;
