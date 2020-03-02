import React from 'react';
import './HidingTitle.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { ChevronRight } from 'react-bootstrap-icons';
import { useFocusContext } from '../../../services/context.service';

function HidingTitle({ title, body, hidden = false }): React.ReactElement {
  const { focusState, setFocusState } = useFocusContext();
  console.log(`HT: ${focusState}`);

  function hideMenu() {
    setFocusState(true);
  }

  function showMenu() {
    setFocusState(false);
  }

  return (
    <div className="p-0 m-0 w-100 h-100 hiding-title-container">
      <div className={`p-0 w-100 h-100 p-5 float-left hiding-title ${hidden ? 'hidden' : undefined}`}>
        <div className="d-flex align-items-center h-100">
          <div className="p-2">
            <div className="p-2">
              <h1 className="display-1">{title}</h1>
            </div>
            <div className="p-3">
              <h4 className="lead text-light">{body}</h4>
            </div>
            <div className="p-3">
              <Button
                className="d-flex align-items-center justify-content-center"
                variant="danger"
                onClick={hideMenu}
                disabled={focusState}
              >
                Experience Him
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center h-100">
        <div className="p-2">
          <ChevronRight size={96} className={`chevron ${hidden ? undefined : 'hidden'}`} onClick={showMenu} />
        </div>
      </div>
    </div>
  );
}

export default HidingTitle;
