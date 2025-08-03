import { Box, DialogActions, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react'
import apiReq from '../../../utils/axiosReq';
import { AddToHomeScreen, ContentCopy, DeleteOutlined, EditOutlined, EmailOutlined, Google, InsertLink, LinkOff, QrCode, SearchOutlined, VisibilityOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import DataTable from '../../common/DataTable';
import CDialog from '../../common/CDialog';
import CButton from '../../common/CButton';
import { copyToClipboard } from '../../../utils/copyToClipboard';
import useAuth from '../../hook/useAuth';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import useUser from '../../hook/useUser';
import { useTranslation } from 'react-i18next';
import RedirectLinkForm from './RedirectLinkForm';
import { motion } from 'framer-motion';

const RedirectLinks = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLinkData, setEditLinkData] = useState(null);
  const [deleteLinkData, setDeleteLinkData] = useState(null);
  const [createLinkDialogOpen, setCreateLinkDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { t } = useTranslation('redirectLinks');
  const { token } = useAuth();
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryFn: async () => await apiReq.get('api/link/all', { 
      params: { search }, 
      headers: { Authorization: token } 
    }),
    queryKey: ['links', search]
  });

  const queryClient = useQueryClient();

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => apiReq.delete(`api/link/delete/${id}`, { 
      headers: { Authorization: token } 
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['links']);
      toast.success(res.data.message);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    }
  });

  const handleEdit = useCallback((row) => {
    setEditDialogOpen(true);
    setEditLinkData(row);
  }, []);

  const handleDeleteDialog = useCallback((data) => {
    setDeleteDialogOpen(true);
    setDeleteLinkData(data);
  }, []);

  const handleDelete = useCallback(() => {
    deleteLinkMutation.mutate(deleteLinkData._id);
    setDeleteDialogOpen(false);
  }, [deleteLinkData, deleteLinkMutation]);

  const downloadQrCode = useCallback(async (slug) => {
    try {
      const qrCode = await QRCode.toDataURL(`https://litz.vercel.app/${slug}`);
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `${slug}.png`;
      link.click();
      toast.success('QR code downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  }, []);

  const columns = useMemo(() => [
    {
      field: 'slug',
      headerName: t('name'),
      width: 170,
      renderCell: (params) => (
        <Stack direction='column' justifyContent='center' height='100%'>
          <Link to={`${params.row.slug}`} style={{ textDecoration: 'none' }}>
            <Typography>{params.row.slug}</Typography>
          </Link>
          <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
            {params.row.description}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'Info',
      headerName: t('info'),
      width: 250,
      renderCell: (params) => (
        <Stack direction='row' alignItems='center' gap={1.5} height='100%'>
          {params.row.image ? (
            <img 
              src={params.row.image} 
              alt={params.row.slug} 
              style={{ width: '30px', height: '40px' }} 
              loading="lazy"
            />
          ) : (
            <AddToHomeScreen sx={{ color: 'gray' }} />
          )}
          <Stack justifyContent="center" height='100%'>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <a href={params.row.destinationUrl} target='_blank' rel='noreferrer'>
                {params.row.destinationUrl}
              </a>
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'counts',
      headerName: t('counts'),
      width: 150,
      renderCell: (params) => (
        <Stack justifyContent="center" height='100%'>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailOutlined sx={{ fontSize: '20px', color: 'gray' }} />
            {params.row.emailCount}
          </Typography>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityOutlined sx={{ fontSize: '20px', color: 'gray' }} />
            {params.row.visits}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'googleLogin',
      headerName: t('google'),
      width: 150,
      renderCell: (params) => (
        <Stack justifyContent="center" height='100%'>
          <Typography sx={{
            display: 'flex',
            alignItems: 'center',
            gap: .5,
            bgcolor: params.row.googleLogin === 'active' ? 'green' : 
                    params.row.googleLogin === 'optional' ? 'orange' : 'darkgray',
            fontSize: '12px',
            width: 'fit-content',
            color: 'white',
            borderRadius: 1,
            px: 1,
            py: 0.2
          }}> 
            <Google sx={{ fontSize: '14px' }} />
            {params.row.googleLogin === 'active' ? t('active') : 
             params.row.googleLogin === 'optional' ? t('optional') : t('inactive')}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: t('status'),
      width: 150,
      renderCell: (params) => (
        <Stack height='100%' justifyContent='center'>
          <Typography
            sx={{
              bgcolor: params.row.isActive ? 'blue' : 'darkgray',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: .5,
              width: 'fit-content',
              textAlign: 'center',
              fontSize: '12px',
              borderRadius: 1,
              fontWeight: 'medium',
              px: 1,
              py: 0.1,
            }}
          >
            {params.row.isActive ? (
              <InsertLink sx={{ fontSize: '20px' }} />
            ) : (
              <LinkOff sx={{ fontSize: '20px' }} />
            )}
            {params.row.isActive ? t('active') : t('inactive')}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'options',
      headerName: '',
      width: 200,
      renderCell: (params) => (
        <Stack direction='row' alignItems='center' height='100%'>
          <Tooltip title='Download QR Code'>
            <IconButton onClick={() => downloadQrCode(params.row.slug)}>
              <QrCode fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Copy Link'>
            <IconButton onClick={() => copyToClipboard(params.row.slug)}>
              <ContentCopy fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit Link'>
            <IconButton disabled={user?.isBlocked} onClick={() => handleEdit(params.row)}>
              <EditOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete Link'>
            <IconButton disabled={user?.isBlocked} onClick={() => handleDeleteDialog(params.row)}>
              <DeleteOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t, downloadQrCode, handleEdit, handleDeleteDialog, user?.isBlocked]);

  return (
      <Box sx={{
        bgcolor: '#fff',
        p: { xs: 2, md: 3 }, 
        borderRadius: '16px',
        minHeight: '100vh'
      }} maxWidth='lg'>
        
        <Stack direction={{xs: 'column', sm: 'row'}} justifyContent='space-between' alignItems={{xs: 'start', sm: 'center'}}>
          <Typography variant="h5" gutterBottom>
            {t('redirect_links')} <span style={{ fontSize: '14px', color: 'gray' }}>({data?.data?.length || 0})</span>
          </Typography>
          <Stack direction='row' gap={2} alignItems='center'>
            <TextField
              size='small'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              }}
              placeholder={t('search_by_slug')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CButton 
              disabled={user?.isBlocked} 
              variant='contained' 
              color='primary' 
              onClick={() => setCreateLinkDialogOpen(true)}
            >
              {t('create_link')}
            </CButton>
          </Stack>
        </Stack>


        <Box mt={4}>
          <DataTable
            rows={data?.data || []}
            getRowId={(row) => row._id}
            columns={columns}
            loading={isLoading}
            rowHeight={70}
            noRowsLabel={t('no_links_available')}
            />
        </Box>

        {/* delete dialog */}
        <CDialog title={t('delete_link')} open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <Typography> {t('delete_desc')} <b>{deleteLinkData?.slug}</b> ?</Typography>
          <DialogActions>
            <CButton onClick={() => setDeleteDialogOpen(false)}>{t('cancel')}</CButton>
            <CButton 
              variant='contained' 
              loading={deleteLinkMutation.isPending} 
              onClick={handleDelete} 
              color="error"
            >
              {t('delete')}
            </CButton>
          </DialogActions>
        </CDialog>

        {/* create link dialog */}
        <CDialog 
          disableOutsideClick 
          closeButton 
          title={t('create_link')} 
          open={createLinkDialogOpen} 
          onClose={() => setCreateLinkDialogOpen(false)}
        >
          <RedirectLinkForm closeDialog={() => setCreateLinkDialogOpen(false)} />
        </CDialog>

        {/* update link dialog */}
        <CDialog 
          closeButton 
          title={t('update_link')} 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
        >
          <RedirectLinkForm linkData={editLinkData} closeDialog={() => setEditDialogOpen(false)} />
        </CDialog>
      </Box>
    );
};

export default RedirectLinks;