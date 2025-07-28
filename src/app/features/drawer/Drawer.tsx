import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Drawer as MuiDrawer,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Field, Form, Formik } from 'formik';
import { RadioGroup, TextField } from 'formik-mui';
import { md5 } from 'js-md5';
import { object, string } from 'yup';
import { useMemo } from 'react';
import { selectIsDrawerOpen, toggleDrawer } from './drawerSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  selectAvatarSource,
  selectGravatarEmailAddress,
  selectNickname,
  selectPicture,
  selectUserFirstName,
  selectUserInfoStatus,
  selectUserLastName,
} from '../user/userSlice';
import { AvatarImageSource } from '../../../service/types';

const emailAddressToGravatarUrl = (emailAddress: string) => {
  const hash = md5(emailAddress.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}`;
};

export default function Drawer() {
  const dispatch = useAppDispatch();
  const drawerOpen = useAppSelector(selectIsDrawerOpen);
  const firstName = useAppSelector(selectUserFirstName);
  const lastName = useAppSelector(selectUserLastName);
  const nickname = useAppSelector(selectNickname);
  const picture = useAppSelector(selectPicture);
  const gravatarEmailAddress = useAppSelector(selectGravatarEmailAddress);
  const avatarImageSource = useAppSelector(selectAvatarSource);
  const userInfoStatus = useAppSelector(selectUserInfoStatus);
  const userInfoLoading = userInfoStatus === 'loading';
  const { t } = useTranslation();
  const userInfoSchema = useMemo(
    () =>
      object({
        firstName: string().required(),
        lastName: string().required(),
        nickname: string().required(),
        gravatarEmailAddress: string()
          .email()
          .when('avatarImageSource', { is: AvatarImageSource.GRAVATAR, then: (schema) => schema.required() }),
        picture: string()
          .url()
          .when('avatarImageSource', { is: AvatarImageSource.MANUAL, then: (schema) => schema.required() }),
        avatarImageSource: string().required(),
      }),
    [],
  );
  return (
    <MuiDrawer
      anchor="right"
      open={drawerOpen}
      onClose={() => dispatch(toggleDrawer())}
      slotProps={{ paper: { sx: { width: '384px' } } }}
    >
      <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
        <Backdrop
          open={userInfoLoading}
          aria-hidden={!userInfoLoading}
          sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1, position: 'absolute' })}
        >
          <CircularProgress color="inherit" aria-label={t('user-info-loading')} />
        </Backdrop>
        {userInfoStatus === 'failed' && <Box>{t('user-info-failed-to-load')}</Box>}
        {userInfoStatus === 'successful' && (
          <Formik
            initialValues={{ firstName, lastName, nickname, gravatarEmailAddress, picture, avatarImageSource }}
            validationSchema={userInfoSchema}
            onSubmit={(_values, { setSubmitting }) => {
              setSubmitting(false);
            }}
          >
            {({ submitForm, isSubmitting, values, isValid, dirty, handleReset }) => (
              <Form>
                <Stack sx={{ padding: '24px', gap: '24px' }}>
                  <Stack sx={{ gap: '5px' }}>
                    <Typography variant="h2" sx={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                      {t('profile.heading')}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: '300' }}>{t('profile.sub-heading')}</Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar
                      src={
                        values.avatarImageSource === AvatarImageSource.GRAVATAR
                          ? emailAddressToGravatarUrl(values.gravatarEmailAddress ?? '')
                          : values.picture
                      }
                      sx={{ width: '64px', height: '64px' }}
                    />
                  </Box>
                  <Field
                    component={TextField}
                    name="firstName"
                    label={t('profile.first-name-text-field')}
                    variant="outlined"
                  />
                  <Field
                    component={TextField}
                    name="lastName"
                    label={t('profile.last-name-text-field')}
                    variant="outlined"
                  />
                  <Field
                    component={TextField}
                    name="nickname"
                    label={t('profile.nickname-text-field')}
                    variant="outlined"
                  />
                  <Field component={RadioGroup} name="avatarImageSource">
                    <FormControlLabel
                      value={AvatarImageSource.MANUAL}
                      control={<Radio disabled={isSubmitting} />}
                      label={t('profile.avatar-option.avatar')}
                      disabled={isSubmitting}
                    />
                    <FormControlLabel
                      value={AvatarImageSource.GRAVATAR}
                      control={<Radio disabled={isSubmitting} />}
                      label={t('profile.avatar-option.gravatar')}
                      disabled={isSubmitting}
                    />
                  </Field>
                  {values.avatarImageSource === AvatarImageSource.MANUAL && (
                    <Field
                      component={TextField}
                      name="picture"
                      label={t('profile.avatar-option.avatar-url')}
                      variant="outlined"
                    />
                  )}
                  {values.avatarImageSource === AvatarImageSource.GRAVATAR && (
                    <Field
                      component={TextField}
                      name="gravatarEmailAddress"
                      type="email"
                      label={t('profile.avatar-option.gravatar-email-address')}
                      variant="outlined"
                    />
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <Button variant="outlined" onClick={handleReset} disabled={isSubmitting || !dirty}>
                      {t('profile.cancel-edits')}
                    </Button>
                    <Button variant="contained" onClick={submitForm} disabled={!isValid || isSubmitting || !dirty}>
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
  );
}
