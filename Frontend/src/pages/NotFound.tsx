import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-text">404</h1>
          <h2 className="text-2xl font-bold text-text">Page not found</h2>
        </div>

        <p className="text-text-muted">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" size="md">
              <Home size={18} />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
