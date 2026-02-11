import { Condition } from '@/backend';

export function getConditionLabel(condition: Condition): string {
  return condition === Condition.new_ ? 'New' : 'Used';
}

export function getConditionBadgeVariant(condition: Condition): 'default' | 'secondary' {
  return condition === Condition.new_ ? 'default' : 'secondary';
}
