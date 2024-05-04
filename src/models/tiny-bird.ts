export type DataSource = 'link_events';

export type LinkEvent =
  | 'link_hit'
  | 'link_view'
  | 'link_not_found'
  | 'link_expired'
  | 'link_access_check'
  | 'link_access_granted'
  | 'link_access_denied';
