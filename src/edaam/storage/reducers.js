import produce from 'immer';

import events from './events';
import { validators } from './validation';

const initialState = {};

const reduce = produce((draft, action) => {
  switch (action.type) {
    case events.CREATE_SUCCESS:
      draft[action.payload.id] = action.payload;
      break;

    case events.UPDATE:
      draft[action.payload.id][action.payload.property] = action.payload.value;
      const error = validators[action.payload.property](action.payload.value);
      if (error) {
        draft[action.payload.id]._meta.errors[action.payload.property] = error;
      } else {
        delete draft[action.payload.id]._meta.errors[action.payload.property];
      }
      break;

    case events.DELETE:
      delete draft[action.payload];
      break;

    case events.UPDATE_POSITION:
      const storage = draft[action.payload.id];
      storage._meta.position.x = action.payload.x;
      storage._meta.position.y = action.payload.y;
  }
}, initialState);

export default reduce;
