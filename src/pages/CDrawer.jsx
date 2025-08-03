/* eslint-disable react/prop-types */
import { AddBoxOutlined, FiberManualRecord, ForwardToInboxOutlined, GridViewOutlined, KeyboardArrowRightOutlined, ListAlt, Logout, Person3, Person3Outlined, PlaylistAdd, Settings, SettingsOutlined, SpaceDashboard, SpaceDashboardOutlined } from '@mui/icons-material';
import { Avatar, Badge, Box, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useUser from '../hook/useUser';
import useAuth from '../hook/useAuth';
import { useTranslation } from 'react-i18next';


const CDrawer = ({ handleDrawerClose }) => {
  const [expandedNavlinkIndex, setExpandedNavlinkIndex] = useState(1);

  const { logout } = useAuth()
  const { user } = useUser()

  const { t } = useTranslation('dashboard');

  const handleExpandedNavlink = (index) => {
    setExpandedNavlinkIndex(expandedNavlinkIndex === index ? null : index);
  };


  const links = [
    { name: t('dashboard'), icon: <GridViewOutlined />, path: '', end: true },
    { name: t('redirect_links'), icon: <ListAlt />, path: 'redirect-links' },
    { name: t('follow_up'), icon: <ForwardToInboxOutlined />, path: 'follow-up' },
    { name: t('setting'), icon: <SettingsOutlined />, path: 'setting' },
  ];


  return (
    <Stack bgcolor='primary.main' sx={{ height: '100vh' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: 1,
        bgcolor: 'primary.main',
        height: '64px', pt: 2
      }}>
        <Link to='/dashboard'>
          <img style={{ width: '120px', marginTop: '50px' }} src="/logo-white.png" alt="" />
        </Link>
        <Typography sx={{ fontSize: '16px', color: '#fff', textAlign: 'center', }}>
          @{user?.username}
        </Typography>
        {
          user?.isBlocked && (
            <Typography sx={{ fontSize: '14px', color: 'tomato', textAlign: 'center' }}>
              Account Restricted <a style={{ color: '#fff' }} href="emmanuel.narkis@gmail.com">support</a>
            </Typography>
          )
        }
      </Box>
      {/* <Stack pt={5} alignItems='center'>
        <Avatar sx={{ width: 100, height: 100 }} />
        <Typography sx={{ fontSize: '25px', color: '#fff', fontWeight: 600, textAlign: 'center', mt: 1.5 }}>
         {user?.name}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#fff', textAlign: 'center', mt: 1.5 }}>
          Create and manage your ads links
        </Typography>
      </Stack> */}

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: '50%' }}>
        {links.map((item, index) => (
          <ListItem disablePadding key={index} sx={{ display: 'block' }}>
            {item.more ? (
              <>
                <ListItemButton
                  sx={{ px: 1, mx: 2, borderRadius: '5px', mb: 0.5, color: 'gray' }}
                  onClick={() => handleExpandedNavlink(index)}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                  <KeyboardArrowRightOutlined sx={{
                    transition: '.5s',
                    transform: expandedNavlinkIndex === index ? 'rotate(90deg)' : 'rotate(0deg)'
                  }} />
                </ListItemButton>
                <Collapse in={expandedNavlinkIndex === index} timeout="auto" unmountOnExit>
                  <List component="div">
                    {item.more.map((subItem, id) => (
                      <NavLink
                        end={subItem.end}
                        onClick={handleDrawerClose}
                        className="link"
                        key={id}
                        to={subItem.path}
                      >
                        {({ isActive }) => (
                          <ListItemButton
                            sx={{
                              ml: 5,
                              mr: 2,
                              mb: 0.5,
                              borderRadius: '5px',
                              bgcolor: isActive ? 'primary.main' : '',
                              color: isActive ? '#fff' : 'gray',
                              ':hover': {
                                bgcolor: isActive ? 'primary.main' : '#F5F5F5',
                              },
                            }}
                          >
                            <FiberManualRecord sx={{ fontSize: '8px', mr: 2 }} />
                            <Typography sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                              {subItem.name}
                            </Typography>
                          </ListItemButton>
                        )}
                      </NavLink>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <NavLink end={item.end} className="link" to={item.path}>
                {({ isActive }) => (
                  <Stack
                    direction='row'
                    alignItems='center'
                    onClick={handleDrawerClose}
                    sx={{
                      py: 1,
                      px: 1,
                      mx: 2,
                      borderRadius: '5px',
                      bgcolor: isActive ? '#fff' : 'transparent',
                      color: isActive ? 'primary.main' : '#fff',
                      // ':hover': {
                      //   bgcolor: isActive ? 'primary.main' : '#F5F5F5',
                      // },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                    <Badge sx={{ mr: 2 }} badgeContent={item.notification} color="warning" />
                  </Stack>
                )}
              </NavLink>
            )}
          </ListItem>
        ))}
        <ListItem onClick={logout} sx={{
          mt: 6,
          py: 1,
          px: 3,
          color: '#fff',
          cursor: 'pointer'
        }}>
          <Logout />
          <ListItemText sx={{ ml: 1.5 }} primary={t('logout')} />
        </ListItem>
      </List>

    </Stack>
  )
}

export default CDrawer