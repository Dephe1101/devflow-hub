import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@repo/constants';

export default function SettingsPage(): React.ReactElement {
  redirect(APP_ROUTES.SETTINGS_AGENT);
}
