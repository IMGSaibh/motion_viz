import { useMemo } from 'react';
import { uid } from '@/domain/label_logic';
import SaveIcon from '@mui/icons-material/Save';
import {
  //get_label_images_cat1_rula,
  //get_label_images_cat2_rula,
  //get_label_images_cat3_rula,
  get_label_images_rula_cat_l,
  get_label_images_rula_cat_la,
  get_label_images_rula_cat_n,
  get_label_images_rula_cat_t,
  get_label_images_rula_cat_ua,
  get_label_images_rula_cat_w,
} from '@/Assets/label_images';
import { Box, ButtonBase, Grid, IconButton } from '@mui/material';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import type { LabelImage, LabelCategory, ErgoLabel } from '@/domain/datatypes';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_frame_slider_context } from '@/context/context_frame_slider';

type Props = {
  onClick?: (label: ErgoLabel) => void;
};

function CategoryGrid({
  cat,
  title,
  //rula_button_images,
  rula_button_cat_values,
  selected_cat_image,
  onSelect,
  isLast,
}: {
  //cat: 'CAT1' | 'CAT2' | 'CAT3';
  cat: 'CAT_UA' | 'CAT_LA' | 'CAT_W' | 'CAT_N' | 'CAT_T' | 'CAT_L';
  title: string;
  //rula_button_images: readonly LabelImage[];
  rula_button_cat_values: readonly LabelCategory[];
  selected_cat_image: string | null;
  // onSelect: (slot: 'CAT1' | 'CAT2' | 'CAT3', img: LabelImage) => void;
  onSelect: (rula_category: 'CAT_UA' | 'CAT_LA' | 'CAT_W' | 'CAT_N' | 'CAT_T' | 'CAT_L', rula_cat_values: LabelCategory) => void;
  isLast?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        borderRight: isLast ? 'none' : `1px solid ${theme.palette.wip_color_theme[200]}`,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Box sx={{ fontSize: 12, pb: 1, pt: 1, textAlign: 'center' }}>{title}</Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          flexGrow: 1,
          alignContent: 'start',
        }}
      >
        {rula_button_cat_values.map((item, i) => {
          const isSelected = selected_cat_image === item.image?.name;
          const isDimmed = selected_cat_image !== null && !isSelected;
          return (
            <ButtonBase
              key={`${item.element_id}-${item.image?.name}-${i}`}
              onClick={() => onSelect(cat, item)}
              sx={(theme) => ({
                border: `1px solid ${theme.palette.wip_color_theme[300]}`,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                opacity: isDimmed ? 0.35 : 1,
                outline: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                outlineOffset: -2,
              })}
            >
              <Box
                component="img"
                src={item.image?.src}
                alt={item.image?.name}
                sx={{
                  height: 40,
                  objectFit: 'contain',
                  width: '100%',
                  backgroundColor: 'white',
                  filter: isDimmed ? 'grayscale(1)' : 'none',
                }}
              />

              <Box
                sx={{
                  fontSize: 12,
                  lineHeight: 1.2,
                  width: '100%',
                  textAlign: 'center',
                  py: 0.5,
                }}
              >
                {item.image?.name}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

export function WidgetRulaButtons(props: Props) {


  //const label_images_cat1 = useMemo(() => get_label_images_cat1_rula(), []);
  //const label_images_cat2 = useMemo(() => get_label_images_cat2_rula(), []);
  //const label_images_cat3 = useMemo(() => get_label_images_cat3_rula(), []);
  const label_images_rula_cat_ua = useMemo(() => get_label_images_rula_cat_ua(), []);
  const label_images_rula_cat_la = useMemo(() => get_label_images_rula_cat_la(), []);
  const label_images_rula_cat_w = useMemo(() => get_label_images_rula_cat_w(), []);
  const label_images_rula_cat_n = useMemo(() => get_label_images_rula_cat_n(), []);
  const label_images_rula_cat_t = useMemo(() => get_label_images_rula_cat_t(), []);
  const label_images_rula_cat_l = useMemo(() => get_label_images_rula_cat_l(), []);

  // Element IDs for RULA images
  const label_cat_ua_element_ids = useMemo(
  () => Array.from({ length: label_images_rula_cat_ua.length }, (_, i) => i + 1),
  [label_images_rula_cat_ua]);

  const label_cat_la_element_ids = useMemo(
  () => Array.from({ length: label_images_rula_cat_la.length }, (_, i) => i + 1),
  [label_images_rula_cat_la]);

  const label_cat_w_element_ids = useMemo(
  () => Array.from({ length: label_images_rula_cat_w.length }, (_, i) => i + 1),
  [label_images_rula_cat_w]);

  const label_cat_n_element_ids = useMemo(
  () => Array.from({ length: label_images_rula_cat_n.length }, (_, i) => i + 1),
  [label_images_rula_cat_n]);

  const label_cat_t_element_ids = useMemo(
  () => Array.from({ length: label_images_rula_cat_t.length }, (_, i) => i + 1),
  [label_images_rula_cat_t]);

  const label_cat_l_element_ids = useMemo(
  () => Array.from({ length: label_images_rula_cat_l.length }, (_, i) => i + 1),
  [label_images_rula_cat_l]);


  const { range, set_range } = use_frame_slider_context();

  const { rula_selected, set_rula_selected } = use_ergo_methods_cxt();
  const allSelected = Boolean(
    rula_selected.CAT_UA &&
    rula_selected.CAT_LA &&
    rula_selected.CAT_W &&
    rula_selected.CAT_N &&
    rula_selected.CAT_T &&
    rula_selected.CAT_L,
  );

  const can_save_label = use_can_save_label_cxt();
  const canSaveRula = can_save_label('RULA');

  const handleSelect = (rula_cat: 'CAT_UA' | 'CAT_LA' | 'CAT_W' | 'CAT_N' | 'CAT_T' | 'CAT_L', rula_cat_value: LabelCategory) => {
    // set element_id to the current value if it exists, otherwise set to -1

    set_rula_selected({ ...rula_selected, [rula_cat]: rula_cat_value });
    console.log('rula_selected on select', rula_cat_value);
  };

  const on_handle_save = () => {
    if (!allSelected) return;
    if (!canSaveRula) return;

    console.log('rula_selected on save', rula_selected);

    const categories: LabelCategory[] = [
      { image: rula_selected.CAT_UA?.image!, element_id: rula_selected.CAT_UA?.element_id!},      
      { image: rula_selected.CAT_LA?.image!, element_id: rula_selected.CAT_LA?.element_id!},
      { image: rula_selected.CAT_W?.image!, element_id: rula_selected.CAT_W?.element_id! },
      { image: rula_selected.CAT_N?.image!, element_id: rula_selected.CAT_N?.element_id! },
      { image: rula_selected.CAT_T?.image!, element_id: rula_selected.CAT_T?.element_id! },
      { image: rula_selected.CAT_L?.image!, element_id: rula_selected.CAT_L?.element_id!},
    ];

    

    const from = Math.min(range[0], range[1]);
    const to = Math.max(range[0], range[1]);
    const labelText = categories.map((c) => c.image?.name ?? '').join(' | ');

    const label: ErgoLabel = {
      id: uid(),
      start_frame: from,
      end_frame: to,
      ergo_method: 'RULA',
      button_text: labelText,
      categories,
    };

    props.onClick?.(label);
    console.log('Saved RULA label:', label);
    set_rula_selected({ CAT_UA: null, CAT_LA: null, CAT_W: null, CAT_N: null, CAT_T: null, CAT_L: null });
  };

  //console.log("---->",rula_selected)
  return (    
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.wip_color_theme[200]}`,
        borderBottom: `1px solid ${theme.palette.wip_color_theme[200]}`,
      })}
    >
      <Grid container spacing={0} wrap="nowrap" alignItems="stretch">
        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_UA"
            title="Upper Arm"
            rula_button_cat_values={label_cat_ua_element_ids.map((id) => 
              ({image: label_images_rula_cat_ua[id-1], element_id: id }))}
            selected_cat_image={rula_selected.CAT_UA?.image?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 4 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_LA"
            title="Lower Arm"
            rula_button_cat_values={label_cat_la_element_ids.map((id) => 
              ({image: label_images_rula_cat_la[id-1], element_id: id }))}
            selected_cat_image={rula_selected.CAT_LA?.image?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_W"
            title="Wrist"
            rula_button_cat_values={label_cat_w_element_ids.map((id) => 
              ({image: label_images_rula_cat_w[id-1], element_id: id }))}
            selected_cat_image={rula_selected.CAT_W?.image?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_N"
            title="Neck"
            rula_button_cat_values={label_cat_n_element_ids.map((id) => 
              ({image: label_images_rula_cat_n[id-1], element_id: id }))}
            selected_cat_image={rula_selected.CAT_N?.image?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_T"
            title="Trunk"
            rula_button_cat_values={label_cat_t_element_ids.map((id) => 
              ({image: label_images_rula_cat_t[id-1], element_id: id }))}
            selected_cat_image={rula_selected.CAT_T?.image?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>
        <Grid size={{ md: 3 }} sx={{ display: 'flex', alignSelf: 'stretch' }}>
          <CategoryGrid
            cat="CAT_L"
            title="Legs"
            rula_button_cat_values={label_cat_l_element_ids.map((id) => 
              ({image: label_images_rula_cat_l[id-1], element_id: id }))}
            selected_cat_image={rula_selected.CAT_l?.image?.name ?? null}
            onSelect={handleSelect}
          />
        </Grid>

        {/* Save Button */}
        <Grid size={{ md: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton
              size="small"
              aria-label="Save label"
              onClick={on_handle_save}
              disabled={!allSelected || !canSaveRula}
              sx={{ border: 1, borderRadius: 0 }}
            >
              <SaveIcon fontSize="large" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

