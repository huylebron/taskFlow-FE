import Box from '@mui/material/Box';
import ModeSelect from '~/components/ModeSelect/ModeSelect';
import AppsIcon from '@mui/icons-material/Apps';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import Workspaces from './Menus/Workspaces';
import Recent from './Menus/Recent';
import Starred from './Menus/Starred';
import Templates from './Menus/Templates';
import Profiles from './Menus/Profiles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import Notifications from './Notifications/Notifications';
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';

function AppBar() {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 280,
          boxSizing: 'border-box',
          bgcolor: theme => theme.palette.background.paper
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SvgIcon
            component={TrelloIcon}
            fontSize="small"
            inheritViewBox
            sx={{ color: theme => theme.palette.primary.main }}
          />
          <Typography variant="h6" color="primary">TaskFlow</Typography>
        </Box>
        <IconButton onClick={toggleMobileMenu}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/boards">
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Boards" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AddIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Create Board" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Workspaces" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Recent" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Templates" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: theme => theme.trello.appBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: { xs: 1, sm: 2 },
        overflowX: 'auto',
        bgcolor: theme => (theme.palette.mode === 'dark' ? '#1a1a2e' : '#0079bf'),
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1100
      }}
    >
      {mobileDrawer}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isMobile && (
          <IconButton 
            onClick={toggleMobileMenu}
            sx={{ color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Link to="/boards" style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SvgIcon
              component={TrelloIcon}
              fontSize="small"
              inheritViewBox
              sx={{ color: 'white' }}
            />
            <Typography
              variant="h6"
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.2rem' }, 
                fontWeight: 'bold', 
                color: 'white',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              TaskFlow
            </Typography>
          </Box>
        </Link>

        {!isMobile && (
          <>
            <Link to="/boards" style={{ textDecoration: 'none' }}>
              <Button
                variant="text"
                startIcon={<DashboardIcon />}
                sx={{
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Boards
              </Button>
            </Link>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Workspaces />
              <Recent />
              <Starred />
              <Templates />
            </Box>
            
            <Button
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        {!isMobile && <AutoCompleteSearchBoard />}
        
        <ModeSelect />

        <Tooltip title="Notifications">
          <IconButton sx={{ color: 'white' }} onClick={() => {}}>
            <NotificationsNoneIcon />
          </IconButton>
        </Tooltip>

        {!isMobile && (
          <Tooltip title="Help">
            <IconButton sx={{ color: 'white' }} onClick={() => {}}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        )}

        <Profiles />
      </Box>
    </Box>
  );
}

export default AppBar;
