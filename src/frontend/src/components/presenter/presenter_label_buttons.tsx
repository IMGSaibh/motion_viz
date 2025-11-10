import { Box, ButtonBase, styled, FormControl, FormLabel, Grid, InputLabel, Select, MenuItem } from '@mui/material';
import { PresenterRulaLabelButtons } from './presenter_rula_label_buttons';
import { PresenterOwasLabelButtons } from './presenter_owas_label_buttons';
import { PresenterLlmLabelButtons } from './presenter_llm_label_buttons';
import { useState } from 'react';

type Props = {
  onClick?: (label: string, category: string) => void;
};

export function PresenterLabelButtons({ onClick }: Props) {
  const [method, setMethod] = useState<string>('RULA');

  const handleChange = (event: any) => {
    setMethod(event.target.value);
  };
  return (
    <>
      <Grid container spacing={0} alignItems="center" wrap="nowrap">
        <Grid size={{ md: 4 }}>
          <FormControl sx={{ m: 0, minWidth: 220 }}>
            <InputLabel id="demo-simple-select-helper-label">Ergonomie Methode</InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={method}
              label="Ergonomie Methode"
              onChange={handleChange}
            >
              <MenuItem value="RULA">RULA</MenuItem>
              <MenuItem value="OWAS">OWA</MenuItem>
              <MenuItem value="LLM">LLM</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ md: 4 }}></Grid>
        <Grid size={{ md: 4 }}></Grid>
      </Grid>
      {/* Conditional Rendering */}
      {method === 'RULA' && <PresenterRulaLabelButtons onClick={onClick} />}
      {method === 'OWAS' && <PresenterOwasLabelButtons onClick={onClick} />}
      {method === 'LLM' && <PresenterLlmLabelButtons onClick={onClick} />}
    </>
  );
}
