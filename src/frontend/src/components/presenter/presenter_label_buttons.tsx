import { Box, Grid, Tabs, Tab } from '@mui/material';
import { PresenterRulaLabelButtons } from './presenter_rula_label_buttons';
import { PresenterOwasLabelButtons } from './presenter_owas_label_buttons';
import { PresenterLMMLabelButtons } from './presenter_LMM_label_buttons';
import { useState } from 'react';

type Props = {
  onClick?: (label: string, category: string) => void;
};

export function PresenterLabelButtons({ onClick }: Props) {
  const [method, setMethod] = useState<string>('RULA');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setMethod(newValue);
  };

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        bgcolor: theme.palette.wip_color_theme[500],
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderRadius: 0,
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
            <Tab value="RULA" label="RULA" />
            <Tab value="OWAS" label="OWAS" />
            <Tab value="LLM" label="LLM" />
          </Tabs>
        </Grid>
        <Grid size={{ md: 4 }}></Grid>
        <Grid size={{ md: 4 }}></Grid>
      </Grid>

      {method === 'RULA' && <PresenterRulaLabelButtons onClick={onClick} />}
      {method === 'OWAS' && <PresenterOwasLabelButtons onClick={onClick} />}
      {method === 'LLM' && <PresenterLMMLabelButtons onClick={onClick} />}
    </Box>
  );
}
