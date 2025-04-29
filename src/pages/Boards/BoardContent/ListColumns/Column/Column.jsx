import { useState } from 'react';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import Typography from '@mui/material/Typography';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Tooltip from '@mui/material/Tooltip';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddCardIcon from '@mui/icons-material/AddCard';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ListCards from './ListCards/ListCards';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TextField from '@mui/material/TextField';
import { useConfirm } from 'material-ui-confirm';
import Paper from '@mui/material/Paper';
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis';
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice';
import { useDispatch, useSelector } from 'react-redux';
import { cloneDeep } from 'lodash';
import ToggleFocusInput from '~/components/Form/ToggleFocusInput';

function Column({ column }) {
  const dispatch = useDispatch();
  const board = useSelector(selectCurrentActiveBoard);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  });
  
  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = event => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Cards đã được sắp xếp ở component cha cao nhất (boards/_id.jsx)
  const orderedCards = column.cards;

  const [openNewCardForm, setOpenNewCardForm] = useState(false);
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

  const [newCardTitle, setNewCardTitle] = useState('');

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title!', { position: 'bottom-right' });
      return;
    }

    // Tạo dữ liệu Card để gọi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    };

    // Gọi API tạo mới Card và làm lại dữ liệu State Board
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    });

    // Cập nhật state board
    const newBoard = cloneDeep(board);
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId);
    if (columnToUpdate) {
      // Nếu column rỗng: bản chất là đang chứa một cái Placeholder card
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard];
        columnToUpdate.cardOrderIds = [createdCard._id];
      } else {
        // Ngược lại Column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard);
        columnToUpdate.cardOrderIds.push(createdCard._id);
      }
    }
    dispatch(updateCurrentActiveBoard(newBoard));

    // Đóng trạng thái thêm Card mới & Clear Input
    toggleOpenNewCardForm();
    setNewCardTitle('');
  };

  // Xử lý xóa một Column và Cards bên trong nó
  const confirmDeleteColumn = useConfirm();
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'Delete Column?',
      description: 'This action will permanently delete your Column and its Cards! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    })
      .then(() => {
        // Update cho chuẩn dữ liệu state Board
        const newBoard = { ...board };
        newBoard.columns = newBoard.columns.filter(c => c._id !== column._id);
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id);
        dispatch(updateCurrentActiveBoard(newBoard));

        // Gọi API xử lý phía BE
        deleteColumnDetailsAPI(column._id).then(res => {
          toast.success(res?.deleteResult);
        });
      })
      .catch(() => {});
  };

  const onUpdateColumnTitle = newTitle => {
    // Gọi API update Column và xử lý dữ liệu board trong redux
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board);
      const columnToUpdate = newBoard.columns.find(c => c._id === column._id);
      if (columnToUpdate) columnToUpdate.title = newTitle;

      dispatch(updateCurrentActiveBoard(newBoard));
    });
  };

  const cardCount = orderedCards?.length || 0;

  // Phải bọc div ở đây vì vấn đề chiều cao của column khi kéo thả
  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: theme => (theme.palette.mode === 'dark' ? '#242639' : '#f1f3f5'),
          ml: 2,
          borderRadius: '8px',
          height: 'fit-content',
          maxHeight: theme => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid',
          borderColor: theme => (theme.palette.mode === 'dark' ? '#363a4f' : '#e2e8f0')
        }}
      >
        {/* Box Column Header */}
        <Box
          sx={{
            height: theme => theme.trello.columnHeaderHeight,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: theme => (theme.palette.mode === 'dark' ? '#363a4f' : '#e2e8f0')
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <DragHandleIcon sx={{ 
              color: 'text.secondary', 
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' }
            }} />
            
            <ToggleFocusInput
              value={column?.title}
              onChangedValue={onUpdateColumnTitle}
              data-no-dnd="true"
              sx={{
                '& input': {
                  fontWeight: 'bold',
                  px: 1,
                  bgcolor: 'transparent'
                }
              }}
            />
            
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ ml: 'auto', fontWeight: 500 }}
            >
              {cardCount}
            </Typography>
          </Box>

          <Box>
            <Tooltip title="More options">
              <IconButton
                size="small"
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ color: 'text.secondary' }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem
                onClick={toggleOpenNewCardForm}
                sx={{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon': { color: 'success.light' }
                  }
                }}
              >
                <ListItemIcon>
                  <AddCardIcon className="add-card-icon" fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleDeleteColumn}
                sx={{
                  '&:hover': {
                    color: 'error.main',
                    '& .delete-forever-icon': { color: 'error.main' }
                  }
                }}
              >
                <ListItemIcon>
                  <DeleteForeverIcon className="delete-forever-icon" fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* List Cards */}
        <ListCards cards={orderedCards} />

        {/* Box Column Footer */}
        <Box
          sx={{
            height: theme => theme.trello.columnFooterHeight,
            p: 2
          }}
        >
          {!openNewCardForm ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Button
                startIcon={<AddCardIcon />}
                onClick={toggleOpenNewCardForm}
                sx={{
                  color: theme => theme.palette.text.primary,
                  bgcolor: theme => (theme.palette.mode === 'dark' ? '#363a4f' : '#e2e8f0'),
                  width: '100%',
                  justifyContent: 'flex-start',
                  pl: 2.5,
                  '&:hover': {
                    bgcolor: theme => (theme.palette.mode === 'dark' ? '#404258' : '#d1d6db')
                  }
                }}
              >
                Add a card
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <TextField
                label="Enter card title..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                data-no-dnd="true"
                value={newCardTitle}
                onChange={e => setNewCardTitle(e.target.value)}
                sx={{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: theme => theme.palette.text.primary,
                    bgcolor: theme => theme.palette.background.paper
                  },
                  '& label.Mui-focused': { color: theme => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme => theme.palette.primary.main
                    },
                    '&:hover fieldset': {
                      borderColor: theme => theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme => theme.palette.primary.main
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={addNewCard}
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: theme => theme.palette.primary.main,
                    '&:hover': { bgcolor: theme => theme.palette.primary.dark }
                  }}
                >
                  Add
                </Button>
                <IconButton
                  onClick={toggleOpenNewCardForm}
                  size="small"
                  sx={{
                    color: theme => theme.palette.text.primary,
                    '&:hover': { color: theme => theme.palette.error.light }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default Column;
