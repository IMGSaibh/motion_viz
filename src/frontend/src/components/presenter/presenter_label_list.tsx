import { WidgetLabelList } from '@/components/widgets/widget_label_list';
import { Box, Button, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import type { ErgoLabel } from '@/domain/datatypes';
import GetAppIcon from '@mui/icons-material/GetApp';

type Props = {
  lable_list: ErgoLabel[];
  delete_label_from_list_on_click?: (id: string) => void;
  delete_label_list_on_click?: () => void;
  save_label_list_on_click?: () => void;
  download_labels_on_click?: () => void;
};

export function PresenterLabelList(props: Props) {
  const [open, set_open] = useState<boolean>(true);
  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Dropdown-Header */}

          <Button
            onClick={() => set_open((v) => !v)}
            startIcon={
              <ExpandMoreIcon
                sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
              />
            }
            sx={{ width: '100%' }}
          >
            Label-List {props.lable_list.length > 0 ? `(${props.lable_list.length})` : ''}
          </Button>

          <Button onClick={props.delete_label_list_on_click} sx={{ width: '100%' }}>
            <DeleteIcon fontSize="small" sx={{ mr: '0.5rem' }} />
            Clear Label-List
          </Button>
          <Button onClick={() => props.save_label_list_on_click?.()} sx={{ width: '100%' }}>
            <SaveIcon fontSize="small" sx={{ mr: '0.5rem' }} />
            Save Label-List
          </Button>
          <Button
            onClick={() => {
              props.download_labels_on_click?.();
            }}
            sx={{ width: '100%' }}
          >
            <GetAppIcon fontSize="small" sx={{ mr: '0.5rem' }} />
            Download Labels
          </Button>
        </Grid>
        <Grid size={{ md: 4 }}></Grid>
        <Grid size={{ md: 4 }}></Grid>
      </Grid>
      <WidgetLabelList
        labels={props.lable_list}
        delete_label_from_list_on_click={props.delete_label_from_list_on_click}
        toggle_list={open}
      />
    </Box>
  );
}
