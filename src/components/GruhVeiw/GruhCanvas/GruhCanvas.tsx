import React from 'react';
import './GruhCanvas.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CharacterEnum } from '../../../models/character.enum';

function GruhCanvas({ character = CharacterEnum.Gruh }): React.ReactElement {
  return (
    <div className="m-0 p-0 w-100 h-100 gruh-canvas">
      fuck!
    </div>
  );
}

export default GruhCanvas;
