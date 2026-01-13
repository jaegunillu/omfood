import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface FooterConfig {
  links: { name: string; url: string }[];
  sns: { icon: string; url: string }[];
  copyright: string;
}

const FooterContainer = styled.footer`
  width: 100%;
  background: #222;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 48px 15vw 32px 15vw;
  box-sizing: border-box;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 32px;
    padding: 32px 5vw 20px 5vw;
    align-items: flex-start;
  }
`;

const LeftBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const BrandTitle = styled.div`
  font-size: 1rem;
  font-weight: 400;
  color: #aaa;
  margin-bottom: 2px;
  letter-spacing: 0.08em;
`;

const BrandList = styled.div`
  display: flex;
  gap: 24px;
`;

const BrandLink = styled.a`
  color: #fff;
  font-size: 1.18rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color 0.2s;
  position: relative;
  &:hover {
    color: #ffd600;
  }
  &::after {
    content: '';
    display: block;
    margin: 4px auto 0 auto;
    width: 0%;
    height: 1px;
    background: #ffd600;
    transition: width 0.3s;
  }
  &:hover::after {
    width: 100%;
  }
`;

const SNSList = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 8px;
`;

const SNSIcon = styled.img`
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  transition: filter 0.2s, transform 0.2s;
  &:hover {
    filter: brightness(1.5) invert(0.2);
    transform: scale(1.18);
  }
`;

const RightBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  @media (max-width: 900px) {
    align-items: flex-start;
    margin-top: 12px;
  }
`;

const Copyright = styled.div`
  font-size: 0.98rem;
  color: #aaa;
  letter-spacing: 0.01em;
`;

export default function Footer({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'footer_config', 'main');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FooterConfig;
        setFooterConfig(data);
      } else {
        setFooterConfig(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <FooterContainer>
        <LeftBlock>
          <BrandTitle>OUR BRAND</BrandTitle>
          <BrandList>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>로딩 중...</div>
          </BrandList>
        </LeftBlock>
        <RightBlock>
          <Copyright>COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED.</Copyright>
        </RightBlock>
      </FooterContainer>
    );
  }

  return (
    <FooterContainer>
      <LeftBlock>
        <BrandTitle>OUR BRAND</BrandTitle>
        <BrandList>
          {footerConfig?.links && footerConfig.links.length > 0 ? (
            footerConfig.links.map((link, index) => (
              <BrandLink 
                key={index} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {link.name}
              </BrandLink>
            ))
          ) : (
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>등록된 브랜드가 없습니다.</div>
          )}
        </BrandList>
        <SNSList>
          {footerConfig?.sns && footerConfig.sns.length > 0 ? (
            footerConfig.sns.map((sns, index) => (
              <a 
                key={index} 
                href={sns.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <SNSIcon src={sns.icon} alt={`sns-${index}`} />
              </a>
            ))
          ) : null}
        </SNSList>
      </LeftBlock>
      <RightBlock>
        <Copyright>
          {footerConfig?.copyright || 'COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED.'}
        </Copyright>
      </RightBlock>
    </FooterContainer>
  );
} 