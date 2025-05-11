
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  return {
    navigate,
    params,
    location,
    query: new URLSearchParams(location.search),
    pathname: location.pathname,
  };
};

export default useRouter;
