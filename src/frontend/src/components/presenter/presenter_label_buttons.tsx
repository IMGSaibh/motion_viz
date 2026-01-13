import { Box, Grid, Tabs, Tab } from '@mui/material';
import { WidgetRulaButtons } from '../widgets_ergo_methods/widget_rula_buttons';
import { WidgetOwasButtons } from '../widgets_ergo_methods/widget_owas_buttons';
import { WidgetLmmButtons } from '../widgets_ergo_methods/widget_lmm_label_buttons';
import { useState } from 'react';
import type { LabelCategory } from '@/domain/datatypes';

type Props = {
  onClick?: (label_categorie: LabelCategory[]) => void;
};

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

      {method === 'RULA' && <WidgetRulaButtons onClick={props.onClick} />}
      {method === 'OWAS' && <WidgetOwasButtons onClick={props.onClick} />}
      {method === 'LMM' && <WidgetLmmButtons onClick={props.onClick} />}
    </Box>
  );
}
