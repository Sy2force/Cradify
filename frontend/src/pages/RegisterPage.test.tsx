import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '../test/test-utils';
import { RegisterPage } from './RegisterPage';

// Mock the API service
vi.mock('../lib/api', () => ({
  apiService: {
    register: vi.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage', () => {

  it('renders registration form correctly', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText('Créer un compte Cardify')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('renders form fields correctly', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText('Prénom')).toBeInTheDocument();
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Adresse email')).toBeInTheDocument();
  });

  it('navigates to login page when login link is clicked', () => {
    render(<RegisterPage />);
    
    const loginLink = screen.getByRole('link', { name: /se connecter/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
