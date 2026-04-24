# 띵앤슬래시

귀여운 분위기와 하드코어 생존 감각을 섞은 브라우저 핵앤슬래시 게임입니다.  
랜덤 강화를 고르며 몰려오는 적을 정리하고, 30웨이브 최종 보스를 쓰러뜨리는 것이 목표입니다.

배포 주소: https://fatking25.github.io/singandslash/

## 특징

- 자동 공격 기반이라 이동과 거리 유지에 집중하는 플레이
- 웨이브 진행에 따라 일반 적, 보스, 강화 선택이 번갈아 등장
- 보스 처치 후 더 강한 보상을 주는 업그레이드 구조
- 최고 기록을 `localStorage`에 저장
- 모바일 웹에서도 플레이할 수 있도록 터치 스틱 이동 지원

## 조작법

### 데스크톱

- 이동: `WASD` 또는 방향키
- 일시정지: `ESC`
- 공격: 자동 공격

### 모바일

- 이동: 화면 왼쪽 하단 터치 스틱 드래그
- 일시정지: 화면 오른쪽 하단 버튼
- 공격: 자동 공격

## 실행 방법

```bash
npm install
npm run dev
```

로컬 네트워크에서도 바로 테스트할 수 있도록 Vite 개발 서버는 외부 기기 접속이 가능하게 설정되어 있습니다.

## 빌드

```bash
npm run build
```

## GitHub Pages 배포

이 프로젝트는 GitHub Pages 기준으로 설정되어 있습니다.

- 저장소: `fatking25/singandslash`
- `vite.config.js`의 `base`: `/singandslash/`
- `package.json`의 `homepage`: `https://fatking25.github.io/singandslash/`

배포 명령:

```bash
npm run deploy
```

## 기술 스택

- React
- Vite
- Canvas 2D

## 프로젝트 구조

```text
src/
  components/   화면 UI와 오버레이
  game/         엔진, 상수, 포맷, 저장 로직
public/audio/   배경음과 효과음
```
