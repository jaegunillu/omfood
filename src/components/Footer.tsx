import React from 'react';
import styled from 'styled-components';

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

export default function Footer() {
  return (
    <FooterContainer>
      <LeftBlock>
        <BrandTitle>OUR BRAND</BrandTitle>
        <BrandList>
          <BrandLink href="https://ovenmaru.com/" target="_blank" rel="noopener noreferrer">Ovenmaru</BrandLink>
          <BrandLink href="http://www.odduk.net/" target="_blank" rel="noopener noreferrer">Odduk</BrandLink>
        </BrandList>
        <SNSList>
          <a href="https://www.instagram.com/ovenmaru_official/" target="_blank" rel="noopener noreferrer">
            <SNSIcon src={process.env.PUBLIC_URL + '/footer-icons/instagram.png'} alt="instagram" />
          </a>
          <a href="https://www.facebook.com/ovenmaruofficial" target="_blank" rel="noopener noreferrer">
            <SNSIcon src={process.env.PUBLIC_URL + '/footer-icons/facebook.png'} alt="facebook" />
          </a>
          <a href="https://blog.naver.com/ovenmaru" target="_blank" rel="noopener noreferrer">
            <SNSIcon src={process.env.PUBLIC_URL + '/footer-icons/naverblog.png'} alt="naver blog" />
          </a>
          <a href="https://www.youtube.com/channel/UCA6MTVlrRI8jfhdKJp0H3bQ" target="_blank" rel="noopener noreferrer">
            <SNSIcon src={process.env.PUBLIC_URL + '/footer-icons/youtube.png'} alt="youtube" />
          </a>
        </SNSList>
      </LeftBlock>
      <RightBlock>
        <Copyright>
          COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED.
        </Copyright>
      </RightBlock>
    </FooterContainer>
  );
} 