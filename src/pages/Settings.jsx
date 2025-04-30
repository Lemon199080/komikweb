import { useState, useCallback } from 'react';
import styled from 'styled-components';

const Settings = ({ onClose }) => {
  const [quality, setQuality] = useState('HQ');
  const [scrollSpeed, setScrollSpeed] = useState(1);

  // Memoized save handler
  const handleSave = useCallback(() => {
    // Save settings to localStorage or API
    localStorage.setItem('mangaSettings', JSON.stringify({ quality, scrollSpeed }));
    onClose();
  }, [quality, scrollSpeed, onClose]);

  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Title>Settings</Title>
        <CloseButton onClick={onClose} aria-label="Close settings">
          ×
        </CloseButton>
        <Section>
          <Label htmlFor="quality">Page Quality</Label>
          <ButtonGroup>
            <QualityButton
              active={quality === 'HQ'}
              onClick={() => setQuality('HQ')}
              aria-pressed={quality === 'HQ'}
            >
              Full Quality
            </QualityButton>
            <QualityButton
              active={quality === 'LQ'}
              onClick={() => setQuality('LQ')}
              aria-pressed={quality === 'LQ'}
            >
              Data Saving
            </QualityButton>
          </ButtonGroup>
        </Section>
        <Section>
          <Label htmlFor="scrollSpeed">Autoscroll Speed</Label>
          <Slider
            id="scrollSpeed"
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
            aria-valuemin={0.5}
            aria-valuemax={1.5}
            aria-valuenow={scrollSpeed}
          />
          <SpeedDisplay>{scrollSpeed.toFixed(2)}x</SpeedDisplay>
        </Section>
        <Actions>
          <SaveButton onClick={handleSave}>Save</SaveButton>
          <LaterButton onClick={onClose}>Cancel</LaterButton>
        </Actions>
      </Container>
    </Overlay>
  );
};

export default Settings;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const Container = styled.div`
  background: #ffffff;
  padding: 24px;
  width: min(90%, 320px);
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const Title = styled.h2`
  text-align: center;
  margin: 0 0 16px;
  font-size: 1.5rem;
  color: #1a1a1a;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 1.25rem;
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #ff4d4d;
  }
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const QualityButton = styled.button`
  flex: 1;
  background: ${({ active }) => (active ? '#2563eb' : '#e5e7eb')};
  color: ${({ active }) => (active ? '#ffffff' : '#374151')};
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  &:hover {
    background: ${({ active }) => (active ? '#1e40af' : '#d1d5db')};
  }
  &:focus {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2563eb;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2563eb;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const SpeedDisplay = styled.span`
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: #555;
  margin-top: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const SaveButton = styled.button`
  flex: 1;
  background: #16a34a;
  color: #ffffff;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
  &:hover {
    background: #15803d;
  }
`;

const LaterButton = styled.button`
  flex: 1;
  background: #e5e7eb;
  color: #374151;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
  &:hover {
    background: #d1d5db;
  }
`;