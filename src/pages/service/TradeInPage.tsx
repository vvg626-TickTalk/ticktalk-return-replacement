import { Navigate } from 'react-router-dom';

/** Legacy service-hub path → web trade-in preview (demo). */
export function TradeInPage() {
  return <Navigate to="/trade-in/preview" replace />;
}
