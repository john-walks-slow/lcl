import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Preview from './Preview';

const PreviewBox = props => {
  const [animate, setAnimate] = useState(false);
  const [isNormalSize, setNormalSize] = useState(true);
  const frames = useSelector(state => state.present.get('frames'));
  // const duration = useSelector(state => state.present.get('duration'));
  const frameList = frames.get('list');
  const duration = frameList.size * 0.5;
  const activeFrameIndex = frames.get('activeIndex');
  const columns = frames.get('columns');
  const rows = frames.get('rows');
  const { helpOn, callback } = props;
  const animMessage = `${animate ? 'Pause' : 'Play'} the animation`;
  const zoomMessage = `Zoom ${isNormalSize ? '0.5' : '1.5'}`;
  const animTooltip = helpOn ? animMessage : null;
  const zoomTooltip = helpOn ? zoomMessage : null;
  const smPixelSize = 3;
  const bgPixelSize = 6;

  return (
    <div className="preview-box">
      <button
        type="button"
        className={animate ? 'pause' : 'play'}
        onClick={(e) => { setAnimate(!animate); console.log(e); }}
        aria-label="Animation control"
      />
      <div className="preview-box__container">
        <Preview
          frames={frameList}
          columns={columns}
          rows={rows}
          // cellSize={Math.ceil(Math.min(90 / rows, Math.min((window.innerWidth || document.body.clientWidth) * 0.3, 450) / columns))}
          cellSize={7 * 16 / rows}
          duration={duration}
          activeFrameIndex={activeFrameIndex}
          animate={animate}
          animationName="wip-animation"
        />
        <div data-tooltip={animTooltip}>

        </div>
      </div>


    </div>
  );
};

export default PreviewBox;
