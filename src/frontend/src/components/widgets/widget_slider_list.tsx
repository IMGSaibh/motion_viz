import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Fragment, useState } from 'react';
import { Box, Divider, Stack } from '@mui/material';
import { WidgetLabelSlider } from './widget_label_slider';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export type SliderListEntry = {
  id: string;
  label: string;
  value: [number, number];
  framecount: number;
};

export type Props = {
  items: SliderListEntry[];
  onChange: (id: string, next: [number, number]) => void;
  label_slider_reference: React.RefObject<HTMLSpanElement | null>;
};

export function WidgetSliderList({ items, onChange, label_slider_reference }: Props) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setOpenMap((m) => ({ ...m, [id]: !m[id] }));

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
      {items.map((it, i) => (
        <Fragment key={it.id}>
          <ListItem sx={{ alignItems: 'flex-start' }}>
            <ListItemText primary={it.label} secondary={`Frames: ${it.value[0]} – ${it.value[1]} / ${it.framecount}`} />
            <ListItemSecondaryAction>
              <IconButton aria-label="toggle" onClick={() => toggle(it.id)}>
                {openMap[it.id] ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={!!openMap[it.id]} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2, pb: 2 }}>
              <WidgetLabelSlider
                {...{
                  label_slider_value: it.value,
                  label_slider_framecount: it.framecount,
                  label_slider_reference: label_slider_reference,
                  label_slider_on_change: (_e: Event, value: number | number[], activeIdx: number) => {
                    // Ensure a tuple is returned
                    const valArr = Array.isArray(value) ? value : [Number(value), it.value[1]];
                    const next: [number, number] = [Number(valArr[0]), Number(valArr[1] ?? it.value[1])];
                    onChange(it.id, next);
                  },
                  label_slider_on_mouse_leave: () => {},
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" onClick={() => toggle(it.id)}>
                  Fertig
                </Button>
              </Stack>
            </Box>
          </Collapse>
          {i < items.length - 1 && <Divider component="li" />}
        </Fragment>
      ))}
    </List>
  );
}

{
  //   const stdRef = useRef<HTMLSpanElement | null>(null);
  // const [stdVal, setStdVal] = useState(12);
  // const [stdMax] = useState(200);
  // const [labelVal, setLabelVal] = useState<[number, number]>([10, 50]);
  // const [labelMax] = useState(300);
  /* <WidgetSliderList
            items={items}
            onChange={(id, next) => setItems((arr) => arr.map((x) => (x.id === id ? { ...x, value: next } : x)))}
          />
          <BottomSliderBar
            std_slider_value={stdVal}
            std_slider_framecount={stdMax}
            std_slider_reference={stdRef}
            std_slider_on_change={(_e, v) => setStdVal(Number(v))}
            std_slider_on_mouse_move={() => {}}
            std_slider_on_mouse_leave={() => {}}
            label_slider_value={labelVal}
            label_slider_framecount={labelMax}
            label_slider_on_change={(_e, v) => {
              if (Array.isArray(v)) setLabelVal([Number(v[0]), Number(v[1])]);
            }}
            label_slider_on_mouse_leave={() => {}}
          /> */
}
