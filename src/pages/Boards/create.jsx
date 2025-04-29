import { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators';
import FieldErrorAlert from '~/components/Form/FieldErrorAlert';
import AbcIcon from '@mui/icons-material/Abc';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createNewBoardAPI } from '~/apis';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import axios from 'axios';
import { API_ROOT } from '~/utils/constants';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import authorizedAxiosInstance from '~/utils/authorizeAxios';

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300]
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#0c66e4',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#e9f2ff'
  }
}));

const ColorBox = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '4px',
  cursor: 'pointer',
  border: '1px solid #ddd',
  '&:hover': {
    opacity: 0.8
  },
  '&.selected': {
    border: '2px solid black'
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
  '#2980b9', // Blue
  '#27ae60', // Green
  '#f39c12', // Yellow
  '#e74c3c', // Red
  '#9b59b6', // Purple
  '#1abc9c', // Teal
  '#34495e', // Dark
  '#95a5a6'  // Grey
];

// BOARD_TYPES tương tự bên model phía Back-end (nếu cần dùng nhiều nơi thì hãy đưa ra file constants, không thì cứ để ở đây)
const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

/**
 * Bản chất của cái component SidebarCreateBoardModal này chúng ta sẽ trả về một cái SidebarItem để hiển thị ở màn Board List cho phù hợp giao diện bên đó, đồng thời nó cũng chứa thêm một cái Modal để xử lý riêng form create board nhé.
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover. Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì, nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu nhé.
 */
