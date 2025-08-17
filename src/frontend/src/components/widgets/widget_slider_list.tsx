import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Divider } from '@mui/material';
import { Fragment, useState } from 'react';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

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
export type SliderListEntry = {
  id: string;
  label: string;
  value: [number, number];
};

type Props = {
  items: SliderListEntry[];
  title?: string;
};

export function WidgetSliderList({ items, title = 'Label-Liste' }: Props) {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dropdown-Header */}
      <Button
        onClick={() => setOpen((v) => !v)}
        endIcon={
          <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
        }
        sx={{
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {title}
      </Button>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            maxHeight: 5 * 56, // scroll list >5 items
            overflowY: 'auto',
          }}
        >
          {items.map((it, i) => (
            <Fragment key={it.id}>
              <ListItem
                sx={{
                  // Horizontal-Layout: links Text, rechts Slider
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px,auto) 1fr',
                  alignItems: 'center',
                }}
              >
                <ListItemText primary={it.label} secondary={`Frame: ${it.value[0]} – ${it.value[1]}`} />

                <Box sx={{ pointerEvents: 'none' }}>
                  <LabelSliderTemplate value={it.value} max={999} />
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
