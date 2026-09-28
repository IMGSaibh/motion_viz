import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

type Props = {
  files_for_training: string[];
  is_training_pending: boolean;
  files_for_training_on_open: () => void;
  start_training_with_selected_files: (selectedFiles: string[]) => void;
};

/**
 * Starts the training workflow with the selected motionstack files.
 */
export function WidgetMotionTraining(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    setSelectedFiles((current) => current.filter((file) => props.files_for_training.includes(file)));
  }, [props.files_for_training]);

  function openDialog() {
    props.files_for_training_on_open();
    setIsOpen(true);
  }

  function toggleFile(file: string) {
    setSelectedFiles((current) =>
      current.includes(file) ? current.filter((selected) => selected !== file) : [...current, file],
    );
  }

  function startTraining() {
    props.start_training_with_selected_files(selectedFiles);
  }

  const allFilesSelected =
    props.files_for_training.length > 0 && selectedFiles.length === props.files_for_training.length;

  function toggleAllFiles() {
    setSelectedFiles(allFilesSelected ? [] : props.files_for_training);
  }

  return (
    <>
      <Button onClick={openDialog}>Select Files for Training</Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ py: 1.5 }}>Select NPY Files for Training</DialogTitle>
        <DialogContent dividers sx={{ py: 1 }}>
          {props.files_for_training.length === 0 ? (
            <Typography color="text.secondary">No NPY files available.</Typography>
          ) : (
            <Stack spacing={0.5}>
              <Button
                size="small"
                onClick={toggleAllFiles}
                disabled={props.is_training_pending}
                sx={{ alignSelf: 'flex-start' }}
              >
                {allFilesSelected ? 'Auswahl aufheben' : 'Alles auswählen'}
              </Button>
              <List dense disablePadding>
                {props.files_for_training.map((file) => {
                  const isSelected = selectedFiles.includes(file);
                  return (
                    <ListItemButton
                      key={file}
                      component="li"
                      dense
                      selected={isSelected}
                      disabled={props.is_training_pending}
                      onClick={() => toggleFile(file)}
                      role="checkbox"
                      aria-checked={isSelected}
                      sx={{ py: 0 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          size="small"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => toggleFile(file)}
                          inputProps={{ 'aria-labelledby': `training-file-${file}` }}
                        />
                      </ListItemIcon>
                      <ListItemText id={`training-file-${file}`} primary={file} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)} disabled={props.is_training_pending}>
            Close
          </Button>
          <Button
            onClick={startTraining}
            variant="contained"
            disabled={props.is_training_pending || selectedFiles.length === 0}
          >
            Start Training
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
