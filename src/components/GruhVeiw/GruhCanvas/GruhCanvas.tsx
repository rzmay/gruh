import React, {useDebugValue, useEffect, useState} from 'react';
import './GruhCanvas.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import GruhScene from './scripts/GruhScene';

import { CharacterEnum } from '../../../models/character.enum';
import { useFocusContext } from '../../../services/context.service';

function GruhCanvas({ character = CharacterEnum.Gruh }): React.ReactElement {
  const [didMount, setDidMount] = useState(false);
  const [modelDidLoad, setModelDidLoad] = useState(false);
  const [gruhScene, setGruhScene] = useState({});
  const { focusState } = useFocusContext();

  const divRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    // Ensure that load only fires once
    if (!didMount) {
      setDidMount(true);

      const scene = new GruhScene(divRef);
      scene.gruh.onLoaded = () => {
        setModelDidLoad(true);
      };

      scene.start();
      setGruhScene(scene);
    }
  }, []);

  useEffect(() => {
    if (gruhScene !== undefined) {
      const scene = gruhScene as GruhScene;
      if (scene !== undefined && scene.camera !== undefined) scene.camera.mouseControl = focusState;
    }
  }, [focusState]);

  return (
    <div
      className={`m-0 p-0 w-100 h-100 gruh-canvas ${focusState ? 'focus' : undefined} ${modelDidLoad ? 'loaded' : undefined}`}
      ref={divRef}
    >
      Loading...
    </div>
  );
}

export default GruhCanvas;
