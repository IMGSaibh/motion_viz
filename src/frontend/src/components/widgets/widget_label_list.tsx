import { Fragment } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Box, Grid, IconButton, Typography, Divider } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import ModeEditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { WidgetLabelPreview } from './widget_label_preview';
import ClearIcon from '@mui/icons-material/Clear';
import type { Label } from '@/domain/datatypes';

import {
  use_start_edit_label_cxt,
  use_save_edit_label_cxt,
  use_cancel_edit_label_cxt,
  use_editing_label_id_cxt,
} from '@/context/context_slider_label_list';

const LabelSliderTemplate = styled(Slider)(({ theme }) => ({
  zIndex: 1,
  '& .MuiSlider-track': {
    color: theme.palette.wip_color_theme[600],
  },
  '& .MuiSlider-rail': {
    height: 2,
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
    borderLeft: `4px solid ${theme.palette.wip_color_theme[600]}`,
    borderTop: `4px solid ${theme.palette.wip_color_theme[600]}`,
    borderBottom: `4px solid ${theme.palette.wip_color_theme[600]}`,
  },
  '& .MuiSlider-thumb[data-index="1"]': {
    borderRight: `4px solid ${theme.palette.wip_color_theme[600]}`,
    borderTop: `4px solid ${theme.palette.wip_color_theme[600]}`,
    borderBottom: `4px solid ${theme.palette.wip_color_theme[600]}`,
  },
}));

type Props = {
  labels: Label[];
  delete_label_from_list_on_click?: (id: string) => void;
  slider_list_clear_on_click?: () => void;
  save_labels_on_click?: () => void;
  toggle_list: boolean;
};

export function WidgetLabelList(props: Props) {
  const startEdit = use_start_edit_label_cxt();
  const saveEdit = use_save_edit_label_cxt();
  const cancelEdit = use_cancel_edit_label_cxt();
  const editingId = use_editing_label_id_cxt();

  return (
    <Box
      sx={(theme) => ({
        flexGrow: 1,
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Collapse in={props.toggle_list && props.labels.length > 0} timeout="auto" unmountOnExit>
        <List
          sx={(theme) => ({
            width: '100%',
            maxHeight: 4 * 56, // scroll list if 3 labels present
            overflowY: 'auto',
          })}
        >
          {props.labels.map((slider_label, i) => (
            <Fragment key={slider_label.id}>
              <ListItem disableGutters>
                <Grid container spacing={0} alignItems="center" wrap="nowrap" sx={{ width: '100%' }}>
                  <Grid
                    size={{ md: 1 }}
                    sx={(theme) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: `1px solid ${theme.palette.wip_color_theme[200]}`,
                    })}
                  >
                    <WidgetLabelPreview categories={slider_label.categories ?? null} />
                  </Grid>
                  <Grid size={{ md: 10 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <LabelSliderTemplate
                      disabled={true}
                      value={[slider_label.from, slider_label.to]}
                      min={0}
                      max={slider_label.framecount ?? 0}
                    />
                  </Grid>
                  <Grid size={{ md: 1 }}>
                    <Box
                      sx={(theme) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        alignItems: 'center', // vertikal
                        justifyContent: 'center', // optional horizontal
                        borderLeft: `1px solid ${theme.palette.wip_color_theme[200]}`,
                      })}
                    >
                      <Typography variant="body2" noWrap>
                        {slider_label.label}
                      </Typography>
                      <Typography variant="caption" noWrap>
                        {`Methode ${slider_label.ergo_method}`}
                      </Typography>
                      <Typography variant="caption" noWrap>
                        {`Frame: ${slider_label.from} – ${slider_label.to}`}
                      </Typography>
                      {/* Buttons underneath text */}
                      <Box
                        sx={{
                          mt: 0.5,
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                          maxWidth: '100%',
                          alignItems: 'center',
                        }}
                      >
                        {editingId === slider_label.id ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={saveEdit}
                              aria-label="Save label"
                              sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                            >
                              <CheckIcon fontSize="inherit" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={cancelEdit}
                              aria-label="Cancel label"
                              sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                            >
                              <ClearIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => props.delete_label_from_list_on_click?.(slider_label.id)}
                              aria-label="Delete label"
                              sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => startEdit(slider_label.id)}
                              aria-label="Edit label"
                              sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                            >
                              <ModeEditIcon fontSize="inherit" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => props.delete_label_from_list_on_click?.(slider_label.id)}
                              aria-label="Delete label"
                              sx={{ width: 28, height: 28, border: 1, borderRadius: 2, flexShrink: 0 }}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </ListItem>
              {i < props.labels.length - 1 && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
