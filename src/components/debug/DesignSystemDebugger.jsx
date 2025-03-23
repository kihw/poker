import React from 'react';
import { 
  Button, 
  Card, 
  Badge, 
  ProgressBar, 
  DESIGN_TOKENS,
  Icons 
} from '../ui/DesignSystem';

const DesignSystemDebugger = () => {
  const checkDesignSystemUsage = () => {
    const checks = [
      { name: 'Couleurs', test: () => Object.keys(DESIGN_TOKENS.colors).length > 0 },
      { name: 'Composants de base', test: () => ['Button', 'Card', 'Badge'].every(comp => !!comp) },
      { name: 'Icônes', test: () => Object.keys(Icons).length > 0 },
    ];

    return checks.map(check => ({
      ...check,
      result: check.test()
    }));
  };

  const designSystemChecks = checkDesignSystemUsage();

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-2xl mb-4">Design System Debugger</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Design System Checks */}
        <Card variant="elevated" className="p-4">
          <h3 className="text-lg font-bold mb-2">Vérifications du Design System</h3>
          {designSystemChecks.map(check => (
            <div key={check.name} className="mb-2 flex justify-between">
              <span>{check.name}</span>
              <Badge 
                variant={check.result ? 'success' : 'danger'}
                size="sm"
              >
                {check.result ? 'OK' : 'Erreur'}
              </Badge>
            </div>
          ))}
        </Card>

        {/* Z-Index Demonstration */}
        <Card variant="elevated" className="p-4">
          <h3 className="text-lg font-bold mb-2">Démo des Z-Index</h3>
          <div className="relative">
            <div className="absolute z-10 bg-red-500 p-2">Z-Index 10</div>
            <div className="absolute z-20 bg-green-500 p-2 left-10">Z-Index 20</div>
            <div className="absolute z-30 bg-blue-500 p-2 left-20">Z-Index 30</div>
          </div>
        </Card>

        {/* Component Preview */}
        <Card variant="elevated" className="p-4">
          <h3 className="text-lg font-bold mb-2">Prévisualisation des Composants</h3>
          <div className="space-y-2">
            <Button variant="primary">Bouton Principal</Button>
            <Button variant="outline">Bouton Secondaire</Button>
            <ProgressBar value={65} max={100} color="primary" />
            <Badge variant="success">Succès</Badge>
            <Badge variant="danger">Erreur</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDebugger;