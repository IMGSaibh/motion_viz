import { WidgetLabelList } from '@/components/widgets/widget_label_list';
import { Label } from '@/containers/container_bottom_ui';
import { Button, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { LabelImage } from '@/Assets/label_images';

type Props = {
  lables_list: Label[];
  slider_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
  save_labels_on_click?: () => void;
  label_image: LabelImage | null;
};

export function PresenterLabelListUI(props: Props) {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <>
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Dropdown-Header */}

          <Button
            onClick={() => setOpen((v) => !v)}
            startIcon={
              <ExpandMoreIcon
                sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
              />
            }
            sx={{ width: '100%' }}
          >
            Label-List
          </Button>

          <Button onClick={props.slider_list_clear_on_click} sx={{ width: '100%' }}>
            <DeleteIcon fontSize="small" sx={{ mr: '0.5rem' }} />
            Clear Label-List
          </Button>
          <Button onClick={() => props.save_labels_on_click?.()} sx={{ width: '100%' }}>
            <SaveIcon fontSize="small" sx={{ mr: '0.5rem' }} />
            Save Label-List
          </Button>
        </Grid>
        <Grid size={{ md: 4 }}></Grid>
        <Grid size={{ md: 4 }}></Grid>
      </Grid>
      <WidgetLabelList
        labels={props.lables_list}
        slider_list_on_click={props.slider_list_on_click}
        slider_list_clear_on_click={props.slider_list_clear_on_click}
        save_labels_on_click={props.save_labels_on_click}
        toggle_list={open}
      />
    </>
  );
}
