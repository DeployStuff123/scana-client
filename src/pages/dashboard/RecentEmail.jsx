import { Box, Stack, Typography } from '@mui/material'
import React from 'react'
import DataTable from '../../common/DataTable'
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const RecentEmail = ({ data }) => {
  const { t } = useTranslation('dashboard');  
  const emailsColumns = [

    {
      field: 'link',
      headerName: t('name'),
      width: 200,
      renderCell: (params) => (
        <Link
          to={`redirect-links/${params?.value?.slug}`}
          style={{
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: 500
          }}
        >
          {params?.value?.slug}
        </Link>
      )
    },
    {
      field: 'email',
      headerName: t('emails'),
      width: 300
    },
    {
      field: 'visitedAt',
      headerName: t('captured_at'),
      width: 200,
      renderCell: (params) => (
        <Stack height="100%" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            {format(params.row.visitedAt, 'dd MMM yyyy')}
          </Typography>
          <Typography sx={{ fontSize: '12px' }} color="text.secondary">
            {format(params.row.visitedAt, ' hh:mm a')}
          </Typography>
        </Stack>
      )
    }
  ];
  return (
    <Box >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {t('recent_email_captures')}
      </Typography>
      <Box sx={{ bgcolor: '#fff' }}>
        <DataGrid
          rows={data || []}
          columns={emailsColumns}
          getRowId={(row) => row._id}
          hideFooter
        />
      </Box>
    </Box>
  )
}

export default RecentEmail