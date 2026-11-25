# 마인드맵

백엔드 면접용 개념 학습 페이지. Next.js 16으로 모든 페이지를 빌드 때 정적으로 만든다. 화면 구성과 콘텐츠 데이터 형식은 README.md에 있다.

@AGENTS.md

## 용어와 결정

- `GLOSSARY.md`: 화면 문구나 콘텐츠를 쓸 때, 컴포넌트와 변수 이름을 지을 때 읽는다. "탭"은 Spring, CS 기초 같은 분야만 뜻한다. 설명 카드 안의 `개념`·`코드 · 실무`·`면접`은 "설명 구분"이라고 부른다.
- `docs/adr/`: 렌더링 방식(정적 생성, 클라이언트 뼈대, 가로챈 라우트)이나 완료 기록의 저장 방식을 바꾸려 할 때 먼저 읽는다.

## 지킬 것

- 콘텐츠를 바꾸면 `npm run validate`가 통과해야 한다. `prebuild`에서도 돌기 때문에 실패하면 빌드와 배포가 멈춘다.
- 배포된 개념의 `id`와 `slug`, 주제의 `key`는 처음 정한 값 그대로 둔다. 이 값들은 사용자 완료 기록의 키이자 공유된 주소이다(ADR 0002). 새 슬러그는 `slugify(제목)`으로 만든다.
- `localStorage` 키 `mindmap-progress-v2`, `mindmap-quiz`, `mindmap-done`(v1)의 이름을 그대로 둔다. 이름이 바뀌면 사용자의 기록과 설정이 사라진다.
- 클라이언트 컴포넌트에는 `skeleton()`이 만든 뼈대만 넘긴다. 개념 본문은 서버 컴포넌트에서 그린다(ADR 0003).
- `/notes/<탭>`으로 가는 링크와 다른 탭 개념으로 가는 링크는 `<a>`로 쓴다. `<Link>`로 쓰면 `@panel/(.)[slug]` 가로채기에 걸린다(ADR 0003, 0004).
- `components/mindmap/MindMap.tsx`는 Next 내부 경로에서 문서에 없는 `PrefetchKind.FULL`을 가져와 쓴다. Next를 올릴 때는 이 import와 마인드맵 미리 받기가 아직 동작하는지 확인한다.

## 개발과 테스트

- `public/search-index.json`은 빌드할 때 생기는 파일이고 저장소에 없다. `npm run dev`만 돌리면 오류 없이 "일치하는 개념이 없습니다"만 나오니, 검색을 보려면 `npm run search:index`를 먼저 돌린다.
- `npm run test:e2e`는 빌드 결과를 `next start -p 3100`으로 띄워 테스트하므로, 먼저 `npm run build`를 돌린다. 3100 포트에 이미 떠 있는 서버가 있으면 그 서버를 그대로 쓴다. 로컬에서는 설치된 Chrome을, CI에서는 Playwright Chromium을 쓴다.

## 커밋

접두사 없이 무엇이 바뀌는지 한국어 한 줄로 적는다(예: `개념 카드를 누르기 전에 본문까지 미리 받기`).
