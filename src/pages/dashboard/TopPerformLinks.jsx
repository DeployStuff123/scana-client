import { Box, Typography } from '@mui/material';
import React from 'react'
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const TopPerformLinks = ({ data }) => {
  const { t } = useTranslation('dashboard');
  const topLinksColumns = [
    {
      field: 'slug',
      headerName: t('name'),
      width: 200,
      renderCell: (params) => (
        <Link
          to={`redirect-links/${params.value}`}
          style={{
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: 500
          }}
        >
          {params.value}
        </Link>
      )
    },
    {
      field: 'destinationUrl',
      headerName: t('destination'),
      width: 200,
      renderCell: (params) => (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {params.value}
        </div>
      )
    },
    {
      field: 'visits',
      headerName: t('visits'),
      width: 200,
      align: 'right',
      headerAlign: 'right'
    }
  ];
  return (
    <Box mb={6}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {t('top_performing_links')}
      </Typography>
      <Box sx={{ bgcolor: '#fff' }}>
        <DataGrid
          rows={data || []}
          columns={topLinksColumns}
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
          hideFooter
        />
      </Box>
    </Box>
  )
}

export default TopPerformLinks