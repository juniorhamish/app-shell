import { House as HouseIcon } from '@mui/icons-material';
import { Box, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useGetHouseholdsQuery } from '../../services/households';
import { selectHousehold, selectSelectedHouseholdId } from './householdSlice';

export default function HouseholdSelector() {
  const { t } = useTranslation();
  const id = useId();
  const dispatch = useAppDispatch();
  const selectedHouseholdId = useAppSelector(selectSelectedHouseholdId);
  const { data: households, isSuccess } = useGetHouseholdsQuery();

  useEffect(() => {
    if (isSuccess && households && households.length > 0) {
      const isValid = households.some((h) => h.id === selectedHouseholdId);
      if (!isValid) {
        dispatch(selectHousehold(households[0].id));
      }
    }
  }, [isSuccess, households, selectedHouseholdId, dispatch]);

  if (!isSuccess || !households || households.length === 0) {
    return null;
  }

  const handleChange = (event: SelectChangeEvent) => {
    dispatch(selectHousehold(Number(event.target.value)));
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', ml: 2, mr: 2 }}>
      <HouseIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
      <Select
        id={id}
        inputProps={{ 'aria-label': t('household.label') }}
        name="household"
        onChange={handleChange}
        size="small"
        sx={{
          '.MuiOutlinedInput-notchedOutline': { border: 0 },
          '.MuiSelect-icon': { color: 'white' },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: 0 },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          color: 'white',
        }}
        value={String(selectedHouseholdId ?? '')}
      >
        {households.map((household) => (
          <MenuItem key={household.id} value={household.id}>
            {household.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
