import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import BoltIcon from '@mui/icons-material/Bolt';
import FilterListIcon from '@mui/icons-material/FilterList';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { Tooltip, Divider, Avatar, Badge, Paper } from '@mui/material';
import { capitalizeFirstLetter } from '~/utils/formatters';
import BoardUserGroup from './BoardUserGroup';
import InviteBoardUser from './InviteBoardUser';
import { useState } from 'react';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import { updateBoardDetailsAPI } from '~/apis';
import authorizedAxiosInstance from '~/utils/authorizeAxios';
import { API_ROOT } from '~/utils/constants';
import { toast } from 'react-toastify';

const MENU_STYLES = {
  color: theme => theme.palette.mode === 'dark' ? 'white' : 'inherit',
  bgcolor: 'rgba(255, 255, 255, 0.2)',
  paddingX: '12px',
  paddingY: '6px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  fontSize: '0.875rem',
  fontWeight: 500,
  '.MuiSvgIcon-root': {
    fontSize: '18px'
  },
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.3)'
  }
};

const ColorBox = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '6px',
  cursor: 'pointer',
  border: '1px solid #ddd',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  '&.selected': {
    border: '3px solid white',
    boxShadow: '0 0 0 2px #2196f3'
  }
}));

const GradientBox = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '6px',
  cursor: 'pointer',
  border: '1px solid #ddd',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  '&.selected': {
    border: '3px solid white',
    boxShadow: '0 0 0 2px #2196f3'
  }
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Array of background colors
const BACKGROUND_COLORS = [
  '#0079bf', // Blue
  '#519839', // Green
  '#d29034', // Orange
  '#b04632', // Red
  '#89609e', // Purple
  '#00aecc', // Teal
  '#4d4d4d', // Dark
  '#838c91'  // Grey
];

// Array of gradient backgrounds
const GRADIENT_BACKGROUNDS = [
  'linear-gradient(to right, #0079bf, #5067c5)',
  'linear-gradient(135deg, #00b09b, #96c93d)',
  'linear-gradient(to right, #ff5f6d, #ffc371)',
  'linear-gradient(to right, #4568dc, #b06ab3)',
  'linear-gradient(to right, #614385, #516395)',
  'linear-gradient(to right, #02aab0, #00cdac)',
  'linear-gradient(to right, #2980b9, #2c3e50)',
  'linear-gradient(to right, #373b44, #4286f4)'
];

