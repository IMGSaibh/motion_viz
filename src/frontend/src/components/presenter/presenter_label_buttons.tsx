import { Box, Grid, Tabs, Tab } from '@mui/material';
import { WidgetRulaButtons } from '@/components/widgets_ergo_methods/widget_rula_buttons';
import { WidgetOwasButtons } from '@/components/widgets_ergo_methods/widget_owas_buttons';
import { WidgetLmmButtons } from '@/components/widgets_ergo_methods/widget_lmm_label_buttons';
import { useState } from 'react';
import type { RulaCategory, RulaSelection, OwasCategory } from '@/domain/datatypes';

type Props = {
  on_owas_select: (cat: OwasCategory, featureId: number) => void;
  on_owas_save_label?: () => void;
  can_save_owas_label: boolean;
  all_owas_selected: boolean;
  on_rula_select: (cat: RulaCategory, featureId: number, isOptional: boolean) => void;
  on_rula_save_label: () => void;
  can_save_rula: boolean;
  all_rula_selected: RulaSelection;
};

/**
 * Presents the ergonomic-method tabs and selects the matching method-specific widget.
 *
 * Local tab selection is presentation state. Completed labels are emitted through props
 * so persistence and shared-state updates remain in `ContainerLabelButtons` and its
 * contexts. Add method-section layout here and method-specific controls in the matching
 * widget module.
 */
export function PresenterLabelButtons(props: Props) {
  const [method, setMethod] = useState<string>('RULA');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setMethod(newValue);
  };

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        bgcolor: theme.palette.wip_color_theme[500],
      })}
    >
      {/* TAB MENU */}
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 4 }}>
          <Tabs
            value={method}
            onChange={handleTabChange}
            centered
            variant="fullWidth"
            slotProps={{
              indicator: { sx: { display: 'none' } },
            }}
            sx={(theme) => ({
              '& .MuiTab-root:hover': {
                color: theme.palette.wip_color_theme[700],
              },
            })}
          >
            <Tab
              value="RULA"
              label="RULA"
              sx={(theme) => ({
                borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
                borderRight: `1px solid ${theme.palette.wip_color_theme[200]}`,
                borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
              })}
            />
            <Tab
              value="OWAS"
              label="OWAS"
              sx={(theme) => ({
                borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
                borderRight: `1px solid ${theme.palette.wip_color_theme[200]}`,
                borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
              })}
            />
            <Tab
              value="LMM"
              label="LMM"
              sx={(theme) => ({
                borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
                borderRight: `1px solid ${theme.palette.wip_color_theme[200]}`,
                borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
              })}
            />
          </Tabs>
        </Grid>
        <Grid size={{ md: 4 }}></Grid>
        <Grid size={{ md: 4 }}></Grid>
      </Grid>

      {method === 'RULA' && (
        <WidgetRulaButtons
          on_rula_select={props.on_rula_select}
          on_rula_save_label={props.on_rula_save_label}
          all_rula_selected={props.all_rula_selected}
          can_save_rula={props.can_save_rula}
        />
      )}
      {method === 'OWAS' && (
        <WidgetOwasButtons
          on_owas_save_label={props.on_owas_save_label}
          on_owas_select={props.on_owas_select}
          all_owas_selected={props.all_owas_selected}
          can_save_owas_label={props.can_save_owas_label}
        />
      )}
      {method === 'LMM' && <WidgetLmmButtons onClick={props.on_owas_save_label} />}
    </Box>
  );
}
