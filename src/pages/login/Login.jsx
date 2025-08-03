/* eslint-disable react/prop-types */
import { Box, Button, Container, IconButton, Stack, TextField, Typography, Paper, Fade, useTheme, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { KeyboardArrowLeft, Visibility, VisibilityOff } from '@mui/icons-material';
import toast from 'react-hot-toast';
import CButton from '../../common/CButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hook/useAuth';
import apiReq from '../../../utils/axiosReq';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { motion } from 'framer-motion';
import ForgotPass from './ForgotPass';

const Login = () => {
  const { t } = useTranslation('login');
  const theme = useTheme();
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [forgotePassSecOpen, setForgotePassSecOpen] = useState(false);

  const { setToken } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input) => apiReq.post('api/user/login', input),
    onSuccess: (res) => {
      if (res.data.user.role === 'user') {
        queryClient.invalidateQueries(['login']);
        setToken(res.data.jwt);
        toast.success(t('login_success'));
      } else {
        toast.error('Please login with user account');
      }
    },
    onError: (err) => {
      toast.error(err.response.data);
    }
  });

  const handleSubmit = (event) => {
    handleKeyPress(event);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };


  const passwordVisibilityHandler = () => setPasswordVisibility(!passwordVisibility);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(25, 118, 210, 0.1)',
          top: '-100px',
          right: '-100px',
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(25, 118, 210, 0.1)',
          bottom: '-50px',
          left: '-50px',
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1
        }}
      >
        <LanguageSwitcher />
      </motion.div>

      <Container maxWidth="sm">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: theme.palette.primary.main,
              }
            }}
          >
            <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {forgotePassSecOpen ? (
                <ForgotPass setForgotePassSecOpen={setForgotePassSecOpen} />
              ) : (
                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .5 }}>

                  <Stack spacing={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          style={{
                            width: '180px',
                            height: 'auto',
                            marginBottom: '16px',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }}
                          src="/logo-colored.png"
                          alt="Company Logo"
                        />
                      </motion.div>
                      <Typography
                        variant="h4"
                        fontWeight={600}
                        color="text.primary"
                        sx={{ mb: 1 }}
                      >
                        {t('welcome_back')}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {t('login_to_continue')}
                      </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                      <Stack spacing={3}>
                        <TextField
                          name="email"
                          label={t('email')}
                          variant="outlined"
                          required
                          fullWidth
                          onKeyDown={handleKeyPress}

                        />

                        <TextField
                          name="password"
                          label={t('password')}
                          variant="outlined"
                          required
                          fullWidth
                          type={passwordVisibility ? "text" : "password"}
                          onKeyDown={handleKeyPress}

                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={passwordVisibilityHandler}
                                  edge="end"
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'primary.main'
                                    }
                                  }}
                                >
                                  {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            onClick={() => setForgotePassSecOpen(true)}
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              display: 'inline-block',
                              fontSize: '0.875rem',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {t('forgot_password')}
                          </Typography>
                        </Box>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <CButton
                            type="submit"
                            loading={mutation.isPending}
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '1rem',
                              fontWeight: 500,
                              boxShadow: 'none',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                              }
                            }}
                          >
                            {t('submit')}
                          </CButton>
                        </motion.div>
                      </Stack>
                    </form>
                  </Stack>
                </motion.div>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;