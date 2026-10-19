# 개발용 원격 법적 문서·공지

공개 서비스의 루트 문서와 GitHub Pages 설정은 변경하지 않습니다. 개발 앱만 `agent/remote-legal-development` 브랜치의 `preview/development/current.json`을 사용합니다. 앱 프로토콜은 2입니다.

## 수정과 게시

1. 기존 `documents/*.html`, `notices/*.html`은 수정·삭제하지 않고 새 ID의 파일을 추가합니다.
2. `preview/development/source.json`에서 현행 문서 포인터 또는 공지 제목·요약·대상·게시/노출 기간을 수정합니다. 날짜는 UTC ISO 문자열입니다. 공지 수정 시 revision을 올립니다. 종료된 공지는 목록 열람을 위해 남겨둘 수 있습니다.
3. `node tools/build-development.mjs` 실행 후 `node tools/build-development.mjs --check --base origin/agent/remote-legal-development`로 게시본의 불변성과 해시를 검사합니다. 생성한 `current.json`도 함께 커밋합니다.
4. 개발 브랜치에 반영하면 개발 앱의 다음 실행·전면 복귀·수동 새로고침 때 가져옵니다. GitHub raw/CDN 전파 지연은 있을 수 있습니다. 원격 푸시 발송 기능은 이 범위에 없습니다.

공지의 게시 시각은 목록 공개 시각이고, startsAt/endsAt은 팝업·배너 노출 기간입니다. 팝업은 계정·환경·공지 ID·revision별로 확인 기록을 보관하고 앱 세션마다 최대 한 번 표시합니다. 푸시 알림으로 진입한 세션은 팝업을 건너뜁니다.

## 필수 동의 버전

문서 게시가 필수 동의 변경을 의미하지 않습니다. 새 terms 문서를 게시하고 본문 해시를 확인한 다음 개발 DB의 `legal.register_document(jsonb, source_commit)`과 `legal.activate_document(id, expected_revision, minimum_protocol)`으로 별도 활성화합니다. 클라이언트는 이 관리 함수를 실행할 수 없습니다.

- 현재 부트스트랩: 동의 버전 `2026-08-24`, 약관 시행일 `2026-09-16`. 기존 동의·시각을 보존합니다.
- 실제 개정: 새 문서 ID와 새 consentVersion을 함께 사용합니다. 동일 동의 버전에 다른 본문을 연결할 수 없습니다. 시행 전 활성화는 서버에서 거부합니다.
- 활성화 전에 문서 게시/공지 사전 노출을 먼저 확인합니다. 필요한 예고 기간 판단·운영 승인은 별도입니다.
- 활성화는 정책 revision을 조건으로 실행합니다. 앱은 서버 버전·문서 ID·SHA-256·revision이 모두 맞아야 동의를 저장합니다.
- 장애 시 공지만 종료하거나 catalog 포인터를 검증된 문서로 복구합니다. 문서 파일을 덮어쓰거나 사용자 동의 기록을 삭제하지 않습니다. 정책 복구도 현재 revision 조건으로 관리 함수를 사용합니다.

## 운영 전환 전

이 개발 브랜치와 raw URL은 운영 문서 게시 구조가 아닙니다. 운영 전환 때는 검증된 스냅샷을 공식 GitHub Pages `documents/`와 `notices/`에 게시하고 고정된 현행 URL에서 해당 게시본을 제공해야 합니다. 소개 페이지는 공식 현행 URL로 연결하므로 본문 사본을 별도로 관리하지 않습니다. 최초 앱 네이티브 기능 반영은 새 빌드가 필요하며, 이후 문서·공지 편집에는 앱/소개 페이지 수정이 필요하지 않습니다. 실제 필수 동의 전환은 서버 활성화 단계가 계속 필요합니다.
