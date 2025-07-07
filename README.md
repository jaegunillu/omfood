# OM FOOD - React + TypeScript + Firebase

OM FOOD의 공식 웹사이트입니다. React + TypeScript + Firebase를 기반으로 구축되었습니다.

## 주요 기능

### 🏠 메인 페이지
- 동적 헤더 메뉴 관리
- 메인 비주얼 섹션 (비디오/이미지)
- 슬로건 섹션
- 스토어 정보 (지도 연동)
- 브랜드 소개

### 🏷️ 브랜드 페이지
- 브랜드별 상세 정보
- 이미지/비디오 콘텐츠
- 관리자에서 콘텐츠 관리 가능

### 📦 Product 페이지 (신규 추가)
- 카테고리별 제품 목록
- 제품 상세 모달
- Allergens, Ingredients, Nutrition 정보
- 반응형 디자인

### 🔧 관리자 페이지
- 로그인/로그아웃
- 메뉴명 관리
- 메인 페이지 콘텐츠 관리
- 브랜드 페이지 관리
- Product 페이지 관리 (신규 추가)
  - 카테고리 관리 (추가/수정/삭제/순서 변경)
  - 제품 관리 (추가/수정/삭제/이미지 업로드)
  - 페이지 슬로건 관리

## 기술 스택

- **Frontend**: React 18, TypeScript, Styled Components
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Routing**: React Router
- **Editor**: React Quill
- **Build Tool**: Create React App

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

## Firebase 설정

1. Firebase 프로젝트 생성
2. Firestore Database 설정
3. Storage 설정
4. Authentication 설정
5. `src/firebase.ts` 파일에 설정 정보 입력

## 초기 데이터 설정

Product 페이지의 초기 데이터를 설정하려면:

```javascript
import { initializeProductData } from './src/utils/initProductData';

// 브라우저 콘솔에서 실행
await initializeProductData();
```

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