function BoardBar({ board }) {
  const [starred, setStarred] = useState(board?.starred || false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [backgroundTab, setBackgroundTab] = useState(0);
  const [selectedColor, setSelectedColor] = useState(board?.backgroundColor || BACKGROUND_COLORS[0]);
  const [uploadPreview, setUploadPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
  // Preview state
  const [previewBackground, setPreviewBackground] = useState({
    type: board?.backgroundType || 'color',
    color: board?.backgroundColor || BACKGROUND_COLORS[0],
    image: board?.backgroundImage || ''
  });

  const handleOpenBackgroundModal = () => {
    setBackgroundTab(board?.backgroundType === 'image' ? 1 : 0);
    setSelectedColor(board?.backgroundColor || BACKGROUND_COLORS[0]);
    setPreviewBackground({
      type: board?.backgroundType || 'color',
      color: board?.backgroundColor || BACKGROUND_COLORS[0],
      image: board?.backgroundImage || ''
    });
    setIsBackgroundModalOpen(true);
  };

  const handleCloseBackgroundModal = () => {
    setIsBackgroundModalOpen(false);
    setBackgroundTab(board?.backgroundType === 'image' ? 1 : 0);
    setSelectedColor(board?.backgroundColor || BACKGROUND_COLORS[0]);
    setUploadPreview('');
    setUploadedImageUrl('');
  };

  const handleBackgroundTabChange = (event, newValue) => {
    setBackgroundTab(newValue);
    setPreviewBackground(prev => ({
      ...prev,
      type: newValue === 0 ? 'color' : 'image'
    }));
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setPreviewBackground(prev => ({
      ...prev,
      color: color
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and GIF are supported.');
      return;
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    
    setPreviewBackground(prev => ({
      ...prev,
      image: previewUrl
    }));

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('backgroundImage', file);
      
      const response = await authorizedAxiosInstance.post(
        `${API_ROOT}/v1/boards/upload-background`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data && response.data.imageUrl) {
        setUploadedImageUrl(response.data.imageUrl);
        setPreviewBackground(prev => ({
          ...prev,
          image: response.data.imageUrl
        }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to get image URL from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBackground = async () => {
    let updateData = {};
    
    if (backgroundTab === 0) {
      // Color background
      updateData = {
        backgroundType: 'color',
        backgroundColor: selectedColor,
        backgroundImage: ''
      };
    } else {
      // Image background
      const imageUrl = uploadedImageUrl || board?.backgroundImage || '';
      updateData = {
        backgroundType: 'image',
        backgroundImage: imageUrl,
        backgroundColor: board?.backgroundColor || BACKGROUND_COLORS[0]
      };
    }

    try {
      const loadingToastId = toast.loading('Updating background...');
      
      const result = await updateBoardDetailsAPI(board._id, updateData);
      
      toast.dismiss(loadingToastId);
      
      if (result) {
        toast.success('Background updated successfully!');
        handleCloseBackgroundModal();

        setTimeout(() => {
          window.location.reload(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving background:', error);
      toast.error('Failed to update background. Please try again.');
    }
  };

  // Render background preview in modal
  const renderBackgroundPreview = () => {
    let previewStyle = {};
    
    if (previewBackground.type === 'image' && previewBackground.image) {
      previewStyle = {
        backgroundImage: `url(${previewBackground.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else {
      // If it's a gradient (contains the word 'gradient')
      if (previewBackground.color && previewBackground.color.includes('gradient')) {
        previewStyle = {
          backgroundImage: previewBackground.color
        };
      } else {
        previewStyle = {
          backgroundColor: previewBackground.color || BACKGROUND_COLORS[0]
        };
      }
    }
    
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: 200, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          mb: 3,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          ...previewStyle
        }} 
      />
    );
  };

  const handleToggleStar = async () => {
    try {
      // Optimistic UI update
      setStarred(!starred);
      
      // Call API to update the board's starred status
      await updateBoardDetailsAPI(board._id, { starred: !starred });
      
    } catch (error) {
      // Revert on error
      setStarred(starred);
      toast.error('Failed to update starred status.');
      console.error(error);
    }
  };

  return (
    <>
      <Box sx={{
        width: '100%',
        height: theme => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {board?.title}
            </Typography>
            <Tooltip title={starred ? 'Unstar Board' : 'Star Board'}>
              <IconButton size="small" onClick={handleToggleStar} sx={{ color: starred ? '#f9ca24' : 'white' }}>
                {starred ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Chip
              sx={MENU_STYLES}
              icon={<VpnLockIcon />}
              label={capitalizeFirstLetter(board?.type)}
              clickable
            />
            
            <Chip
              sx={MENU_STYLES}
              icon={<PeopleAltOutlinedIcon />}
              label="Workspace visible"
              clickable
            />
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', display: { xs: 'none', md: 'block' } }} />
          
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <InviteBoardUser />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FilterListIcon />}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.25)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.35)' }
              }}
            >
              Filters
            </Button>
          </Box>
          
          <Tooltip title="Change Background">
            <Chip
              sx={MENU_STYLES}
              icon={<WallpaperIcon />}
              label="Background"
              onClick={handleOpenBackgroundModal}
              clickable
            />
          </Tooltip>
          
          <Box>
            <BoardUserGroup />
          </Box>
        </Box>
      </Box>

      {/* Background Selection Modal */}
      <Modal
        open={isBackgroundModalOpen}
        onClose={handleCloseBackgroundModal}
        aria-labelledby="background-modal-title"
      >
        <Paper sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="background-modal-title" variant="h6" component="h2">
              Change Board Background
            </Typography>
            <IconButton onClick={handleCloseBackgroundModal} size="small">
              <CancelIcon />
            </IconButton>
          </Box>
          
          {/* Preview area */}
          {renderBackgroundPreview()}
          
          <Tabs 
            value={backgroundTab} 
            onChange={handleBackgroundTabChange} 
            variant="fullWidth" 
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<ColorLensOutlinedIcon />} 
              label="Colors" 
              sx={{ textTransform: 'none' }} 
            />
            <Tab 
              icon={<ImageOutlinedIcon />} 
              label="Photos" 
              sx={{ textTransform: 'none' }} 
            />
          </Tabs>
          
          {/* Color Selection */}
          {backgroundTab === 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Colors
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {BACKGROUND_COLORS.map((color, index) => (
                  <Grid item key={index}>
                    <ColorBox 
                      className={selectedColor === color ? 'selected' : ''} 
                      onClick={() => handleColorSelect(color)} 
                      sx={{ bgcolor: color }}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mb: 2, mt: 3, fontWeight: 500 }}>
                Gradients
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {GRADIENT_BACKGROUNDS.map((gradient, index) => (
                  <Grid item key={index}>
                    <GradientBox 
                      className={selectedColor === gradient ? 'selected' : ''} 
                      onClick={() => handleColorSelect(gradient)} 
                      sx={{ backgroundImage: gradient }}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {/* Image Upload */}
          {backgroundTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {uploadPreview && (
                <Box 
                  component="img" 
                  src={uploadPreview} 
                  alt="Background Preview" 
                  sx={{ 
                    width: '100%', 
                    height: 200, 
                    objectFit: 'cover', 
                    borderRadius: 2,
                    mb: 2 
                  }} 
                />
              )}
              
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                disabled={isUploading}
                sx={{ textTransform: 'none' }}
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <VisuallyHiddenInput 
                  type="file" 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/gif" 
                />
              </Button>
              
              <Typography variant="caption" color="text.secondary" align="center">
                Supported formats: JPG, PNG, GIF. Max size: 10MB
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              onClick={handleCloseBackgroundModal} 
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBackground} 
              variant="contained" 
              color="primary"
              disabled={backgroundTab === 1 && !uploadPreview && !board?.backgroundImage}
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}

export default BoardBar;
