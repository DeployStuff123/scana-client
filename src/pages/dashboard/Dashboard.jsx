import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Typography, Stack, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import apiReq from '../../../utils/axiosReq';
import Loader from '../../common/Loader';
import useAuth from '../../hook/useAuth';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AccessTime } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { token } = useAuth();

  const { t } = useTranslation('dashboard');
  const { data, isLoading, isError } = useQuery({
    queryFn: async () => await apiReq.get('api/dashboard', { headers: { Authorization: token } }),
    queryKey: ['dashboard']
  });


  const dashboardData = data?.data || {
    totalUsers: 0,
    totalLinks: 0,
    totalVisits: 0,
    totalEmails: 0,
    recentLinks: [],
    topLinks: [],
    recentEmails: []
  };

  // Prepare data for charts
  const topLinksChartData = dashboardData.topLinks
    .filter(link => link.visits > 0) // Only show links with visits
    .map(link => ({
      name: link.slug,
      visits: link.visits,
      emails: link.emails
    }));

  if (isLoading) return <Loader />;
  if (isError) return <Typography color="error">Error loading dashboard data</Typography>;


  return (
    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .5 }}>

    <Box sx={{
      bgcolor: '#fff',
      p: { xs: 2, md: 3 },
      borderRadius: '16px',
      minHeight: '100vh'
    }} maxWidth='lg'>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 10 } }}>
        <Card sx={{
          flex: 1,
          height: '100%',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          borderRadius: 4,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.2)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              mb: 2
            }}>
              {t('link_created')}
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}>
              {data?.data?.totalLinks || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{
          flex: 1,
          height: '100%',
          background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
          color: 'white',
          borderRadius: 4,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(255, 152, 0, 0.2)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              mb: 2
            }}>
              {t('emails_collected')}
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}>
              {data?.data?.totalEmails || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{
          flex: 1,
          height: '100%',
          background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
          color: 'white',
          borderRadius: 4,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              mb: 2
            }}>
              {t('link_visits')}
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}>
              {data?.data?.totalVisits || 0}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top Links Bar Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, borderRadius: 2, border: '1px solid lightgray', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Links
            </Typography>
            {topLinksChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topLinksChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="10 10" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#2196F3" name="Visits" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No visit data available</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, borderRadius: 2, border: '1px solid lightgray' }}>
            <Typography variant="h6" gutterBottom>
              Recent Email Captures
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell>Captured</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentEmails.length > 0 ? dashboardData.recentEmails.map((email) => (
                    <TableRow key={email._id}>
                      <TableCell>{email.email}</TableCell>
                      <TableCell>
                        <Link
                          to={`redirect-links/${email.link.slug}`}
                          style={{
                            textDecoration: 'none',
                            color: '#1976d2',
                            fontWeight: 500
                          }}
                        >
                          {email.link.slug}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2">
                            {format(parseISO(email.visitedAt), 'MMM d, h:mm a')}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography color="text.secondary">No data available</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>

    </Box >

    </motion.div>

  );
};

export default Dashboard;