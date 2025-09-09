import { WidgetLabelList } from '@/components/widgets/widget_label_list';
import { Label } from '@/containers/container_bottom_ui';
import { Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

type Props = {
  slider_lables: Label[];
  slider_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
  save_labels_on_click?: () => void;
};

export function PresenterLabelListUI(props: Props) {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <>
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

        <Button onClick={props.slider_list_clear_on_click}>
          <DeleteIcon fontSize="small" sx={{ mr: '0.5rem' }} />
          {'Clear label list'}
        </Button>
        <Button onClick={() => props.save_labels_on_click?.()}>
          <SaveIcon fontSize="small" sx={{ mr: '0.5rem' }} />
          {'Save labels to json'}
        </Button>
      </Box>
      <WidgetLabelList
        slider_labels={props.slider_lables}
        slider_list_on_click={props.slider_list_on_click}
        slider_list_clear_on_click={props.slider_list_clear_on_click}
        save_labels_on_click={props.save_labels_on_click}
        toggle_list={open}
      />
    </>
  );
}
