import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import axios from 'axios';
import apiReq from '../../../utils/axiosReq';
import { Box, Button, Container } from '@mui/material';
import Loader from '../../common/Loader';

const RedirectPage = () => {
  const { slug } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);

  // One Tap should only trigger if login is optional (not forced)
  const enableOneTap = linkInfo?.googleLogin === 'optional';


  // Google One Tap Login (auto popup from bottom)
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const jwt = credentialResponse.credential;
        const decoded = JSON.parse(atob(jwt.split('.')[1]));
        const email = decoded.email;

        if (!email) throw new Error('No email in token');

        await apiReq.post(`/api/email/record/${slug}`, { email });
        window.location.href = linkInfo.destinationUrl;
      } catch (err) {
        console.error('One Tap login error:', err);
      }
    },
    onError: () => {
      console.log('One Tap login failed');
    },
    disabled: !enableOneTap, // ❗️Control when it activates
  });

  // Traditional Google Login (required)
  const login = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'implicit',
    onSuccess: async tokenResponse => {
      try {
        setLoading(true);

        const accessToken = tokenResponse.access_token;

        const res = await axios.get(
          'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = res.data;
        const email = data.emailAddresses?.[0]?.value;
        if (!email) {
          throw new Error('Email not found in Google profile');
        }

        await apiReq.post(`/api/email/record/${slug}`, { email });

        window.location.href = linkInfo.destinationUrl;
      } catch (err) {
        console.error(err);
        setError('Something went wrong during login.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
  });

  useEffect(() => {
    let mounted = true;

    const fetchLinkAndTrackVisit = async () => {
      try {
        const res = await apiReq.get(`/api/link/details/${slug}`);
        if (!mounted) return;

        if (!res.data.isActive) {
          setError('Link is inactive');
          return;
        }

        setLinkInfo(res.data);

        if (res.data.googleLogin === 'inactive') {
          window.location.href = res.data.destinationUrl;
        }

        await apiReq.post(`/api/visit/record/${slug}`);
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError('Invalid or expired link');
      }
    };

    fetchLinkAndTrackVisit();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
        {error}
      </Box>
    );
  }

  if (!linkInfo) return <Loader />;

  return (
    <Container
      maxWidth='sm'
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {linkInfo?.image && (
        linkInfo?.googleLogin === 'optional' ? (
          <a href={linkInfo?.destinationUrl}>
            <img
              src={linkInfo?.image}
              alt="Advertisement"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0
              }}
            />
          </a>
        ) : (
          <img
            src={linkInfo?.image}
            alt="Advertisement"
            style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
          />
        )
      )}

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {linkInfo?.googleLogin === 'active' && (
          <Button
            variant="contained"
            onClick={() => login()}
            disabled={loading}
            sx={{
              backgroundColor: linkInfo?.buttonColor || 'primary.main',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '0px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: linkInfo?.buttonColor || 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {linkInfo?.buttonName} {linkInfo?.type === 'none' ? '' : linkInfo?.type}
          </Button>
        )}
        {loading && (
          <Box sx={{ mt: 2 }}>
            <Loader />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default RedirectPage;
