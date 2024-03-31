export interface MondayEvent {
  'type': MondayEventType;
  'data': {
    'app_id': number;
    'user_id': number;
    'user_email': string;
    'user_name': string;
    'user_cluster': string;
    'account_tier': string;
    'account_name': string;
    'account_slug': string;
    'account_max_users': number;
    'account_id': number;
    'version_data': string;
    'timestamp': string;
    'subscription': string;
    'user_country': string;
  };
}

export type MondayEventType =
  | 'install'
  | 'uninstall'
  | 'app_subscription_created'
  | 'app_subscription_changed'
  | 'app_subscription_cancelled_by_user'
  | 'app_subscription_renewed'
  | 'app_trial_subscription_started'
  | 'app_trial_subscription_ended'
  | 'app_subscription_cancelled'
  | 'app_subscription_cancellation_revoked_by_user'
  | 'app_subscription_renewal_attempt_failed'
  | 'app_subscription_renewal_failed'
