import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <div className="text-5xl font-bold text-accent">404</div>
          <h1 className="text-xl font-semibold text-text">Page not found</h1>
        </div>

        <p className="text-sm text-text-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/">
          <Button variant="primary" size="md">
            <Home size={16} />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
