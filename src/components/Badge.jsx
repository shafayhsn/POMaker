import { classNames } from '../lib/utils'

export default function Badge({ children, tone = 'default' }) {
  return <span className={classNames('badge', `badge-${tone}`)}>{children}</span>
}
