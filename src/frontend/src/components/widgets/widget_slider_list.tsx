import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Divider, IconButton } from '@mui/material';
import { Fragment, useState } from 'react';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import ModeEditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SliderListEntry } from '../presenter/presenter_slider_list';

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
  items: SliderListEntry[];
  widget_slider_list_on_click?: (id: string) => void;
  handle_widget_slider_list_on_cick_clear_list?: () => void;
};

export function WidgetSliderList({
  items = [],
  widget_slider_list_on_click,
  handle_widget_slider_list_on_cick_clear_list,
}: Props) {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <Box sx={{ width: '100%' }}>
      {/* Dropdown-Header */}
      <Button
        onClick={() => setOpen((v) => !v)}
        endIcon={
          <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
        }
      >
        {'Label-Liste'}
      </Button>

      <Button onClick={handle_widget_slider_list_on_cick_clear_list}>
        <DeleteIcon fontSize="small" sx={{ mr: '0.5rem' }} />
        {'Clear label list'}
      </Button>

      <Collapse in={open && items.length > 0} timeout="auto" unmountOnExit>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            maxHeight: 5 * 56, // scroll list > 5 items
            overflowY: 'auto',
          }}
        >
          {items.map((slider_item, i) => (
            <Fragment key={slider_item.id}>
              <ListItem>
                <ListItemText
                  primary={slider_item.label}
                  secondary={`Frame: ${slider_item.value[0]} – ${slider_item.value[1]}`}
                  sx={{ flexShrink: 0 }}
                />

                <Box sx={{ width: '100%', ml: 10, mr: 6 }}>
                  <LabelSliderTemplate disabled={true} value={slider_item.value} min={0} max={slider_item.framecount} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{ width: 40, height: 40, border: 1, borderRadius: 2 }}
                    onClick={() => widget_slider_list_on_click?.(slider_item.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ width: 40, height: 40, border: 1, borderRadius: 2 }}>
                    <ModeEditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>

              {i < items.length - 1 && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
