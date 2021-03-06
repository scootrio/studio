import { Trigger } from '~types';

export function createTriggerConnection(meta = {}) {
  return {
    meta: {
      // We use the meta ID generated by jsPlumb
      ...meta,
      type: Trigger,
      name: 'Trigger'
    },
    config: {
      // We don't immediately grab the source and target. We will grab it when we pack the configuration to send
      // to the deployment server. This helps us avoid state inconsitencies and complext update logic when resources
      // are updated after connections have been made.
    },
    validation: {
      isValid: true
    }
  };
}
