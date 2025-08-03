import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { KeyboardArrowLeft } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import apiReq from '../../../utils/axiosReq';
import toast from 'react-hot-toast';
import CButton from '../../common/CButton';

const ForgotPass = ({ setForgotePassSecOpen }) => {
  const [forgotEmail, setForgotEmail] = useState({ email: '' });
  const [passResetData, setPassResetData] = useState('');
  const { t } = useTranslation('login');

  const mutation = useMutation({
    mutationFn: (input) => apiReq.post('api/user/forgot-password', input),
    onSuccess: (res) => {
      setPassResetData(res.data.message);
      toast.success(res.data.message);
    },
    onError: (err) => {
      toast.error(err.response.data);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      email: data.get('email'),
    });
  };

  return (
    <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .5 }}>

      <Button
        onClick={() => setForgotePassSecOpen(false)}
        startIcon={<KeyboardArrowLeft />}
        sx={{
          mb: 3,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
      >
        {t('back_to_login')}
      </Button>

      {passResetData ? (
        <Typography sx={{
          bgcolor: 'lightgreen',
          color: 'black',
          p: 2,
          borderRadius: 1,
          mb: 3
        }}>
          {passResetData}
        </Typography>
      ) : (
        <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            {t('forgot_password')}
          </Typography>
          <TextField
            name="email"
            required
            fullWidth
            label={t('email_address')}
            variant="outlined"
            value={forgotEmail.email}
            onChange={(e) => setForgotEmail({ email: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                },
              }
            }}
          />
          <CButton
            loading={mutation.isPending}
            variant="contained"
            fullWidth
            size="large"
            type="submit"
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            {t('send_reset_link')}
          </CButton>
        </Stack>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPass;
