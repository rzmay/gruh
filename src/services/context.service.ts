import { useState } from 'react';
import constate from 'constate';

function useFocus() {
  const [focusState, setFocusState] = useState(false);
  return { focusState, setFocusState };
}

const [FocusContextProvider, useFocusContext] = constate(useFocus);

export { FocusContextProvider, useFocusContext };
