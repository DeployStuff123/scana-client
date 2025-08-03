import { Box, Stack, Typography, Card, CardContent, Switch, Chip, IconButton, Tooltip, FormControlLabel, Grid } from '@mui/material'
import React, { useState } from 'react'
import CButton from '../../common/CButton'
import CDialog from '../../common/CDialog';
import { useQuery } from '@tanstack/react-query';
import apiReq from '../../../utils/axiosReq';
import useAuth from '../../hook/useAuth';
import { Email } from '@mui/icons-material';
import { motion } from 'framer-motion';

import FollowUpCard from './FollowUpCard';
import Loader from '../../common/Loader';
import useUser from '../../hook/useUser';
import FollowUpForm from './FollowUpForm';
import { useTranslation } from 'react-i18next';

const FollowUp = () => {
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);

  const { t } = useTranslation('followUp');

  const { token } = useAuth()
  const { user } = useUser()
  const { data, isLoading } = useQuery({
    queryFn: async () => await apiReq.get('api/follow-up/all', { headers: { Authorization: token } }),
    queryKey: ['follow-ups']
  });


  return (
    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .5 }}>

      <Box sx={{
        bgcolor: '#fff',
        p: { xs: 2, md: 3 },
        borderRadius: '16px',
        minHeight: '100vh'
      }} maxWidth='lg'>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' gap={2} alignItems={{ xs: 'start', md: 'center' }} mb={6}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
              {t('follow_up')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('description')}
            </Typography>
          </Box>
          <CButton disabled={user?.isBlocked} variant='contained' color='primary' onClick={() => setFollowUpDialogOpen(true)}>{t('create_follow_up')}</CButton>
        </Stack>
        <Box>



          {/* Campaign Cards */}
          <Grid container spacing={3}>
            {isLoading ? <Loader /> : data?.data?.map((followUp) => (
              <Grid item xs={12} sm={6} md={6} key={followUp._id}>
                <FollowUpCard followUp={followUp} />
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {(data?.data?.length === 0) && (
            <Card sx={{ boxShadow: 1 }}>
              <CardContent sx={{ p: 6, textAlign: "center" }}>
                <Email sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('no_follow_up_available')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('description')}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>


        {/* create follow-up  */}
        <CDialog closeButton title={t('create_follow_up')} open={followUpDialogOpen} onClose={() => setFollowUpDialogOpen(false)}>
          <FollowUpForm closeDialog={() => setFollowUpDialogOpen(false)} />
        </CDialog>



      </Box>
    </motion.div>
  )
}

export default FollowUp