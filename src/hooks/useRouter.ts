
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    pathname: location.pathname,
    query: Object.fromEntries(new URLSearchParams(location.search)),
    asPath: location.pathname + location.search,
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    params
  };
}

export default useRouter;
