import { Box, Grid, Tabs, Tab } from '@mui/material';
import { PresenterRulaLabelButtons } from './presenter_rula_label_buttons';
import { PresenterOwasLabelButtons } from './presenter_owas_label_buttons';
import { PresenterLlmLabelButtons } from './presenter_llm_label_buttons';
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
        bgcolor: theme.palette.wip_color_theme[500],
        width: '100%',
      })}
    >
      {/* TAB MENU */}
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 12 }}>
          <Tabs
            value={method}
            onChange={handleTabChange}
            centered
            variant="fullWidth"
            textColor="inherit"
            indicatorColor="secondary"
            sx={(theme) => ({
              '& .MuiTab-root': {
                color: 'white',
              },
              '& .Mui-selected': {
                color: theme.palette.wip_color_theme[200],
              },
            })}
          >
            <Tab value="RULA" label="RULA" />
            <Tab value="OWAS" label="OWAS" />
            <Tab value="LLM" label="LLM" />
          </Tabs>
        </Grid>
      </Grid>

      {method === 'RULA' && <PresenterRulaLabelButtons onClick={onClick} />}
      {method === 'OWAS' && <PresenterOwasLabelButtons onClick={onClick} />}
      {method === 'LLM' && <PresenterLlmLabelButtons onClick={onClick} />}
    </Box>
  );
}
