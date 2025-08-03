/* eslint-disable react/prop-types */
import { Delete, Edit, Email, LockClock, Schedule, AccessTime, Link as LinkIcon, CalendarToday } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography, Avatar, Divider } from '@mui/material';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CDialog from '../../common/CDialog';
import DeleteFollowup from './DeleteFollowup';
import useUser from '../../hook/useUser';
import FollowUpForm from './FollowUpForm';
import { useTranslation } from 'react-i18next';

const FollowUpCard = ({ followUp }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user } = useUser();

  const { t } = useTranslation('followUp');

  // Map day number to day name
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = followUp.scheduleDay !== undefined ? dayNames[followUp.scheduleDay] : '';

  // Format the send hour to AM/PM format
  const formatSendHour = (hour) => {
    if (hour === undefined) return '';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <Box>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          borderLeft: `4px solid ${followUp.enabled ? '#4caf50' : '#9e9e9e'}`,
          '&:hover': {
            borderLeft: `4px solid ${followUp.enabled ? '#2e7d32' : '#616161'}`
          }
        }}
      >
        <CDialog title={t('delete_desc')} open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DeleteFollowup id={followUp._id} img={followUp.img} closeDialog={() => setDeleteDialogOpen(false)} />
        </CDialog>

        <CDialog disableOutsideClick closeButton title={t('update_follow_up')} open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <FollowUpForm editData={followUp} closeDialog={() => setEditDialogOpen(false)} />
        </CDialog>

        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            {/* Main Content */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <Email sx={{ color: 'primary.contrastText' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {followUp.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('created')}: {format(new Date(followUp.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Stack>


              <Box sx={{ pl: { xs: 0, md: 7 }, mb: 2 }}>
                {
                  followUp.destinationUrl &&
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <LinkIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.primary">
                      {followUp.destinationUrl}
                    </Typography>
                  </Stack>
                }

                <Link to={`/dashboard/redirect-links/${followUp.link.slug}`}>
                  <Chip
                    label={followUp.link.slug}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: 'primary.light',
                      color: 'primary.dark',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }}
                  />
                </Link>
              </Box>

              {followUp.img && (
                <Box sx={{ pl: { xs: 0, md: 7 }, mb: 2 }}>
                  <img
                    src={followUp.img}
                    alt="followup"
                    style={{
                      width: '100%',
                      maxWidth: '200px',
                      height: 'auto',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pl: { xs: 0, md: 7 } }} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>Type : </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {followUp.followUpType === 'casual' ? 'Casual' : 'Scheduled'}
                  </Typography>
                </Stack>

                {followUp.followUpType === 'casual' && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Delay: {followUp.delayInMinutes} mins
                    </Typography>
                  </Stack>
                )}

                {followUp.followUpType === 'scheduled' && (
                  <>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {followUp.scheduleType === 'weekly' ? 'Weekly' :
                          followUp.scheduleType === 'monthly' ? 'Monthly' :
                            'Daily'} at {formatSendHour(followUp.sendHour)}
                      </Typography>
                    </Stack>

                    {followUp.scheduleType === 'weekly' && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Every {dayName}
                        </Typography>
                      </Stack>
                    )}

                    {followUp.scheduleType === 'monthly' && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Day {followUp.scheduleDate} of month
                        </Typography>
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            </Box>

            {/* Actions */}
            <Stack direction={{ xs: 'row', md: 'column' }} justifyContent="space-between" alignItems={{ xs: 'center', md: 'flex-end' }} spacing={1}>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={followUp.enabled ? t('active') : t('inactive')}
                  size="small"
                  sx={{
                    bgcolor: followUp.enabled ? 'green' : 'darkgray',
                    color: '#fff',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={followUp.approved ? t('approved') : t('pending')}
                  size="small"
                  sx={{
                    bgcolor: followUp.approved ? 'blue' : 'darkgray',
                    color: '#fff',
                    fontWeight: 500
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={0.5}>
                <IconButton
                  disabled={user?.isBlocked}
                  onClick={() => setEditDialogOpen(true)}
                  size="small"
                >
                  <Edit fontSize="small" />
                </IconButton>

                <IconButton
                  color='error'
                  disabled={user?.isBlocked}
                  size="small"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FollowUpCard;