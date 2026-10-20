# 지듣노 공지 작성·수정·종료 가이드

2026-10-20 기준 · 개발 앱 1.1.1용

공지는 **본문 HTML + 게시 정보 JSON**으로 작성해요. 이 두 가지를 legal 저장소의 개발 브랜치에 반영하면 GitHub Actions가 검사 후 `current.json`과 본문 검증값을 자동 생성해요. 앱은 게시 목록과 HTML을 받아 홈 배너·팝업·마이 공지사항에 표시해요.

이 가이드는 현재 개발 게시 경로의 운영 방법이에요. 실제 서비스용 main/GitHub Pages 전환과 공지 공개는 별도 단계예요. 일반 공지 작성은 약관의 필수 동의 버전이나 시행일을 변경하지 않아요.

## 1. 어디를 수정하나요?

| 항목 | 현재 대상 |
| --- | --- |
| 저장소 | `KINGTAEHEE/jideutno-legal` |
| 게시 브랜치 | **`agent/remote-legal-development`** |
| 본문 위치 | `preview/development/notices/` |
| 제목·요약·게시 조건 | `preview/development/source.json`의 `notices` 배열 |
| 자동 생성 파일 | `preview/development/current.json` — 평소에는 직접 수정하지 않아요. |
| 확인할 앱 | `지듣노 Dev` 1.1.1 |
| 작성 예제 | [HTML 템플릿](https://github.com/KINGTAEHEE/jideutno-legal/blob/agent/remote-legal-development/templates/notice.html), [게시 정보 템플릿](https://github.com/KINGTAEHEE/jideutno-legal/blob/agent/remote-legal-development/templates/notice.json) |

앱 저장소 `jideutno`와 공지 저장소 `jideutno-legal`은 달라요. main에만 수정하면 현재 개발 앱에는 반영되지 않아요. 본문·게시 정보의 정상적인 수정에는 앱 재빌드나 EAS Update가 필요하지 않아요.

앱의 최신 공지 기능 자체를 처음 설치하는 단계라면 먼저 [앱 1.1.1 개발 설치 절차](https://github.com/KINGTAEHEE/jideutno/blob/agent/remote-legal-notices-design/docs/35-release-1.1.1.md)를 완료해요. 이후 공지 내용은 이 저장소에서만 관리해요.

## 2. 공지가 보이는 규칙부터 알아두세요

- 마이 공지 목록은 게시일 최신순이에요. 대상 기기·앱 버전·게시 시각 조건을 만족하는 공지를 표시해요.
- 홈은 **지금 노출 기간인 공지 중 가장 최신 1건**을 먼저 선택해요. 그 공지를 숨겼으면 이전 공지를 대신 올리지 않아요.
- 공지를 읽거나 팝업을 닫아도 홈 배너는 남아요. ‘홈에서 다시 보지 않기’를 선택하면 홈 배너·팝업에서 숨겨요.
- 숨긴 공지도 마이 목록에서 열 수 있고, 상세에서 ‘홈에 다시 표시하기’로 복구할 수 있어요.
- 숨김은 기기의 계정·공지 ID·수정번호별로 저장돼요. 다른 기기·새 계정·재설치에서는 다시 표시될 수 있어요.
- 새 공지 ID 또는 새 수정번호는 새 안내로 취급해요. 팝업은 한 번 닫거나 상세를 확인하면 같은 내용으로 반복하지 않고, 한 번의 앱 활성 세션에서 최대 한 개만 표시해요. 푸시 진입·약관 동의 등 다른 흐름은 먼저 처리해요.
- 앱 시작·홈 진입·앱 복귀·홈 당기기 때 조회해요. 홈을 켜둔 동안에는 **1분마다** 새 목록을 확인하고, 이미 받아둔 공지의 홈 노출 기간은 **30초마다** 다시 판단해요. 다른 화면이나 백그라운드에서는 정기 조회를 멈춰요.
- GitHub 게시·캐시 전파와 네트워크 상태 때문에 게시한 순간의 초 단위 반영을 보장하지는 않아요. 조회 실패 시 실행 중 앱에서 이미 받은 공지는 유지해요.

`priority` 값은 기존 게시 형식을 위해 남아 있지만 현재 홈·목록의 최신순 정렬을 바꾸지 않아요. 특별한 이유가 없다면 `10`을 유지해요.

## 3. 가장 쉬운 작성 방법: GitHub 웹에서 두 번 저장하기

예시는 **2026년 10월 20일 오후 6시(KST)에 공개할 일반 공지**예요. 날짜·제목·본문은 실제 공지에 맞춰 바꿔요. 예제를 읽었다고 실제 공지가 자동 작성되지는 않아요.

### 3-1. 브랜치 확인

1. [공지 본문 폴더](https://github.com/KINGTAEHEE/jideutno-legal/tree/agent/remote-legal-development/preview/development/notices)를 열어요.
2. 상단 브랜치가 **agent/remote-legal-development**인지 확인해요.
3. 기존 공지 HTML은 열어서 덮어쓰지 않아요. 게시했던 파일은 보존하고 새 파일을 추가해요.

### 3-2. 새 HTML 파일 추가

1. [HTML 템플릿](https://github.com/KINGTAEHEE/jideutno-legal/blob/agent/remote-legal-development/templates/notice.html)을 열어 전체 내용을 복사해요.
2. 공지 본문 폴더로 돌아가 **Add file → Create new file**을 선택해요.
3. 파일명을 `notice-20261020-01-r1.html`로 입력해요.
4. 템플릿을 붙여 넣고 다음을 바꿔요.
   - `<title>`과 `<h1>`: 공지 제목
   - 게시일 문구: 사용자가 읽을 한국 날짜
   - `<p>`, `<h2>`, `<li>`: 공지 본문
5. **Commit changes**로 개발 브랜치에 저장해요. 새 브랜치를 선택했다면 PR의 base를 main이 아닌 **agent/remote-legal-development**로 정하고, 검토 후 그 개발 브랜치에 반영해요.

이 단계에서는 목록에 연결하지 않았으므로 앱에는 새 공지가 나타나지 않아요. 먼저 본문을 저장하고 다음 단계에서 목록에 연결하면 파일이 없는 주소로 게시되는 것을 피할 수 있어요.

파일명 규칙은 **공지 ID + `-r` + 수정번호 + `.html`**로 정하면 관리하기 편해요. 같은 날 두 번째 공지는 `notice-20261020-02-r1.html`처럼 새 ID를 사용해요.

### 3-3. 게시 정보 추가

1. [source.json](https://github.com/KINGTAEHEE/jideutno-legal/blob/agent/remote-legal-development/preview/development/source.json)을 열고 연필 모양 Edit를 눌러요.
2. 맨 위 catalog `revision`을 예를 들어 `development-2026-10-20-2`처럼 새 값으로 바꿔요. 이것은 게시 목록의 기록용 번호이고 앱 버전과는 달라요.
3. `documents`는 그대로 두고, `notices` 배열에 아래 항목을 추가해요.

```json
{
  "id": "notice-20261020-01",
  "revision": 1,
  "title": "새로운 소식을 알려드려요",
  "summary": "지듣노의 새로운 안내를 확인해 주세요.",
  "priority": 10,
  "publishedAt": "2026-10-20T09:00:00Z",
  "startsAt": "2026-10-20T09:00:00Z",
  "endsAt": null,
  "platforms": ["android", "ios"],
  "minProtocol": 2,
  "minAppVersion": "1.1.1",
  "maxAppVersion": null,
  "document": {
    "id": "notice-20261020-01-r1",
    "kind": "notice",
    "path": "notices/notice-20261020-01-r1.html",
    "effectiveDate": null,
    "title": "새로운 소식을 알려드려요"
  }
}
```

기존 항목 뒤에 추가한다면 **기존 항목의 마지막 `}`와 새 항목의 `{` 사이에 쉼표**를 넣어요. 배열의 마지막 항목 뒤에는 쉼표를 넣지 않아요. 공지를 배열 맨 위에 넣는 것만으로 최신 공지가 되는 것은 아니며 `publishedAt` 기준으로 정렬해요.

`document.id`가 `notice-20261020-01-r1`이면 파일명도 반드시 `notice-20261020-01-r1.html`이어야 해요. `path`에는 `preview/development/`를 다시 붙이지 않아요.

4. 제목·요약·본문·날짜·대상을 확인하고 **Commit changes**로 개발 브랜치에 저장해요.
5. `current.json`을 직접 만들거나 해시를 계산해서 붙여 넣을 필요는 없어요.

### 3-4. 자동 게시가 끝났는지 확인

1. 저장소의 **Actions → Development legal catalog**를 열어요.
2. 방금 source.json을 수정한 커밋의 실행을 확인해요.
3. `validate`와 `publish` 두 작업이 모두 초록색이어야 해요.
4. 생성 내용이 바뀌었다면 `github-actions[bot]`이 **chore: generate development legal catalog** 커밋을 추가해요.
5. [게시된 current.json](https://raw.githubusercontent.com/KINGTAEHEE/jideutno-legal/refs/heads/agent/remote-legal-development/preview/development/current.json)에 새 공지 ID·제목·본문 URL이 들어갔는지 확인해요.

본문 검사나 JSON 검사가 실패하면 게시 파일을 갱신하지 않아요. 기존 정상 공지는 유지돼요. 생성 결과에 변화가 없으면 bot 커밋도 추가하지 않아요. bot 커밋으로 같은 workflow를 반복 실행하지 않는 구조예요. 실행 요약에 게시한 source/결과 커밋이 표시돼요.

자동화는 **개발 브랜치에 대한 push에서만 게시**해요. PR에서는 생성·검사만 해요. 작업 중 더 최신 커밋이 올라오면 이전 실행은 덮어쓰지 않고 최신 실행이 게시를 맡아요. 최신 source 실행의 `publish` 완료까지 확인해요.

## 4. 게시 정보 필드 설명

| 필드 | 무엇을 적나요? |
| --- | --- |
| `id` | 공지 고유 ID. 새 소식에는 새 ID를 사용해요. 영문·숫자·하이픈·밑줄을 사용해요. |
| `revision` | 해당 공지의 수정번호. 처음에는 `1`, 내용 변경은 `2`, `3`으로 올려요. |
| `title` | 홈·목록·팝업의 제목. 120자 이내예요. |
| `summary` | 목록·팝업의 짧은 요약. 비워둘 수 없고 1,000자 이내예요. |
| `priority` | 현재는 `10` 유지. 최신순 정렬에는 사용하지 않아요. |
| `publishedAt` | 마이 목록에 공개되는 시각이자 최신순 기준이에요. |
| `startsAt` | 홈 배너·팝업 노출 시작 시각이에요. |
| `endsAt` | 홈 노출 종료 시각. 기한이 없으면 문자열이 아닌 `null`이에요. 시작보다 뒤여야 해요. |
| `platforms` | 양쪽이면 `["android", "ios"]`, Android만이면 `["android"]`예요. |
| `minProtocol` | 현재 원격 문서 방식은 `2`예요. 공지 작성만 할 때는 그대로 둬요. |
| `minAppVersion` | 이번 개발 기능을 지원하는 최소 버전은 `"1.1.1"`이에요. |
| `maxAppVersion` | 상한이 없으면 `null`이에요. |
| `document.id` | 본문 파일 ID. 확장자를 뺀 파일명과 같아요. |
| `document.kind` | `"notice"`로 유지해요. |
| `document.path` | `notices/본문파일명.html`이에요. |
| `document.effectiveDate` | 일반 공지는 `null`로 둬요. 이 값을 약관 시행 지시로 사용하지 않아요. |
| `document.title` | 본문 제목이에요. 보통 공지 제목과 맞춰요. |

자동화가 본문 URL과 SHA-256 검증값을 채워요. 지원 플랫폼이나 앱 버전 범위를 맞추지 않으면 게시 파일에 공지가 있어도 그 기기에는 보이지 않을 수 있어요.

## 5. 한국 시각과 저장 시각

JSON에는 **UTC 시각과 끝의 `Z`**를 사용해요. 한국 시각에서 9시간을 빼면 UTC예요.

| 한국 시각 KST | JSON에 넣을 값 |
| --- | --- |
| 2026-10-20 오전 9시 | `2026-10-20T00:00:00Z` |
| 2026-10-20 오후 6시 | `2026-10-20T09:00:00Z` |
| 2026-10-21 자정 | `2026-10-20T15:00:00Z` |

PowerShell에서 실제 한국 시각을 입력해 변환할 수도 있어요.

```powershell
([DateTimeOffset]::Parse("2026-10-20T18:00:00+09:00")).ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss'Z'")
```

- **바로 공개:** `publishedAt`과 `startsAt`을 실제 현재 UTC로 맞춰요.
- **예약 공개:** 두 값을 미래 시각으로 맞춰 미리 게시해요. 앱의 다음 조회/노출 평가 때 반영돼요.
- **목록에서 먼저 공개, 홈은 나중에:** `publishedAt`은 현재, `startsAt`은 미래로 설정해요.
- 본문에 쓴 한국어 날짜는 자동 변환되지 않으므로 게시 정보와 직접 맞춰요.

## 6. 이미 게시한 공지 수정하기

내용·제목·요약을 고칠 때는 다음 순서예요.

1. 기존 HTML을 복사해 새 파일 `notice-20261020-01-r2.html`을 추가해요.
2. 새 파일에 수정 내용을 적어요. 게시했던 r1 파일은 그대로 보존해요.
3. source.json에서 해당 공지의 **공지 ID는 유지**, `revision`은 `2`로 올려요.
4. `document.id`를 `notice-20261020-01-r2`, `path`를 `notices/notice-20261020-01-r2.html`로 바꿔요.
5. 필요하면 제목·요약·본문 제목도 맞추고 catalog revision도 갱신해요.
6. 저장 후 Actions와 앱에서 확인해요.

새 수정번호는 이전의 열람/숨김과 구분돼 다시 안내할 수 있어요. 잘못된 본문을 고칠 때는 이미 게시한 파일을 수정하거나 삭제하지 않아요. 원본 불변성 검사가 이를 막아요.

`publishedAt`은 원래 게시일을 유지하면 목록 순서도 유지돼요. 다른 최신 공지보다 위에 보여야 하는 재공지라면 공개 시각을 실제 재공지 시각으로 갱신하거나 별도 새 공지를 작성해요. 게시일을 미래로 바꾸면 그때까지 목록에서도 빠질 수 있어요.

홈 노출 기간만 조정하는 경우에는 본문·제목·요약을 그대로 두고 기간과 catalog revision을 바꿀 수 있어요. 이 경우 공지 수정번호를 올리지 않아 기존 숨김 선택을 보존해요.

## 7. 종료·철회·실수 복구

### 홈에서만 종료하고 목록에는 남기기

해당 공지의 `endsAt`을 종료할 UTC 시각으로 바꾸고 저장해요. 날짜는 `startsAt`보다 뒤여야 해요. 일반적인 공지 보관에는 이 방식을 권장해요.

최신 공지가 종료되면 남아 있는 활성 공지 중 최신 공지가 홈 대상이 될 수 있어요. 예전 공지를 다시 보여주고 싶지 않다면 이전 공지의 노출 기간도 함께 종료해요. **최신 공지를 사용자가 숨겼을 때 이전 공지를 대신 올리지 않는 규칙**과는 다른 경우예요.

### 마이 목록에서도 내리기

source.json의 `notices` 배열에서 해당 공지 객체를 제거하고 catalog revision을 갱신해요. 본문 HTML은 그대로 남겨요. Actions가 새 목록을 게시하고 앱이 다음에 정상 조회하면 홈과 목록에서 빠져요.

이는 앱의 게시 목록에서 내리는 작업이에요. 이미 공개했던 HTML 주소·Git 이력·기기에 남은 사본까지 지우는 작업은 아니에요.

### 실수했을 때

- 아직 게시 전 검사 실패라면 source.json이나 새 HTML 파일을 고쳐 다시 저장해요.
- 이미 잘못된 공지가 게시됐다면 먼저 기간 종료 또는 목록 철회로 노출을 내리고, 새 수정번호의 올바른 본문을 작성해요.
- 게시했던 HTML을 되돌려 덮어쓰거나 공지 수정번호를 낮추지 않아요.
- 철회한 공지를 같은 ID·수정번호로 다시 넣으면 기존 숨김 선택이 적용돼요. 새 안내가 필요하면 새 수정번호 또는 새 공지 ID로 게시해요.

## 8. 앱에서 확인하는 순서

1. 게시 Actions가 성공한 뒤 Android의 **지듣노 Dev 1.1.1**을 열어요.
2. 홈에 새 제목과 확성기 아이콘이 보이는지 확인해요. 바로 안 보이면 홈을 아래로 당겨요.
3. 공지를 열어 HTML 본문·날짜·링크를 확인해요. 링크는 앱의 외부 이동 확인을 거쳐요.
4. 그냥 읽거나 팝업만 닫았을 때 홈 배너가 남는지 확인해요.
5. ‘홈에서 다시 보지 않기’를 선택하면 홈 배너와 팝업에서 숨겨지고, 이전 공지가 대신 나오지 않는지 확인해요.
6. 마이 → 공지사항에서는 여전히 열 수 있는지, 상세에서 홈 표시를 복구할 수 있는지 확인해요.
7. 앱을 다시 실행해 숨김 선택 유지도 확인해요. iPad 대상 공지라면 해당 기기에서도 별도로 확인해요.

앱을 계속 보고 있으면 새 목록은 1분 주기로 확인해요. 예약 시작/종료도 평가 주기와 네트워크 전파에 따라 반영되므로 정확히 0초에 표시된다고 판단하지 않아요.

### 팝업 모양과 동작만 다시 확인하기

동의 화면 깜빡임 수정·팝업 확인 후속 업데이트가 포함된 개발 앱에서 사용할 수 있어요. 이미 runtime 1.1.1 개발 Release를 설치했다면 앱 저장소의 [개발 EAS Update 절차](https://github.com/KINGTAEHEE/jideutno/blob/agent/remote-legal-notices-design/docs/35-release-1.1.1.md)를 적용해요.

1. **마이 → 공지사항 → 확인할 공지 상세 → 팝업으로 확인하기**를 눌러요.
2. 홈에서 사용하는 실제 팝업과 같은 제목·요약·버튼·체크박스를 확인해요. 이미 읽거나 숨긴 공지도 반복해서 열 수 있어요.
3. ‘자세히 보기’는 팝업을 닫아 이미 열린 본문으로 돌아와요. ‘홈에서 다시 보지 않기’를 체크하고 닫으면 실제 홈 숨김 선택이 저장돼요. 복구는 상세의 ‘홈에 다시 표시하기’를 사용해요.

이 수동 확인 버튼은 개발 환경에만 있어요. 팝업 확인 때문에 공지를 새로 게시하거나 앱 데이터를 지울 필요는 없어요. 체크하지 않고 닫으면 이미 저장된 홈 숨김 선택도 그대로 유지돼요.

자동 팝업까지 확인하려면 다른 ID 또는 새 revision의 공지를 정상 게시한 뒤 본문을 미리 열지 않고 앱 아이콘으로 직접 실행해 홈에 머물러요. 동의 확인과 공지 조회가 끝나고 800ms 뒤 최신 활성·미열람·미숨김 공지가 대상이에요. 푸시로 진입한 세션은 자동 팝업을 건너뛰어요. 본문 열람이나 팝업 닫기는 같은 ID/revision을 이미 확인한 것으로 저장하므로, 단순 재실행이나 홈 표시 복구만으로 자동 팝업이 다시 나오지는 않아요.

## 9. 자주 만나는 문제

| 증상/검사 메시지 | 확인할 것 |
| --- | --- |
| 파일을 찾을 수 없어요 / ENOENT | HTML을 먼저 추가했는지, document.id·파일명·path가 정확히 같은지 확인해요. |
| Invalid notice schedule | 날짜 끝이 `Z`인지, endsAt이 startsAt보다 뒤인지 확인해요. |
| JSON 해석 오류 | 큰따옴표·쉼표·괄호를 확인해요. null에는 따옴표를 붙이지 않아요. |
| Increase notice revision | 제목·요약·본문 정보를 고쳤다면 공지 수정번호도 올려요. |
| Published content is immutable | 기존 파일을 보존하고 새 ID의 HTML을 추가해요. |
| Unsafe document | 템플릿의 정적 HTML·내부 CSS를 사용해요. script·iframe·외부 CSS·자동 이동·입력 폼은 허용하지 않아요. |
| UTF-8 without BOM | HTML을 UTF-8, BOM 없음으로 저장해요. PowerShell 5.1의 Set-Content -Encoding UTF8은 BOM을 붙일 수 있으니 템플릿 복사 후 편집을 사용해요. |
| Actions publish에서 권한 오류 | 개발 게시 작업의 contents: write 허용 여부를 확인해요. 실패한 상태를 게시 완료로 보지 않고 원인을 해결한 뒤 최신 실행을 재시도해요. |
| newer source commit exists | 더 최신 source 실행이 게시를 맡고 있어요. 최신 실행의 결과를 확인해요. |
| Actions는 성공했는데 홈에 없어요 | 앱 버전·대상 플랫폼·공개/노출 시각·최신 활성 공지 여부·숨김 선택·개발 브랜치를 확인해요. |
| HTML 주소를 브라우저로 여니 코드가 보여요 | 개발 GitHub raw 주소의 응답 방식 때문일 수 있어요. 앱 WebView의 본문 표시를 확인해요. |

공지 목록은 최대 100개를 지원해요. 정리가 필요하면 오래된 공지는 목록에서 내리되 게시했던 HTML은 보존해요. 일반 공지를 작성하는 과정에서 약관의 필수 동의 정보나 서버 데이터를 변경할 필요는 없어요.

## 10. Windows PC에서 작성하고 싶은 경우

GitHub 웹 편집이 편하면 이 절은 건너뛰어도 돼요. Node.js와 Git이 설치된 Windows PowerShell 기준이에요. 명령은 한 줄씩 실행하고 오류나 미커밋 변경이 있으면 다음 단계로 진행하지 않아요.

### 저장소 준비

```powershell
Set-Location C:\dev
if (-not (Test-Path C:\dev\jideutno-legal\.git)) { git clone --branch agent/remote-legal-development https://github.com/KINGTAEHEE/jideutno-legal.git C:\dev\jideutno-legal }
Set-Location C:\dev\jideutno-legal
git status
git fetch origin
if (git branch --list agent/remote-legal-development) { git switch agent/remote-legal-development } else { git switch --track origin/agent/remote-legal-development }
git pull --ff-only origin agent/remote-legal-development
```

### 파일 작성

예시 ID를 실제 공지에 맞게 정한 뒤 실행해요. 이미 같은 이름의 파일이 있으면 덮어쓰지 말고 새 파일명을 정해요.

```powershell
if (Test-Path preview\development\notices\notice-20261020-01-r1.html) { throw "같은 이름의 파일이 있어요. 새 공지 ID를 정해주세요." }
Copy-Item templates\notice.html preview\development\notices\notice-20261020-01-r1.html
notepad preview\development\notices\notice-20261020-01-r1.html
notepad preview\development\source.json
```

본문과 게시 정보는 위 3절대로 작성해요. 메모장에서 HTML 저장 시 UTF-8을 선택해요.

### 검사와 게시

```powershell
node --test tools/tests/development-legal.test.mjs
node tools/build-development.mjs --base origin/agent/remote-legal-development
node tools/build-development.mjs --check --base origin/agent/remote-legal-development
git diff -- preview/development/source.json preview/development/current.json
git add preview/development/source.json preview/development/notices/notice-20261020-01-r1.html
git commit -m "docs: add development notice"
git push origin agent/remote-legal-development
```

위 git add는 직접 작성한 원본 두 개만 올려요. 로컬에서 생성된 current.json은 자동화 결과를 확인하기 위한 것이에요. 게시 Actions 성공 후 아래를 실행해 자동 생성 커밋과 맞춰요.

```powershell
git restore -- preview/development/current.json
git pull --ff-only origin agent/remote-legal-development
node tools/build-development.mjs --check
```

여기서 restore는 **빌더가 만든 current.json 한 파일만** 대상으로 해요. 작성한 HTML·source.json이나 다른 변경을 초기화하지 않아요. 자동화 생성 커밋이 없으면 pull은 최신 상태라고 알려줘요.

작성·검사·게시가 끝나면 8절의 앱 확인 순서를 진행해요.
