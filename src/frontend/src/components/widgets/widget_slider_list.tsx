import { Fragment, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Divider, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import ModeEditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Label } from '@/containers/container_label_list';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  use_start_edit_label_cxt,
  use_save_edit_label_cxt,
  use_cancel_edit_label_cxt,
  use_editing_label_id_cxt,
} from '@/context/context_slider_label_list';

const LabelSliderTemplate = styled(Slider)(({ theme }) => ({
  zIndex: 1,

  '& .MuiSlider-track': {
    color: theme.palette.primary.main,
  },
  '& .MuiSlider-rail': {
    height: 4,
    backgroundColor: '#fff',
    opacity: 1,
  },
  '& .MuiSlider-valueLabel': {
    background: theme.palette.primary.main,
    transform: 'translateY(-140%) scale(1)',
  },
  '& .MuiSlider-thumb': {
    width: 10,
    height: 28,
    borderRadius: 0,
    background: 'transparent',
    boxShadow: 'none',
    outline: 'none',

    '&::before, &::after': {
      content: '""',
      display: 'none',
    },
  },
  '& .MuiSlider-thumb[data-index="0"]': {
    borderLeft: '4px solid white',
    borderTop: '4px solid white',
    borderBottom: '4px solid white',
  },
  '& .MuiSlider-thumb[data-index="1"]': {
    borderRight: '4px solid white',
    borderTop: '4px solid white',
    borderBottom: '4px solid white',
  },
}));

type Props = {
  slider_labels: Label[];
  slider_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
  save_labels_on_click?: () => void;
};

export function WidgetSliderList({
  slider_labels: slider_labels = [],
  slider_list_on_click,
  slider_list_clear_on_click,
  save_labels_on_click,
}: Props) {
  const [open, setOpen] = useState<boolean>(true);
  const startEdit = use_start_edit_label_cxt();
  const saveEdit = use_save_edit_label_cxt();
  const cancelEdit = use_cancel_edit_label_cxt();
  const editingId = use_editing_label_id_cxt();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Dropdown-Header */}
        <Button
          onClick={() => setOpen((v) => !v)}
          startIcon={
            <ExpandMoreIcon
              sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
            />
          }
        >
          {'Label-Liste'}
        </Button>

        <Button onClick={slider_list_clear_on_click}>
          <DeleteIcon fontSize="small" sx={{ mr: '0.5rem' }} />
          {'Clear label list'}
        </Button>
        <Button onClick={() => save_labels_on_click?.()}>
          <SaveIcon fontSize="small" sx={{ mr: '0.5rem' }} />
          {'Save labels to json'}
        </Button>
      </Box>

      <Collapse in={open && slider_labels.length > 0} timeout="auto" unmountOnExit>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            maxHeight: 4 * 56, // scroll list > 5 items
            overflowY: 'auto',
          }}
        >
          {slider_labels.map((slider_label, i) => (
            <Fragment key={slider_label.id}>
              <ListItem>
                <ListItemText
                  primary={slider_label.label}
                  secondary={`Frame: ${slider_label.range[0]} – ${slider_label.range[1]}`}
                  sx={{ flexShrink: 0 }}
                />

                <Box sx={{ width: '100%', ml: 10, mr: 6 }}>
                  <LabelSliderTemplate
                    disabled={true}
                    value={slider_label.range}
                    min={0}
                    max={slider_label.framecount}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{ width: 40, height: 40, border: 1, borderRadius: 2 }}
                    onClick={() => slider_list_on_click?.(slider_label.id)}
                    aria-label="Delete label"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  {editingId === slider_label.id ? (
                    <>
                      <IconButton
                        size="small"
                        sx={{ width: 40, height: 40, border: 1, borderRadius: 2 }}
                        onClick={saveEdit}
                        aria-label="Save edited label"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ width: 40, height: 40, border: 1, borderRadius: 2 }}
                        onClick={cancelEdit}
                        aria-label="Cancel editing"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      size="small"
                      sx={{ width: 40, height: 40, border: 1, borderRadius: 2 }}
                      onClick={() => startEdit(slider_label.id)}
                      aria-label="Edit label"
                    >
                      <ModeEditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </ListItem>

              {i < slider_labels.length - 1 && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
