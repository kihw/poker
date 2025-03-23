// Configuration des tests
import '@testing-library/jest-dom';

// Configuration globale pour les tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock des composants et modules spécifiques
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => jest.fn(),
}));
