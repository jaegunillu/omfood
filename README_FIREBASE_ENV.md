# Firebase 환경 분리 가이드

## 개요
개발 환경과 운영 환경의 Firebase 데이터베이스를 분리하여 개발 시 운영 데이터에 영향을 주지 않도록 설정했습니다.

## 환경별 실행 방법

### 1. 개발 환경 (로컬 개발용)
```bash
npm run start:dev
```
- 개발용 Firebase 프로젝트 (`omfood-dev`) 사용
- 로컬에서만 접근 가능
- 개발 중 데이터 변경이 운영 환경에 영향 없음

### 2. Emulator 환경 (완전 격리된 로컬 개발)
```bash
# 터미널 1: Emulator 시작
npm run emulator

# 터미널 2: React 앱 시작
npm run start:emulator
```
- 완전히 로컬에서만 동작하는 Firebase 환경
- 운영 데이터와 완전히 격리
- 개발 중 데이터 변경이 어떤 환경에도 영향 없음

### 3. 운영 환경 (배포용)
```bash
npm run start:prod
```
- 운영용 Firebase 프로젝트 (`omfood-a621d`) 사용
- 실제 사용자들이 접근하는 환경

### 4. 기본 실행 (기존 방식)
```bash
npm start
```
- NODE_ENV에 따라 자동으로 환경 결정
- development: 개발 환경
- production: 운영 환경

## Firebase 프로젝트 설정

### 1. 개발용 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. 프로젝트 ID: `omfood-dev`
3. Firestore Database 생성
4. Storage 생성
5. Authentication 설정

### 2. 환경변수 설정 (선택사항)
프로젝트 루트에 `.env.development` 파일 생성:

```env
# 개발 환경 Firebase 설정
REACT_APP_FIREBASE_DEV_API_KEY=your_dev_api_key
REACT_APP_FIREBASE_DEV_AUTH_DOMAIN=omfood-dev.firebaseapp.com
REACT_APP_FIREBASE_DEV_PROJECT_ID=omfood-dev
REACT_APP_FIREBASE_DEV_STORAGE_BUCKET=omfood-dev.appspot.com
REACT_APP_FIREBASE_DEV_MESSAGING_SENDER_ID=your_dev_sender_id
REACT_APP_FIREBASE_DEV_APP_ID=your_dev_app_id
REACT_APP_FIREBASE_DEV_MEASUREMENT_ID=your_dev_measurement_id

# 운영 환경 Firebase 설정
REACT_APP_FIREBASE_PROD_API_KEY=your_prod_api_key
REACT_APP_FIREBASE_PROD_AUTH_DOMAIN=omfood-a621d.firebaseapp.com
REACT_APP_FIREBASE_PROD_PROJECT_ID=omfood-a621d
REACT_APP_FIREBASE_PROD_STORAGE_BUCKET=gs://omfood-a621d.firebasestorage.app
REACT_APP_FIREBASE_PROD_MESSAGING_SENDER_ID=your_prod_sender_id
REACT_APP_FIREBASE_PROD_APP_ID=your_prod_app_id
REACT_APP_FIREBASE_PROD_MEASUREMENT_ID=your_prod_measurement_id
```

## 데이터 마이그레이션 (선택사항)

### 운영 데이터를 개발 환경으로 복사
1. Firebase Console에서 운영 프로젝트의 데이터 내보내기
2. 개발 프로젝트로 데이터 가져오기
3. 또는 개발 환경에서 필요한 데이터만 수동으로 생성

## 주의사항

1. **환경 확인**: 콘솔에서 `[Firebase] 현재 환경:` 로그를 확인하여 올바른 환경이 사용되는지 확인
2. **데이터 백업**: 운영 환경의 중요 데이터는 정기적으로 백업
3. **환경변수**: `.env.development` 파일은 `.gitignore`에 포함되어야 함

## 문제 해결

### 환경이 제대로 구분되지 않는 경우
1. 브라우저 캐시 삭제
2. 개발 서버 재시작
3. 환경변수 확인

### Firebase 연결 오류
1. Firebase 프로젝트 설정 확인
2. API 키 및 설정값 확인
3. Firestore 규칙 설정 확인 