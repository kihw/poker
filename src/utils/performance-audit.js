// src/utils/performance-audit.js
/**
 * Utilitaire d'audit de performance pour React et Redux
 *
 * Ce module fournit des outils pour identifier et résoudre les problèmes
 * de performance dans les applications React/Redux, notamment:
 * - Re-renders inutiles
 * - Sélecteurs Redux non mémorisés
 * - Callbacks recréés à chaque render
 * - Objets recréés à chaque render
 */

import { useRef, useEffect } from 'react';

/**
 * HOC pour détecter les re-renders inutiles d'un composant
 * @param {React.Component} Component - Le composant à surveiller
 * @param {string} componentName - Nom du composant pour l'affichage dans les logs
 * @param {Object} options - Options de configuration
 * @returns {React.Component} - Composant enveloppé avec détection de re-render
 */
export function withRenderTracking(
  Component,
  componentName = Component.name,
  options = {}
) {
  const {
    logProps = false,
    logThreshold = 0, // Nombre de renders à partir duquel on commence à logger
    enableInProd = false, // Active le tracking même en production
  } = options;

  if (process.env.NODE_ENV === 'production' && !enableInProd) {
    // En production, retourner le composant original sans tracking
    return Component;
  }

  return function TrackedComponent(props) {
    const renderCount = useRef(0);
    const previousProps = useRef(props);

    // Comparer quelles props ont changé
    const changedProps = [];
    Object.entries(props).forEach(([key, value]) => {
      if (previousProps.current[key] !== value) {
        const oldValue = previousProps.current[key];
        changedProps.push({
          prop: key,
          from: oldValue,
          to: value,
          sameType: typeof oldValue === typeof value,
          isObject: typeof value === 'object' && value !== null,
          isFunction: typeof value === 'function',
        });
      }
    });

    useEffect(() => {
      renderCount.current += 1;

      if (renderCount.current > logThreshold) {
        console.group(
          `%c🔄 Re-render #${renderCount.current} de ${componentName}`,
          'color: #ff5722; font-weight: bold;'
        );

        if (changedProps.length > 0) {
          console.log('🔎 Props modifiées:');
          changedProps.forEach((change) => {
            let message = `  • ${change.prop}: `;

            if (change.isFunction) {
              message += `%cFONCTION RECRÉÉE!%c Utilisez useCallback() pour éviter cela.`;
              console.log(
                message,
                'color: red; font-weight: bold',
                'color: inherit'
              );
            } else if (change.isObject) {
              message += `%cOBJET/TABLEAU RECRÉÉ!%c Utilisez useMemo() pour éviter cela.`;
              console.log(
                message,
                'color: red; font-weight: bold',
                'color: inherit'
              );
              console.log(`    - Avant:`, change.from);
              console.log(`    - Après:`, change.to);
            } else {
              message += `${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`;
              console.log(message);
            }
          });
        } else {
          console.log(
            '❌ Re-render sans changement de props! Vérifiez si le composant parent se re-render inutilement ou utilisez React.memo().'
          );
        }

        if (logProps) {
          console.log('📦 Props actuelles:', props);
        }

        console.groupEnd();
      }

      previousProps.current = props;
    });

    return <Component {...props} />;
  };
}

/**
 * Hook pour surveiller les performances d'un sélecteur Redux
 * @param {Function} selector - Fonction sélecteur à surveiller
 * @param {string} selectorName - Nom du sélecteur pour les logs
 * @param {Object} state - État Redux actuel
 * @returns {any} - Résultat du sélecteur
 */
export function useTrackedSelector(
  selector,
  selectorName = 'unnamed selector',
  state
) {
  const executeTime = useRef(0);
  const executionCount = useRef(0);

  const start = performance.now();
  const result = selector(state);
  const end = performance.now();

  const currentExecuteTime = end - start;
  executeTime.current += currentExecuteTime;
  executionCount.current += 1;

  // Seulement logguer si le temps est significatif (> 1ms)
  if (currentExecuteTime > 1) {
    console.warn(
      `⚠️ Sélecteur lent: "${selectorName}" a pris ${currentExecuteTime.toFixed(2)}ms`
    );
    console.log(
      `   Total cumulé: ${executeTime.current.toFixed(2)}ms en ${executionCount.current} exécutions`
    );
    console.log(
      `   Conseil: Utilisez createSelector() de Redux Toolkit pour mémoriser ce sélecteur.`
    );
  }

  return result;
}

/**
 * Middleware Redux pour surveiller les performances des actions
 */
export const performanceMiddleware = (store) => (next) => (action) => {
  if (!action || !action.type) {
    return next(action);
  }

  console.log(`🚀 Action: ${action.type}`);
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  const executionTime = endTime - startTime;

  if (executionTime > 5) {
    console.warn(
      `⚠️ Action lente: "${action.type}" a pris ${executionTime.toFixed(2)}ms`
    );
  }

  return result;
};

/**
 * Hook pour détecter les changements d'une valeur spécifique et tracer les re-renders
 * @param {any} value - Valeur à surveiller
 * @param {string} name - Nom de la valeur pour les logs
 */
