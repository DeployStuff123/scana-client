import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import apiReq from '../../../utils/axiosReq';
import { Box, Button, Container } from '@mui/material';
import Loader from '../../common/Loader';

const RedirectPage = () => {
  const { slug } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);

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


        if (!res.data.googleLogin) {
          window.location.href = res.data.destinationUrl;
        }
        // Only record visit if component is still mounted
        const visitRes = await apiReq.post(`/api/visit/record/${slug}`);
        if (!mounted || visitRes.data.recorded) return;

      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError('Invalid or expired link');
      }
    };

    fetchLinkAndTrackVisit();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [slug]);


  // const testLogin = async () => {
  //   console.log('testLogin');
  //   const email = 'test@test.com';
  //   const birthDay = {
  //     year: 1997,
  //       month: 3,
  //     day: 16
  //   }
  //   await apiReq.post(`/api/emails/${slug}`, { email, birthDay });
  // }


  const login = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'implicit',
    onSuccess: async tokenResponse => {
      try {
        setLoading(true);

        const accessToken = tokenResponse.access_token;

        // Call People API
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

        // Record email
        await apiReq.post(`/api/email/record/${slug}`, { email });

        // Redirect
        window.location.href = linkInfo.destinationUrl;
      } catch (err) {
        console.error(err);
        setError('Something went wrong while logging in or fetching profile.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    },
  });

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
        {error}
      </Box>
    );
  }

  if (!linkInfo) {
    return <Loader />;
  }

  if (linkInfo) {
    if (!linkInfo.googleLogin) {
      return
    }
  }

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
        {linkInfo?.googleLogin && (
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
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: linkInfo?.buttonColor || 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Ver {linkInfo?.type}
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
