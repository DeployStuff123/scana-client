import {
  Box, Stack, Typography, Divider, Chip, IconButton,
  TextField, Button, DialogActions
} from '@mui/material';
import {
  ArrowBack, Download as DownloadIcon, ContentCopy,
  Google, Email as EmailIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import apiReq from '../../../utils/axiosReq';
import useAuth from '../../hook/useAuth';
import { useTranslation } from 'react-i18next';

import Loader from '../../common/Loader';
import DataTable from '../../common/DataTable';
import CDialog from '../../common/CDialog';
import CButton from '../../common/CButton';
import { copyToClipboard } from '../../../utils/copyToClipboard';

const RedirectLinkDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('redirectLinkDetails');
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ from: '', to: '' });
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const queryUrl = `api/link/details/${slug}?from=${filters.from}&to=${filters.to}`;
  const { data, isLoading } = useQuery({
    queryFn: () => apiReq.get(queryUrl, { headers: { Authorization: token } }),
    queryKey: ['link', slug, filters],
  });

  const rows = useMemo(() => data?.data?.emailList || [], [data?.data?.emailList]);

  const columns = useMemo(() => ([
    { field: 'email', headerName: t('email'), width: 300 },
    {
      field: 'followUp',
      headerName: t('follow_up'), width: 200,
      renderCell: (params) => (
        <Stack height="100%" justifyContent="center">
          <Typography sx={{
            bgcolor: params.row.followUpSent ? 'green' : 'darkgray',
            color: '#fff', px: 1, borderRadius: 2, width: 'fit-content'
          }}>
            {params.row?.followUpSent ? t('send') : t('not_send')}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'followUpSentAt',
      headerName: t('sent_at'), width: 200,
      renderCell: (params) => (
        <Stack height="100%" justifyContent="center">
          <Typography>{params.row?.followUpSentAt ? format(params.row?.followUpSentAt, 'dd MMM yyyy') : 'N/A'}</Typography>
          <Typography sx={{ fontSize: '11px' }}>
            {params.row?.followUpSentAt ? format(params.row?.followUpSentAt, 'hh:mm a') : ''}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'visitedAt',
      headerName: t('visits'), width: 200,
      renderCell: (params) => (
        <Stack height="100%" justifyContent="center">
          <Typography>{params.row.visitedAt ? format(params.row.visitedAt, 'dd MMM yyyy') : 'N/A'}</Typography>
          <Typography sx={{ fontSize: '11px' }}>
            {params.row.visitedAt ? format(params.row.visitedAt, ' hh:mm a') : 'N/A'}
          </Typography>
        </Stack>
      )
    }
  ]), [t]);

  const handleExport = async () => {
    const res = await apiReq.get(
      `api/link/details/${slug}?from=${filters.from}&to=${filters.to}&exportAs=csv`,
      { responseType: 'blob', headers: { Authorization: token } }
    );
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${slug}_visits.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const removeMutation = useMutation({
    mutationFn: () =>
      apiReq.post('api/email/delete-emails', {
        emailIds: selectedEmailIds,
        headers: { Authorization: token }
      }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setSelectedEmailIds([]);
      setRemoveDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['link', slug, filters] });
    }
  });

  const followupFalseMutation = useMutation({
    mutationFn: () =>
      apiReq.post('api/email/followup-false', {
        emailIds: selectedEmailIds,
        headers: { Authorization: token }
      }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setSelectedEmailIds([]);
      setFollowupDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['link', slug, filters] });
    }
  });

  if (isLoading) return <Loader />;

  return (
    <Box sx={{ bgcolor: '#fff', p: { xs: 2, md: 4 }, borderRadius: 3, minHeight: '100vh', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* Animated Summary Header */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ willChange: 'transform, opacity' }}
      >
        <Stack spacing={4}>
          {/* Header section */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">{t('link_information')}</Typography>
          </Stack>
          <Divider />

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography fontWeight="600" color="text.secondary">{t('name')}</Typography>
                <Chip label={data?.data?.slug} />
                <IconButton onClick={() => copyToClipboard(data?.data?.slug)}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>
              <Typography>{t('created_at')}: {format(data?.data?.createdAt, 'dd MMM yyyy')}</Typography>
              <Typography>{t('google_login')}:
                <span style={{
                  marginLeft: 8, background: data?.data?.googleLogin === 'active' ? 'green' : 'gray',
                  color: '#fff', padding: '2px 8px', borderRadius: 20
                }}>
                  <Google sx={{ fontSize: 14 }} />
                  {data?.data?.googleLogin}
                </span>
              </Typography>
              <Typography>{t('status')}: {data?.data?.isActive ? t('active') : t('inactive')}</Typography>
              <Typography>{t('type')}: {data?.data?.type}</Typography>
              <Typography>{t('description')}: {data?.data?.description}</Typography>
            </Stack>
            <Box>
              <Typography>{t('destination_url')}</Typography>
              <a href={data?.data?.destinationUrl} target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>
                {data?.data?.destinationUrl}
              </a>
            </Box>
          </Stack>

          {/* Analytics Boxes */}
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
            <Stack sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }} flex={1}>
              <Typography>{t('total_visits')}</Typography>
              <Typography variant="h5">{data?.data?.visits || 0}</Typography>
            </Stack>
            <Stack sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }} flex={1}>
              <Typography>{t('emails')}</Typography>
              <Typography variant="h5">{rows.length}</Typography>
            </Stack>
          </Stack>

          {/* Date filters */}
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              type="date"
              label={t('from')}
              InputLabelProps={{ shrink: true }}
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
            <TextField
              size="small"
              type="date"
              label={t('to')}
              InputLabelProps={{ shrink: true }}
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
            {(filters.from || filters.to) && (
              <Button size="small" onClick={() => setFilters({ from: '', to: '' })}>Reset</Button>
            )}
          </Stack>
        </Stack>
      </motion.div>

      {/* Heavy DataGrid (non-animated) */}
      <Box mt={5}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={2}>
            <EmailIcon color="primary" />
            <Typography variant="h6">{t('email_collection')} ({rows.length})</Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            {selectedEmailIds.length > 0 && (
              <>
                <Button size="small" color="error" variant="outlined" onClick={() => setFollowupDialogOpen(true)}>Resend Followup</Button>
                <Button size="small" color="error" variant="contained" onClick={() => setRemoveDialogOpen(true)}>Remove</Button>
              </>
            )}
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {/* Dialogs */}
        <CDialog open={followupDialogOpen} onClose={() => setFollowupDialogOpen(false)} title="Resend Followup">
          <Typography>Are you sure you want to resend followup for selected emails?</Typography>
          <DialogActions>
            <Button onClick={() => setFollowupDialogOpen(false)}>Cancel</Button>
            <CButton loading={followupFalseMutation.isPending} onClick={followupFalseMutation.mutate}>
              Followup False
            </CButton>
          </DialogActions>
        </CDialog>

        <CDialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)} title="Remove">
          <Typography>Are you sure you want to remove selected emails?</Typography>
          <DialogActions>
            <Button onClick={() => setRemoveDialogOpen(false)}>Cancel</Button>
            <CButton loading={removeMutation.isPending} onClick={removeMutation.mutate}>
              Remove
            </CButton>
          </DialogActions>
        </CDialog>

        {/* DataTable */}
        <DataTable
          rows={rows}
          columns={columns}
          checkboxSelection
          getRowId={(row) => row._id}
          onRowSelectionModelChange={(ids) =>
            setSelectedEmailIds(rows.filter(r => ids.includes(r._id)).map(r => r._id))
          }
        />
      </Box>
    </Box>
  );
};

export default RedirectLinkDetails;