export function useValueTracking(value, name = 'unnamed value') {
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current !== value) {
      console.log(`📊 Changement de "${name}":`, {
        avant: previousValue.current,
        après: value,
      });

      if (
        typeof value === 'object' &&
        value !== null &&
        typeof previousValue.current === 'object' &&
        previousValue.current !== null
      ) {
        // Trouver quelles propriétés ont changé
        const changedKeys = [];
        const allKeys = new Set([
          ...Object.keys(previousValue.current),
          ...Object.keys(value),
        ]);

        allKeys.forEach((key) => {
          if (previousValue.current[key] !== value[key]) {
            changedKeys.push(key);
          }
        });

        if (changedKeys.length > 0) {
          console.log(`   Propriétés modifiées: ${changedKeys.join(', ')}`);
        }
      }

      previousValue.current = value;
    }
  }, [value, name]);
}

/**
 * Audit complet des performances du composant - combine plusieurs outils
 * @param {React.Component} Component - Composant à auditer
 * @param {Object} options - Options de configuration
 * @returns {React.Component} - Composant avec analyse de performance
 */
export function withPerformanceAudit(Component, options = {}) {
  const wrappedComponent = withRenderTracking(
    Component,
    Component.name,
    options
  );

  // Ajouter un nom personnalisé pour mieux identifier dans React DevTools
  wrappedComponent.displayName = `PerformanceAudit(${Component.displayName || Component.name})`;

  return wrappedComponent;
}

/**
 * Fonction utilitaire pour activer la surveillance des re-renders dans tout le projet
 * @param {Array<string>} componentsToIgnore - Liste des noms de composants à ignorer
 */
export function enableGlobalRenderTracking(componentsToIgnore = []) {
  if (process.env.NODE_ENV === 'production') {
    console.log('Suivi des re-renders désactivé en production');
    return;
  }

  // Hack pour patcher React.createElement
  const originalCreateElement = React.createElement;

  React.createElement = function (type, props, ...children) {
    // Ne pas tracer les composants natifs ou les composants ignorés
    if (
      typeof type !== 'function' ||
      (type.name && componentsToIgnore.includes(type.name))
    ) {
      return originalCreateElement(type, props, ...children);
    }

    // Ajouter des infos de debug sur les props dans les attributs data-*
    const enhancedProps = { ...props };
    if (props) {
      enhancedProps['data-component-name'] = type.name || 'Anonymous';
    }

    return originalCreateElement(type, enhancedProps, ...children);
  };

  console.log('Suivi global des re-renders activé pour tous les composants');
}

/**
 * Intégration avec React DevTools pour signaler les composants problématiques
 * Exécuter cette fonction dans la console du navigateur
 */
export function analyzeDevTools() {
  console.log('🔍 Analyse des composants avec React DevTools...');

  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
    console.error(
      "React DevTools n'est pas installé ou activé dans ce navigateur"
    );
    return;
  }

  // Extraire la fibre root
  const fiberRoot = __REACT_DEVTOOLS_GLOBAL_HOOK__
    .getFiberRoots()
    .values()
    .next().value;
  if (!fiberRoot) {
    console.error("Impossible d'accéder à la fibre root React");
    return;
  }

  // Analyser l'arbre des composants
  const problemComponents = [];

  function analyzeFiber(fiber, depth = 0) {
    if (!fiber) return;

    // Analyser seulement les composants (pas les éléments DOM)
    if (fiber.type && typeof fiber.type === 'function') {
      const name = fiber.type.name || 'Anonymous';

      // Vérifier si le composant est mémorisé
      const isMemoized =
        fiber.type.$typeof && fiber.type.$typeof.toString().includes('memo');

      // Vérifier les props qui sont des fonctions non mémorisées
      const nonMemoizedFunctionProps = [];
      if (fiber.memoizedProps) {
        Object.entries(fiber.memoizedProps).forEach(([key, value]) => {
          if (typeof value === 'function' && !key.startsWith('on')) {
            nonMemoizedFunctionProps.push(key);
          }
        });
      }

      // Si problématique, ajouter à la liste
      if (!isMemoized || nonMemoizedFunctionProps.length > 0) {
        problemComponents.push({
          name,
          depth,
          isMemoized,
          nonMemoizedFunctionProps,
          instance: fiber.stateNode,
        });
      }
    }

    // Parcourir les enfants
    if (fiber.child) {
      analyzeFiber(fiber.child, depth + 1);
    }

    // Parcourir les frères
    if (fiber.sibling) {
      analyzeFiber(fiber.sibling, depth);
    }
  }

  // Démarrer l'analyse à partir de la racine
  analyzeFiber(fiberRoot.current);

  // Afficher les résultats
  console.table(
    problemComponents.map((c) => ({
      Component: c.name,
      Memoized: c.isMemoized ? '✅' : '❌',
      Depth: c.depth,
      'Function Props': c.nonMemoizedFunctionProps.join(', ') || 'None',
    }))
  );

  console.log("💡 Conseils d'optimisation:");
  console.log(
    '1. Utilisez React.memo() pour les composants qui ne dépendent pas de props qui changent fréquemment'
  );
  console.log(
    "2. Utilisez useCallback() pour les gestionnaires d'événements passés aux composants enfants"
  );
  console.log(
    '3. Utilisez useMemo() pour les objets ou tableaux créés pendant le render'
  );

  return problemComponents;
}
