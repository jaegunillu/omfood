import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
`;

const VideoBg = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
`;

const MainTextOverlay = styled.div`
  position: absolute;
  top: -200px;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  pointer-events: none;
`;

const MainText = styled.h1`
  color: #fff;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  text-shadow: 0 4px 24px rgba(0,0,0,0.35);
  letter-spacing: 0.04em;
  text-align: center;
  user-select: text;
  pointer-events: auto;
  margin: 0;
`;

const SubText = styled.p`
  margin-top: 12px;
  color: #fff;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 400;
  text-shadow: 0 2px 12px rgba(0,0,0,0.25);
  letter-spacing: 0.01em;
  text-align: center;
  opacity: 0.92;
  user-select: text;
  pointer-events: auto;
  @media (max-width: 700px) {
    padding-left: 10px;
    padding-right: 10px;
  }
`;

const VideoSection: React.FC = () => {
  const [main, setMain] = useState({
    mediaType: 'video',
    mediaUrl: process.env.PUBLIC_URL + '/main1.mp4',
    mainText: 'Global Taste, Local Touch',
    subText: 'From sauces to stores, we blend Korean flavor with local culture for every market we serve.'
  });

  useEffect(() => {
    const docRef = doc(db, 'mainSection', 'content');
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setMain((prev) => ({ ...prev, ...doc.data() }));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <VideoContainer>
      {main.mediaType === 'video' ? (
        <VideoBg autoPlay muted loop playsInline key={main.mediaUrl}>
          <source src={main.mediaUrl} type="video/mp4" />
        </VideoBg>
      ) : (
        <VideoBg as="img" src={main.mediaUrl} alt="main" />
      )}
      <MainTextOverlay>
        <MainText dangerouslySetInnerHTML={{ __html: main.mainText }} />
        <SubText dangerouslySetInnerHTML={{ __html: main.subText }} />
      </MainTextOverlay>
    </VideoContainer>
  );
};

export default VideoSection; 