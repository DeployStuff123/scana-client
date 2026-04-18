import { Box, DialogActions, IconButton, InputAdornment, LinearProgress, MenuItem, Pagination, PaginationItem, Select, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react'
import apiReq from '../../../utils/axiosReq';
import { AccessTime, AddToHomeScreen, CallMade, ContentCopy, DeleteOutlined, EditOutlined, EmailOutlined, Google, InsertLink, LinkOff, NavigateBefore, NavigateNext, QrCode, SearchOutlined, VisibilityOutlined } from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
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
import { format } from 'date-fns';

const RedirectLinks = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLinkData, setEditLinkData] = useState(null);
  const [deleteLinkData, setDeleteLinkData] = useState(null);
  const [createLinkDialogOpen, setCreateLinkDialogOpen] = useState(false);

  const { t } = useTranslation('redirectLinks');
  const { token } = useAuth();
  const { user } = useUser();

  const [searchParams, setSearchParams] = useSearchParams();


  const page = parseInt(searchParams.get('page') || '1'); // 1-based for the UI component
  const rowsPerPage = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';


  const { data, isFetching } = useQuery({
    queryFn: async () => {
      const res = await apiReq.get(
        `api/link/all?status=${status}&search=${search}&page=${page}&limit=${rowsPerPage}`,
        { headers: { Authorization: token } }
      );
      return res.data;
    },
    queryKey: ['links', status, search, page, rowsPerPage],
    placeholderData: (previousData) => previousData,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });


  // --- URL Update Handlers ---
  const updateQueryParams = (newParams) => {
    setSearchParams((prev) => {
      Object.keys(newParams).forEach((key) => {
        if (newParams[key] === null || newParams[key] === undefined) {
          prev.delete(key);
        } else {
          prev.set(key, newParams[key]);
        }
      });
      return prev;
    });
  };

  const totalPages = Math.ceil((data?.total || 0) / rowsPerPage);


  const handlePageChange = (event, value) => {
    updateQueryParams({ page: value });
  };

  const handleChangeRowsPerPage = (event) => {
    updateQueryParams({
      limit: parseInt(event.target.value, 10),
      page: 1
    });
  };

  const handleSearchChange = (e) => {
    updateQueryParams({ search: e.target.value, page: 1 });
  };
  const handleStatusChange = (e) => {
    updateQueryParams({ status: e.target.value, page: 1 });
  };



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
      const qrCode = await QRCode.toDataURL(`https://scanaqr.com/${slug}`);
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `${slug}.png`;
      link.click();
      toast.success('QR code downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  }, []);

  return (
    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .5 }}>
      <Box sx={{
        bgcolor: '#fff',
        p: { xs: 2, md: 3 },
        borderRadius: '16px',
        minHeight: '100vh'
      }} maxWidth='lg'>

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems={{ xs: 'start', sm: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {t('redirect_links')} <span style={{ fontSize: '14px', color: 'gray' }}>({data?.total || 0})</span>
          </Typography>
          <Stack direction='row' alignSelf='end' gap={2} alignItems='center'>

            <Select
              sx={{ minWidth: '150px' }}
              size='small'
              value={status}
              onChange={handleStatusChange}
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </Select>
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
        <TextField
          sx={{ mt: 2, mb: 2, maxWidth: '500px' }}
          fullWidth
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
          onChange={handleSearchChange}
        />


        <TableContainer variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          {isFetching && <LinearProgress sx={{ height: 2 }} />}
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Counts</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Info</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                isFetching ?
                  (
                    Array.from(new Array(data?.links?.length)).map((_, index) => (
                      <TableRow key={index}>

                        <TableCell align="right">
                          <Skeleton width="100%">
                            <Typography variant='h4'>&nbsp;</Typography>
                          </Skeleton>
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton width="100%">
                            <Typography variant='h4'>&nbsp;</Typography>
                          </Skeleton>
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton width="100%">
                            <Typography variant='h4'>&nbsp;</Typography>
                          </Skeleton>
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton width="100%">
                            <Typography variant='h4'>&nbsp;</Typography>
                          </Skeleton>
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton width="100%">
                            <Typography variant='h4'>&nbsp;</Typography>
                          </Skeleton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) :
                  data?.links?.length > 0 ? (
                    data.links.map((row) => (
                      <TableRow key={row._id} hover>
                        {/* Slug Column */}
                        <TableCell>
                          <Stack gap={1} direction='row' alignItems='center'>
                            <IconButton size="small" onClick={() => copyToClipboard(row.slug)}>
                              <ContentCopy fontSize='small' />
                            </IconButton>
                            <Link to={`${row.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.slug}</Typography>
                            </Link>
                          </Stack>
                        </TableCell>

                        {/* Counts Column */}
                        <TableCell>
                          <Stack gap={0.5}>
                            <Stack direction='row' gap={2}>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <EmailOutlined sx={{ fontSize: '16px' }} /> {row.emailCount}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <VisibilityOutlined sx={{ fontSize: '16px' }} /> {row.visits}
                                <Link to={`visits/${row.slug}`} style={{ color: 'inherit' }}>
                                  <CallMade sx={{ fontSize: '12px' }} />
                                </Link>
                              </Typography>
                            </Stack>
                            {row.type !== 'none' && (
                              <Typography variant="caption" sx={{ color: 'darkcyan', fontWeight: 'bold' }}>{row.type}</Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Info Column */}
                        <TableCell>
                          <Stack direction='row' alignItems='center' gap={1.5}>
                            {row.image ? (
                              <img src={row.image} alt={row.slug} style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <AddToHomeScreen sx={{ color: 'gray', fontSize: '18px' }} />
                            )}
                            <Box>
                              <Typography variant='caption' sx={{ display: 'flex', alignItems: 'center', gap: .5, color: 'text.secondary' }}>
                                <AccessTime sx={{ fontSize: '14px' }} />
                                {row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy') : ''}
                              </Typography>
                              <Typography variant="caption" component="div" sx={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <a href={row.destinationUrl} target='_blank' rel='noreferrer' style={{ color: '#1976d2', textDecoration: 'none' }}>
                                  {row.destinationUrl}
                                </a>
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Status Column */}
                        <TableCell>
                          <Stack gap={0.5}>
                            <Box
                              sx={{
                                bgcolor: row.isActive ? '#e3f2fd' : '#f5f5f5',
                                color: row.isActive ? '#1976d2' : '#616161',
                                display: 'flex', alignItems: 'center', gap: 0.5,
                                width: 'fit-content', px: 1, borderRadius: '4px', border: '1px solid',
                                borderColor: row.isActive ? '#90caf9' : '#e0e0e0'
                              }}
                            >
                              {row.isActive ? <InsertLink sx={{ fontSize: '14px' }} /> : <LinkOff sx={{ fontSize: '14px' }} />}
                              <Typography sx={{ fontSize: '11px', fontWeight: 'bold' }}>{row.isActive ? 'Active' : 'Inactive'}</Typography>
                            </Box>
                            {
                              row.googleLogin !== 'inactive' &&
                              <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 0.5,
                                bgcolor: row.googleLogin === 'active' ? '#e8f5e9' : row.googleLogin === 'optional' ? '#fff3e0' : '#eeeeee',
                                color: row.googleLogin === 'active' ? '#2e7d32' : row.googleLogin === 'optional' ? '#ef6c00' : '#424242',
                                fontSize: '11px', width: 'fit-content', px: 1, borderRadius: '4px', fontWeight: 'bold'
                              }}>
                                <Google sx={{ fontSize: '12px' }} /> {row.googleLogin}
                              </Box>
                            }
                          </Stack>
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell align="right">
                          <Stack direction='row' justifyContent="flex-end">
                            <IconButton size="small" onClick={() => downloadQrCode(row.slug)} color="primary">
                              <QrCode fontSize='small' />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleEdit(row)} color="info">
                              <EditOutlined fontSize='small' />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteDialog(row)} color="error">
                              <DeleteOutlined fontSize='small' />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No Links Available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>



          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            sx={{
              px: { xs: 2, sm: 4 },
              py: 1.5,
            }}
          >
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              variant="standard"
              disableUnderline
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#5c59f2',
                '& .MuiSelect-select': { py: 0 }
              }}
            >
              {[5, 10, 25, 50, 100].map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>

            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              renderItem={(item) => (
                <PaginationItem
                  slots={{ previous: NavigateBefore, next: NavigateNext }}
                  {...item}
                  label={item.type === 'previous' ? 'Previous' : item.type === 'next' ? 'Next' : undefined}
                  sx={{
                    borderRadius: '50px',
                    '&.Mui-selected': {
                      bgcolor: '#5c59f2',
                      color: '#fff',
                      '&:hover': { bgcolor: '#4a47d1' }
                    },
                    '&.MuiPaginationItem-previousNext': {
                      px: 2,
                      fontWeight: 600,
                      fontSize: '13px'
                    }
                  }}
                />
              )}
            />



          </Stack>


        </TableContainer>

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
      </Box >
    </motion.div >
  );
};

export default RedirectLinks;