function SidebarCreateBoardModal({ afterCreateNewBoard }) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  const [isOpen, setIsOpen] = useState(false);
  const [backgroundTab, setBackgroundTab] = useState(0);
  const [selectedColor, setSelectedColor] = useState(BACKGROUND_COLORS[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Thêm state xem trước
  const [previewBackground, setPreviewBackground] = useState({
    type: 'color',
    color: BACKGROUND_COLORS[0],
    image: ''
  });

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => {
    setIsOpen(false);
    // Reset form and state when modal is closed
    reset();
    setBackgroundTab(0);
    setSelectedColor(BACKGROUND_COLORS[0]);
    setUploadedImage(null);
    setUploadPreview('');
    // Reset preview
    setPreviewBackground({
      type: 'color',
      color: BACKGROUND_COLORS[0],
      image: ''
    });
  };

  const handleBackgroundTabChange = (event, newValue) => {
    setBackgroundTab(newValue);
    // Update background type based on selected tab
    setValue('backgroundType', newValue === 0 ? 'color' : 'image');
    // Update preview
    setPreviewBackground(prev => ({
      ...prev,
      type: newValue === 0 ? 'color' : 'image'
    }));
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setValue('backgroundColor', color);
    // Update preview
    setPreviewBackground(prev => ({
      ...prev,
      color: color
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }

    // Kiểm tra kiểu file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and GIF are supported.');
      return;
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    setUploadedImage(file);
    
    // Update preview
    setPreviewBackground(prev => ({
      ...prev,
      image: previewUrl
    }));

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('backgroundImage', file);

      // Sử dụng authorizedAxiosInstance thay vì axios trực tiếp
      const response = await authorizedAxiosInstance.post(
        `${API_ROOT}/v1/boards/upload-background`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Set the image URL in the form
      setValue('backgroundImage', response.data.imageUrl);
      
      // Update preview
      setPreviewBackground(prev => ({
        ...prev,
        image: response.data.imageUrl
      }));
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Render background preview
  const renderBackgroundPreview = () => {
    const previewStyle = {
      width: '100%',
      height: '120px',
      borderRadius: '4px',
      marginBottom: '16px',
      transition: 'all 0.3s ease'
    };
    
    if (previewBackground.type === 'image' && (previewBackground.image || uploadPreview)) {
      return {
        ...previewStyle,
        backgroundImage: `url(${uploadPreview || previewBackground.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else {
      return {
        ...previewStyle,
        backgroundColor: previewBackground.color
      };
    }
  };

  const submitCreateNewBoard = data => {
    // Set background data
    if (backgroundTab === 0) {
      data.backgroundType = 'color';
      data.backgroundColor = selectedColor;
      data.backgroundImage = '';
    } else {
      data.backgroundType = 'image';
      // Only set backgroundImage if uploaded
      if (!data.backgroundImage) {
        data.backgroundImage = '';
      }
    }
    
    // Add slug if needed (usually handled by backend, but added here for safety)
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Hiển thị loading toast
    const loadingToastId = toast.loading('Creating new board...');
    
    // Create board
    createNewBoardAPI(data)
      .then((response) => {
        // Đóng loading toast
        toast.dismiss(loadingToastId);
        
        if (response) {
          toast.success('Board created successfully!');
          // Bước 01: Đóng Modal
          handleCloseModal();
          // Bước 02: Thông báo đến component cha để xử lý
          afterCreateNewBoard();
        }
      })
      .catch((error) => {
        // Đóng loading toast
        toast.dismiss(loadingToastId);
        
        console.error('Error creating board:', error);
        toast.error(error.response?.data?.message || 'Failed to create board. Please try again.');
      });
  };

  // <>...</> nhắc lại cho bạn nào chưa biết hoặc quên nhé: nó là React Fragment, dùng để bọc các phần tử lại mà không cần chỉ định DOM Node cụ thể nào cả.
  return (
    <>
      <SidebarItem onClick={handleOpenModal}>
        <LibraryAddIcon fontSize="small" />
        Create a new board
      </SidebarItem>

      <Modal
        open={isOpen}
        // onClose={handleCloseModal} // chỉ sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'white',
            boxShadow: 24,
            borderRadius: '8px',
            border: 'none',
            outline: 0,
            padding: '20px 30px',
            backgroundColor: theme => (theme.palette.mode === 'dark' ? '#1A2027' : 'white')
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              cursor: 'pointer'
            }}
          >
            <CancelIcon
              color="error"
              sx={{ '&:hover': { color: 'error.light' } }}
              onClick={handleCloseModal}
            />
          </Box>
          <Box id="modal-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LibraryAddIcon />
            <Typography variant="h6" component="h2">
              {' '}
              Create a new board
            </Typography>
          </Box>
          <Box id="modal-modal-description" sx={{ my: 2 }}>
            <form onSubmit={handleSubmit(submitCreateNewBoard)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Title"
                    type="text"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AbcIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('title', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: { value: 3, message: 'Min Length is 3 characters' },
                      maxLength: { value: 50, message: 'Max Length is 50 characters' }
                    })}
                    error={!!errors['title']}
                  />
                  <FieldErrorAlert errors={errors} fieldName={'title'} />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Description"
                    type="text"
                    variant="outlined"
                    multiline
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('description', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: { value: 3, message: 'Min Length is 3 characters' },
                      maxLength: { value: 255, message: 'Max Length is 255 characters' }
                    })}
                    error={!!errors['description']}
                  />
                  <FieldErrorAlert errors={errors} fieldName={'description'} />
                </Box>

                {/* Background Selection */}
                <FormControl component="fieldset">
                  <FormLabel component="legend">Background</FormLabel>
                  
                  {/* Background Preview */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview:</Typography>
                    <Box sx={renderBackgroundPreview()}></Box>
                  </Box>
                  
                  <Tabs 
                    value={backgroundTab} 
                    onChange={handleBackgroundTabChange}
                    variant="fullWidth"
                    sx={{ mb: 2 }}
                  >
                    <Tab icon={<ColorLensOutlinedIcon />} label="Colors" />
                    <Tab icon={<ImageOutlinedIcon />} label="Images" />
                  </Tabs>

                  {/* Hidden inputs for background data */}
                  <input
                    type="hidden"
                    {...register('backgroundType')}
                    value={backgroundTab === 0 ? 'color' : 'image'}
                  />
                  {backgroundTab === 0 && (
                    <input
                      type="hidden"
                      {...register('backgroundColor')}
                      value={selectedColor}
                    />
                  )}

                  {backgroundTab === 0 ? (
                    <Grid container spacing={1}>
                      {BACKGROUND_COLORS.map((color) => (
                        <Grid item key={color}>
                          <ColorBox
                            sx={{ backgroundColor: color }}
                            className={selectedColor === color ? 'selected' : ''}
                            onClick={() => handleColorSelect(color)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload Background Image'}
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="image/jpeg,image/png,image/gif" 
                          onChange={handleImageUpload}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Supported formats: JPG, PNG, GIF (max 10MB)
                      </Typography>
                    </Box>
                  )}
                </FormControl>

                {/*
                 * Lưu ý đối với RadioGroup của MUI thì không thể dùng register tương tự TextField được mà phải sử dụng <Controller /> và props "control" của react-hook-form như cách làm dưới đây
                 * https://stackoverflow.com/a/73336103/8324172
                 * https://mui.com/material-ui/react-radio-button/
                 */}
                <Controller
                  name="type"
                  defaultValue={BOARD_TYPES.PUBLIC}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      onChange={(event, value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControlLabel
                        value={BOARD_TYPES.PUBLIC}
                        control={<Radio size="small" />}
                        label="Public"
                        labelPlacement="start"
                      />
                      <FormControlLabel
                        value={BOARD_TYPES.PRIVATE}
                        control={<Radio size="small" />}
                        label="Private"
                        labelPlacement="start"
                      />
                    </RadioGroup>
                  )}
                />

                <Box sx={{ alignSelf: 'flex-end' }}>
                  <Button
                    className="interceptor-loading"
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={backgroundTab === 1 && !uploadPreview}
                  >
                    Create
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default SidebarCreateBoardModal;
