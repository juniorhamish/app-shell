import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = './src';

const MUI_MATERIAL_PACKAGES = new Set([
  'Accordion',
  'AccordionActions',
  'AccordionDetails',
  'AccordionSummary',
  'Alert',
  'AlertTitle',
  'AppBar',
  'Autocomplete',
  'Avatar',
  'AvatarGroup',
  'Backdrop',
  'Badge',
  'BottomNavigation',
  'BottomNavigationAction',
  'Box',
  'Breadcrumbs',
  'Button',
  'ButtonBase',
  'ButtonGroup',
  'Card',
  'CardActionArea',
  'CardActions',
  'CardContent',
  'CardHeader',
  'CardMedia',
  'Checkbox',
  'Chip',
  'CircularProgress',
  'ClickAwayListener',
  'Collapse',
  'Container',
  'CssBaseline',
  'Dialog',
  'DialogActions',
  'DialogContent',
  'DialogContentText',
  'DialogTitle',
  'Divider',
  'Drawer',
  'Fab',
  'Fade',
  'FilledInput',
  'FormControl',
  'FormControlLabel',
  'FormGroup',
  'FormHelperText',
  'FormLabel',
  'GlobalStyles',
  'Grid',
  'Grid2',
  'Grow',
  'Hidden',
  'Icon',
  'IconButton',
  'ImageList',
  'ImageListItem',
  'ImageListItemBar',
  'Input',
  'InputAdornment',
  'InputBase',
  'InputLabel',
  'LinearProgress',
  'Link',
  'List',
  'ListItem',
  'ListItemAvatar',
  'ListItemButton',
  'ListItemIcon',
  'ListItemSecondaryAction',
  'ListItemText',
  'ListSubheader',
  'Menu',
  'MenuItem',
  'MenuList',
  'MobileStepper',
  'Modal',
  'NativeSelect',
  'OutlinedInput',
  'Pagination',
  'PaginationItem',
  'Paper',
  'Popover',
  'Popper',
  'Portal',
  'Radio',
  'RadioGroup',
  'Rating',
  'ScopedCssBaseline',
  'Select',
  'Skeleton',
  'Slide',
  'Slider',
  'Snackbar',
  'SnackbarContent',
  'Stack',
  'Step',
  'StepButton',
  'StepConnector',
  'StepContent',
  'StepIcon',
  'StepLabel',
  'Stepper',
  'SvgIcon',
  'SwipeableDrawer',
  'Switch',
  'Tab',
  'TabScrollButton',
  'Table',
  'TableBody',
  'TableCell',
  'TableContainer',
  'TableFooter',
  'TableHead',
  'TablePagination',
  'TableRow',
  'TableSortLabel',
  'Tabs',
  'TextField',
  'TextareaAutosize',
  'Toolbar',
  'Tooltip',
  'Typography',
  'Zoom',
]);

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Transform @mui/material barrel imports
  // Matches: import { A, B as C } from '@mui/material';
  const muiMaterialRegex = /import\s+\{([^}]+)}\s+from\s+'@mui\/material';?/g;
  content = content.replaceAll(muiMaterialRegex, (match, importList) => {
    const imports = importList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const newImports = [];
    const remainingNamedImports = [];

    for (const imp of imports) {
      const parts = imp.split(/\s+as\s+/);
      const name = parts[0];
      const alias = parts[1] || name;

      if (MUI_MATERIAL_PACKAGES.has(name)) {
        newImports.push(`import ${alias} from '@mui/material/${name}';`);
      } else {
        remainingNamedImports.push(imp);
      }
    }

    if (newImports.length > 0) {
      changed = true;
      let result = newImports.join('\n');
      if (remainingNamedImports.length > 0) {
        result += `\nimport { ${remainingNamedImports.join(', ')} } from '@mui/material';`;
      }
      return result;
    }
    return match;
  });

  // Transform @mui/icons-material barrel imports
  const muiIconsRegex = /import\s+\{([^}]+)}\s+from\s+'@mui\/icons-material';?/g;
  content = content.replaceAll(muiIconsRegex, (match, importList) => {
    const imports = importList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const newImports = [];

    for (const imp of imports) {
      const parts = imp.split(/\s+as\s+/);
      const name = parts[0];
      const alias = parts[1] || name;
      newImports.push(`import ${alias} from '@mui/icons-material/${name}';`);
    }

    if (newImports.length > 0) {
      changed = true;
      return newImports.join('\n');
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Transformed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        walkDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      transformFile(fullPath);
    }
  }
}

walkDir(SRC_DIR);
