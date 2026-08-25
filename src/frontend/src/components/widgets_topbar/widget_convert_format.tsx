import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import LoopIcon from '@mui/icons-material/Loop';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

type Props = {
  topologies: string[];
  motion_files: Array<{ type: string; name: string }>;
  
  file_dialog_reference: React.RefObject<HTMLInputElement | null>;
  file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;

  visualize_skeletons: (sourceFile: string, targetFormat: string) => void;
  convert_skeletons: () => Promise<void>;
};

export function WidgetConvertFormat(props: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sourceFile, setSourceFile] = useState('');
  // const [sourceFormat, setSourceFormat] = useState('');
  const [targetFormat, setTargetFormat] = useState('');
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (sourceFile && targetFormat) {
      const sourceFileStem = sourceFile.split('.')[0];
      const targetFormatStem = targetFormat.split('.')[0];
      console.log(`Ready to convert ${sourceFileStem} to ${targetFormatStem}`);

      //This calls the visualize skeletons method in skeleton_mapper.ts, from three_js_manager.ts
      props.visualize_skeletons(sourceFileStem, targetFormatStem);
    }
  }, [sourceFile, targetFormat]);
  

  return (
    <>
      <Button 
        component="label" 
        startIcon={<LoopIcon />}
        onClick={handleClick}
      >
        Convert Format
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Convert Motion Capture Format
          </Typography>
          
          {/* Source File Dropdown */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="source-file-label">Select Source File</InputLabel>
            <Select
              labelId="source-file-label"
              value={sourceFile}
              label="Select Source File"
              onChange={(e) => setSourceFile(e.target.value)}
            >
              <MenuItem value="">
                <em>Select File</em>
              </MenuItem>
              {props.motion_files.filter((file) => file.type === 'npy').map((file_obj) => (
                <MenuItem key={file_obj.name} value={file_obj.name}>
                  [{file_obj.type.toUpperCase()}] {file_obj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Target Format Dropdown */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="target-format-label">Target Format</InputLabel>
            <Select
              labelId="target-format-label"
              value={targetFormat}
              label="Target Format"
              onChange={(e) => setTargetFormat(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Format</em>
              </MenuItem>
              {props.topologies.map((topology) => (
                <MenuItem key={topology} value={topology}>
                  {topology}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            fullWidth 
            size="small"
            sx={{ mt: 1 }}
            disabled={!sourceFile || !targetFormat}
            onClick={props.convert_skeletons}
            >
            Convert
          </Button>
          
          {/* Hidden file input for future use */}
          <input 
            ref={props.file_dialog_reference} 
            type="file" 
            multiple 
            hidden 
            onChange={props.file_dialog_on_change} 
          />
        </Box>
      </Menu>
    </>
  );
}