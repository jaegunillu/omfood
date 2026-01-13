import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function initFooterConfig() {
  const ref = doc(db, 'footer_config', 'main');
  await setDoc(ref, {
    links: [
      { name: 'Ovenmaru', url: 'https://ovenmaru.com/' },
      { name: 'Odduk', url: 'http://www.odduk.net/' }
    ],
    sns: [
      { icon: 'instagram.png', url: 'https://www.instagram.com/ovenmaru_official/' },
      { icon: 'facebook.png', url: 'https://www.facebook.com/ovenmaruofficial' },
      { icon: 'naverblog.png', url: 'https://blog.naver.com/ovenmaru' },
      { icon: 'youtube.png', url: 'https://www.youtube.com/channel/UCA6MTVlrRI8jfhdKJp0H3bQ' }
    ],
    copyright: 'COPYRIGHT(C) OMFOOD ALL RIGHT RESERVED.'
  });
  console.log('footer_config/main 문서가 Firestore에 생성되었습니다.');
}

// 단독 실행용
if (require.main === module) {
  initFooterConfig();
} 