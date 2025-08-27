import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Drawer as MuiDrawer,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { fieldToRadioGroup, type RadioGroupProps, TextField } from 'formik-mui';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { object, string } from 'yup';
import { AvatarImageSource } from '../../../service/types';
import emailAddressToGravatarUrl from '../../../util/utils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '../../services/user-info';
import { selectIsAuthenticated } from '../auth/authSlice';
import { selectIsDrawerOpen, toggleDrawer } from './drawerSlice';

function AvatarRadioGroup(props: RadioGroupProps) {
  const { t } = useTranslation();
  return <RadioGroup {...fieldToRadioGroup(props)} aria-label={t('profile.avatar-option.avatar-radio-group')} />;
}

export default function Drawer() {
  const { t } = useTranslation();
  const drawerTitleId = useId();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { isLoading, isError, isSuccess, data } = useGetUserInfoQuery(undefined, { skip: !isAuthenticated });
  const { firstName, lastName, nickname, picture, gravatarEmailAddress, avatarImageSource } = data ?? {};
  const [updateUserInfo] = useUpdateUserInfoMutation();
  const drawerOpen = useAppSelector(selectIsDrawerOpen);
  const [updateResult, setUpdateResult] = useState<'success' | 'error' | undefined>();
  const userInfoSchema = useMemo(
    () =>
      object({
        avatarImageSource: string().required(),
        firstName: string().required(),
        gravatarEmailAddress: string()
          .email()
          .when('avatarImageSource', {
            is: AvatarImageSource.GRAVATAR,
            // biome-ignore lint/suspicious/noThenProperty: This is a yup validation
            then: (schema) => schema.required(),
          }),
        lastName: string().required(),
        nickname: string().required(),
        picture: string()
          .url()
          .when('avatarImageSource', {
            is: AvatarImageSource.MANUAL,
            // biome-ignore lint/suspicious/noThenProperty: This is a yup validation
            then: (schema) => schema.required(),
          }),
      }),
    [],
  );
  return (
    <>
      <MuiDrawer
        anchor="right"
        aria-labelledby={drawerTitleId}
        component="aside"
        onClose={() => dispatch(toggleDrawer())}
        open={drawerOpen}
        role="dialog"
        slotProps={{ paper: { sx: { width: '384px' } } }}
      >
        <Box sx={{ height: '100%', position: 'relative', width: '100%' }}>
          <Backdrop
            aria-hidden={!isLoading}
            open={isLoading}
            sx={(theme) => ({
              position: 'absolute',
              zIndex: theme.zIndex.drawer + 1,
            })}
          >
            <CircularProgress aria-label={t('user-info-loading')} color="inherit" />
          </Backdrop>
          {isError && <Box>{t('user-info-failed-to-load')}</Box>}
          {isSuccess && (
            <Formik
              enableReinitialize
              initialValues={{
                avatarImageSource,
                firstName,
                gravatarEmailAddress,
                lastName,
                nickname,
                picture,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await updateUserInfo(values);
                if (result.error) {
                  setUpdateResult('error');
                } else {
                  setUpdateResult('success');
                }
                setSubmitting(false);
              }}
              validationSchema={userInfoSchema}
            >
              {({ submitForm, isSubmitting, values, isValid, dirty, handleReset }) => (
                <Form aria-label={t('profile.form-label')}>
                  <Stack sx={{ gap: '24px', padding: '24px' }}>
                    <Stack sx={{ gap: '5px' }}>
                      <Typography id={drawerTitleId} sx={{ fontSize: '1.125rem', fontWeight: 'bold' }} variant="h2">
                        {t('profile.heading')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: '300' }}>
                        {t('profile.sub-heading')}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Avatar
                        alt={t('avatar-alt-text')}
                        src={
                          values.avatarImageSource === AvatarImageSource.GRAVATAR
                            ? emailAddressToGravatarUrl(values.gravatarEmailAddress ?? '')
                            : values.picture
                        }
                        sx={{ height: '64px', width: '64px' }}
                      />
                    </Box>
                    <Field
                      component={TextField}
                      label={t('profile.first-name-text-field')}
                      name="firstName"
                      variant="outlined"
                    />
                    <Field
                      component={TextField}
                      label={t('profile.last-name-text-field')}
                      name="lastName"
                      variant="outlined"
                    />
                    <Field
                      component={TextField}
                      label={t('profile.nickname-text-field')}
                      name="nickname"
                      variant="outlined"
                    />
                    <Field component={AvatarRadioGroup} name="avatarImageSource">
                      <FormControlLabel
                        control={<Radio disabled={isSubmitting} />}
                        disabled={isSubmitting}
                        label={t('profile.avatar-option.avatar')}
                        value={AvatarImageSource.MANUAL}
                      />
                      <FormControlLabel
                        control={<Radio disabled={isSubmitting} />}
                        disabled={isSubmitting}
                        label={t('profile.avatar-option.gravatar')}
                        value={AvatarImageSource.GRAVATAR}
                      />
                    </Field>
                    {values.avatarImageSource === AvatarImageSource.MANUAL && (
                      <Field
                        component={TextField}
                        label={t('profile.avatar-option.avatar-url')}
                        name="picture"
                        variant="outlined"
                      />
                    )}
                    {values.avatarImageSource === AvatarImageSource.GRAVATAR && (
                      <Field
                        component={TextField}
                        label={t('profile.avatar-option.gravatar-email-address')}
                        name="gravatarEmailAddress"
                        type="email"
                        variant="outlined"
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '16px',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button disabled={isSubmitting || !dirty} onClick={handleReset} variant="outlined">
                        {t('profile.cancel-edits')}
                      </Button>
                      <Button disabled={!isValid || isSubmitting || !dirty} onClick={submitForm} variant="contained">
                        {t('profile.save-edits')}
                      </Button>
                    </Box>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      </MuiDrawer>
      <Snackbar
        autoHideDuration={6000}
        onClose={(_event, closeReason) => {
          if (closeReason === 'clickaway') {
            return;
          }
          setUpdateResult(undefined);
        }}
        open={!!updateResult}
      >
        <Alert severity={updateResult} variant="filled">
          {updateResult && t(`profile.update-${updateResult}-message`)}
        </Alert>
      </Snackbar>
    </>
  );
}
