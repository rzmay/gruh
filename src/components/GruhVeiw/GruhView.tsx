import React from 'react';
import './GruhView.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import HidingTitle from './HidingTitle/HidingTitle';
import { useFocusContext } from '../../services/context.service';
import GruhCanvas from './GruhCanvas/GruhCanvas';

function GruhView(): React.ReactElement {
  const { focusState } = useFocusContext();

  return (
    <div className="h-100 w-100 p-0">
      <GruhCanvas />
      <HidingTitle
        title="Gruh"
        body="gruha haw ahw haw"
        hidden={focusState}
      />
    </div>
  );
}

export default GruhView;
