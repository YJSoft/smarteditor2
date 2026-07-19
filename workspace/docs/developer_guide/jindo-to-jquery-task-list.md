# SmartEditor2 Jindo 제거 및 jQuery 전환 Task List

## 1. 목표와 작업 원칙

이 문서는 [Jindo 의존성 분석 및 jQuery 전환 기준](./jindo-to-jquery-analysis.md)을 실행 가능한 작업으로 나눈 체크리스트다.

최종 목표는 다음과 같다.

- Jindo core와 Jindo Component 런타임 의존성 완전 제거
- IE8 지원 종료
- 자체 배포하는 jQuery 3.7.1을 기준으로 동작
- 특정 CMS나 host framework에 종속되지 않는 범용 에디터 유지
- 향후 jQuery 4 전환에 유리한 API 사용
- 기존 Husky plugin message, lazy mixin, editor 공개 API의 동작 유지

공통 완료 원칙:

- 한 task는 가능한 한 하나의 독립적인 동작 단위로 commit한다.
- 기계적인 치환보다 먼저 characterization test를 추가한다.
- Jindo 객체의 구현 형태가 아니라 SmartEditor2가 필요한 결과를 단언한다.
- 임시 adapter를 도입하면 제거 task와 종료 조건을 동시에 등록한다.
- 신규 코드에서 jQuery 4 전환을 방해하는 deprecated API를 사용하지 않는다.
- jQuery Migrate는 호환성 조사와 향후 전환 검증에만 사용하고 정상 런타임 필수 의존성으로 만들지 않는다.

## 2. 전체 완료 조건

- [ ] `workspace/src`와 `workspace/static/js/service`에 활성 `jindo.*` 참조가 없다.
- [ ] skin과 sample HTML이 `jindo2.all.js`, `jindo_component.js`를 로드하지 않는다.
- [ ] `workspace/static/js/lib/jindo2.all.js`가 제거된다.
- [ ] `workspace/static/js/lib/jindo_component.js`가 제거된다.
- [ ] 테스트가 Jindo asset을 import하지 않는다.
- [ ] 테스트가 `instanceof jindo.*` 또는 Jindo 내부 필드를 단언하지 않는다.
- [ ] IE8 target, Uglify IE8 옵션과 IE8 전용 asset이 제거된다.
- [ ] 배포물에 포함된 jQuery 3.7.1에서 필수 기능 회귀 테스트가 통과한다.
- [ ] 모든 locale skin과 standalone demo가 자체 jQuery 자산으로 동작한다.
- [ ] 신규 코드에 `$.proxy`, `$.trim`, `.bind`, `.unbind`, `.delegate` 사용이 없다.
- [ ] 사용자 plugin과 사진 uploader 문서가 새 확장 방식을 안내한다.
- [ ] jQuery 4 전환 점검표가 문서화된다.

## 3. Milestone 0 — 범위와 통합 계약 확정

### MIG-000 브라우저 지원 계약 갱신

- [x] IE8 지원 종료를 README와 사용자 가이드에 반영한다.
- [x] Internet Explorer 계열 지원 종료를 명시한다.
- [x] evergreen browser 기준을 README와 빌드 설정에 일관되게 적용한다.
- [ ] browser-specific workaround를 `삭제`, `기능 탐지로 변경`, `유지`로 분류한다.

완료 기준:

- 지원 브라우저 문서와 Babel target이 같은 정책을 표현한다.
- IE8에서의 정상 동작은 테스트·릴리스 acceptance 대상이 아니다.

### MIG-001 jQuery 런타임 배포 계약 확정

- [x] jQuery 3.7.1을 개발 의존성과 배포 기준 버전으로 고정한다.
- [x] 빌드 시 `jquery.min.js`를 `dist/js/lib`에 복사한다.
- [x] skin iframe이 자체 `jquery.min.js`를 Jindo보다 먼저 로드한다.
- [x] 모든 locale skin과 standalone demo가 같은 editor 코드를 사용하도록 한다.
- [x] jQuery 미존재 또는 3.x 미만일 때 초기화를 중단한다.
- [ ] Jindo 제거 후에도 모든 skin의 jQuery 로딩 순서 검증을 유지한다.

완료 기준:

- 편집기 코드는 iframe 자신의 `window.jQuery`와 document를 사용한다.
- host page의 `$`와 jQuery plugin 구성에 의존하지 않는다.

### MIG-002 jQuery 버전 정책 자동 검증

- [x] 개발/CI 기준 jQuery 버전을 3.7.1로 명시한다.
- [x] 런타임 최소 버전을 jQuery 3으로 검증한다.
- [ ] 향후 jQuery 4 CI job을 추가할 수 있도록 test setup을 version parameter화한다.
- [x] deprecated jQuery API 금지 규칙을 ESLint 또는 정적 검사에 추가한다.

완료 기준:

- 버전 변경이 application source 수정 없이 test dependency 변경으로 검증 가능하다.

## 4. Milestone 1 — 빌드와 테스트 기반 정비

### MIG-010 IE8 빌드 설정 제거

- [x] `webpack.config.js`의 Babel target `ie >= 8`을 제거한다.
- [x] UglifyJS `ie8: true` 옵션을 제거한다.
- [x] Babel loader가 bundle entry만 처리하는 현재 범위를 검토한다.
- [ ] native class 또는 최신 문법을 사용할 경우 `workspace/src` 전체 transpilation을 구성한다.
- [x] `smart_editor2_inputarea_ie8.html`의 참조와 필요 여부를 제거한다.
- [ ] IE8 전용 분기가 빌드 산출물에 남지 않는지 확인한다.

완료 기준:

- development/production build가 성공한다.
- 빌드 결과가 문서화된 evergreen browser 문법 수준을 만족한다.

### MIG-011 Jindo 사용량 guard 추가

- [x] 런타임 source의 `jindo.*` 참조 수를 검사하는 script 또는 CI task를 추가한다.
- [x] 남은 참조 수가 증가하면 CI가 실패하도록 한다.
- [ ] 최종 단계에서는 허용 수를 0으로 변경한다.
- [ ] CHANGELOG의 역사적 문구는 runtime guard 대상에서 제외한다.

현재 AST 기준 허용 상한은 `workspace/src` 340개, `workspace/static/js/service` 5개다. 분석 당시 source 기준 746개에서 IE8 경로, 53개 class 생성 지점, 중앙·직접 event 경계, browser capability, Array/Hash, Ajax, 소형 wrapper와 raw DOM lookup 전환으로 406개가 감소했다. 총량 guard와 별도로 제거가 끝난 `jindo.$`, `jindo.$Class`, `jindo.$Event`, `jindo.$Fn`, `jindo.$Agent`, `jindo.$A`, `jindo.$H`, `jindo.$Ajax`, `jindo.$S`, `jindo.$Document`, `jindo.$Cookie`, `jindo.$Date`, `jindo.$Json`은 한 건이라도 다시 추가되면 검사가 실패한다.

권장 검사 범위:

```text
workspace/src
workspace/static/js/service
workspace/static/*.html
workspace/test
```

### MIG-012 핵심 characterization test 추가

- [x] Husky plugin `$init` 실행과 message registration 테스트
- [x] class inheritance와 `instanceof` 테스트
- [x] lazy mixin 전/후 이미 생성된 plugin의 handler 동작 테스트
- [x] event target/current target/key/modifier/좌표/stop 테스트
- [x] iframe body에 연결한 event 테스트
- [ ] selector context와 선행 `>` 동작 테스트
- [ ] `$Element` width/height/offset getter와 setter 결과 테스트
- [x] Ajax text/JSONP success, timeout, error 테스트
- [ ] lazy script 중복 요청, 순서, 성공, 실패 테스트
- [ ] QuickEditor drag 시작/이동/종료/경계 테스트

완료 기준:

- Jindo 제거 전 기존 구현으로 모두 통과한다.
- 테스트가 Jindo 내부 코드가 아니라 SmartEditor2 observable behavior를 단언한다.

### MIG-013 핵심 editor 회귀 시나리오 정의

- [ ] editor 생성과 `MSG_APP_READY`
- [ ] WYSIWYG/HTML/TEXT 모드 전환
- [ ] 입력, Enter, paste, drop
- [ ] undo/redo
- [ ] font name/size/color/background/line height
- [ ] hyperlink 생성·수정·삭제
- [ ] 특수문자와 인용구
- [ ] table 생성, cell 선택, merge/split, resize, template
- [ ] find/replace
- [ ] QuickEditor open/close/drag
- [ ] vertical resize
- [ ] lazy bundle 최초 실행과 재실행
- [ ] 다국어 skin 생성

완료 기준:

- 각 시나리오가 자동화 또는 명시적인 수동 QA 항목으로 추적된다.

## 5. Milestone 2 — Jindo 비의존 기반 계층 구축

### MIG-020 Husky class helper 설계

- [x] 현재 `$Class` 사용에 필요한 최소 semantics를 문서화한다.
- [x] `$init` 자동 실행을 구현한다.
- [x] 정상적인 prototype chain과 `instanceof`를 구현한다.
- [x] `.extend()` 또는 명확한 대체 상속 API를 구현한다.
- [x] Jindo의 `_$superClass` 검사 없이 상속 관계를 확인하도록 `HuskyCore.mixin()`을 수정한다.
- [x] `$super` 문자열 rewriting과 `eval`은 사용하지 않는다.
- [x] class helper가 object-literal Husky plugin 형식을 위한 내부 API임을 결정한다.

완료 기준:

- HuskyCore, HuskyRange 상속, lazy mixin characterization test가 Jindo 없이 통과한다.

### MIG-021 `$Class` 사용 일괄 전환

- [x] `husky_framework` 클래스 전환
- [x] `util` 클래스 전환
- [x] `common`, `shortcut`, `undo_redo`, `extra` 클래스 전환
- [x] `fundamental/editing` 클래스 전환
- [x] `fundamental/base` 클래스 전환
- [x] `fundamental/advanced` 클래스 전환
- [x] `quick_editor` 클래스 전환
- [x] `jindo.$Class` 참조가 0인지 확인한다.

완료 기준:

- 53개 class 생성 지점이 전환된다.
- plugin registration과 public constructor 이름이 유지된다.

### MIG-022 Husky event adapter 구현

- [x] jQuery Event에서 기존 `element`를 제공한다.
- [x] `currentElement`, `relatedElement`를 제공한다.
- [x] `key()` 반환 규약을 제공한다.
- [x] `mouse()` 반환 규약을 제공한다.
- [x] `pos()`의 client/page/layer 좌표 규약을 제공한다.
- [x] `stop`, `stopDefault`, `stopBubble`을 제공한다.
- [x] 원본 event 접근 방법을 제공한다.
- [x] adapter가 jQuery private field에 의존하지 않도록 한다.

완료 기준:

- 기존 plugin event handler를 한꺼번에 수정하지 않아도 characterization test가 통과한다.
- 향후 handler가 직접 jQuery Event를 사용하도록 전환 가능한 경계가 생긴다.

### MIG-023 `registerBrowserEvent` 전환

- [x] `HuskyCore.registerBrowserEvent()`를 `.on()` 기반으로 변경한다.
- [x] delay가 있는 message dispatch 동작을 유지한다.
- [x] handler reference를 저장해 정확한 `.off()`가 가능하게 한다.
- [x] document, iframe document, element에 대한 연결을 테스트한다.
- [x] 등록 해제와 editor destroy lifecycle이 필요한지 정의한다.

완료 기준:

- 93개 호출부가 Jindo `$Fn.attach()` 없이 동작한다.

### MIG-024 직접 `$Fn.attach/detach` 전환

- [x] resize/drag document event 전환
- [x] iframe body event 전환
- [x] ColorPicker document mouse event 전환
- [x] toolbar와 dialog event 전환
- [x] shortcut event 전환
- [x] attach와 detach가 같은 function reference를 사용하도록 정리한다.
- [x] `jindo.$Fn` 참조가 0인지 확인한다.

event가 아닌 callback의 `$Fn.bind()`는 native `Function.prototype.bind()`로 전환했다. browser event는 `HuskyEvent.createHandler()`로 기존 event 규약을 유지하며 jQuery `.on()`/`.off()`에 같은 handler reference를 전달한다. IE 전용 direct event 경로는 지원 범위에 맞춰 제거했다. 활성 runtime source와 service의 `jindo.$Fn` 참조는 0개이며 migration guard가 재도입을 막는다.

`N_DraggableLayer` characterization test는 drag 종료 후 같은 `mouseup`이 다시 발생해도 종료 handler가 중복 실행되지 않는 것을 확인한다. editor 전체 destroy lifecycle과 iframe 반복 생성·제거 검증은 MIG-064의 통합 회귀 범위에서 계속 추적한다.

완료 기준:

- event handler 누적과 memory leak이 발생하지 않는다.
- iframe을 반복 생성·제거해도 duplicate event가 발생하지 않는다.

### MIG-025 browser capability 모듈 구현

- [x] 실제로 필요한 플랫폼 정보 목록을 정의한다.
- [x] macOS shortcut 판별을 중앙화한다.
- [ ] Selection/Range와 event capability를 중앙화한다.
- [ ] 불필요한 IE/Opera/구형 Safari 분기를 제거한다.
- [ ] 유지할 browser workaround는 근거와 테스트를 추가한다.
- [x] `jindo.$Agent` 참조가 0인지 확인한다.

[`BrowserCapabilities.js`](../../src/husky_framework/BrowserCapabilities.js)는 user agent를 한 번만 분석해 editor가 실제로 사용하는 browser·OS capability를 제공한다. 기존 plugin 계약과의 전환 비용을 줄이기 위해 `navigator()`와 `os()` accessor를 제공하지만 Jindo 객체에는 의존하지 않는다. 모든 runtime source와 service 호출부가 이 모듈을 사용하며, migration guard가 `jindo.$Agent` 재도입을 막는다.

완료 기준:

- 파일별 browser sniffing이 남지 않거나 승인된 예외만 남는다.
- IE8 전용 code path가 제거된다.

## 6. Milestone 3 — Jindo utility API 제거

### MIG-030 `jindo.$` 제거

- [x] ID lookup을 `getElementById` 또는 명확한 jQuery selector로 변경한다.
- [x] HTML 문자열 element 생성을 jQuery 또는 `createElement`로 변경한다.
- [x] 특정 iframe document에서 element를 생성하는 호출을 별도 검증한다.
- [x] raw DOM과 jQuery collection의 변수 이름을 구분한다.

완료 기준:

- `jindo.$` 참조 31곳이 제거된다.
- raw DOM이 필요한 API에 jQuery collection이 전달되지 않는다.

[`DOM.js`](../../src/husky_framework/DOM.js)의 `getElement()`는 ID 문자열과 HTML 문자열을 raw DOM으로 해석하며, HTML 생성 시 지정된 iframe document를 보존한다. jQuery collection이 필요한 호출부와 구분하기 위해 helper는 항상 단일 element를 반환한다.

### MIG-031 `jindo.$$`와 `cssquery` 제거

- [ ] `getSingle`을 context 기반 `.find().get(0)` 등으로 변경한다.
- [ ] 복수 selector 결과를 `.get()` 또는 jQuery collection 중 의도에 맞게 변경한다.
- [ ] 선행 `>` selector 14곳을 `.children()` 또는 명시적인 selector로 변경한다.
- [ ] `p:empty()`를 `p:empty`로 변경한다.
- [ ] `oneTimeOffCache` 옵션을 제거한다.
- [ ] DOM 변경 직후 selector 결과가 갱신되는지 테스트한다.

완료 기준:

- `jindo.$$`, `jindo.cssquery` 참조가 0이다.
- selector 결과의 raw DOM/collection 형태가 호출부 기대와 일치한다.

### MIG-032 `$Element` class/style/attribute API 전환

- [ ] `addClass`, `removeClass`, `hasClass`, `className` 전환
- [ ] `css`, `opacity`, `visible`, `show`, `hide` 전환
- [ ] `attr`, `html`, `outerHTML` 전환
- [ ] `$value()`를 `.get(0)` 또는 raw DOM 보존 방식으로 변경

완료 기준:

- class, style, attribute 관련 UI 회귀 테스트가 통과한다.

### MIG-033 `$Element` geometry API 전환

- [ ] width/height getter semantics를 비교한다.
- [ ] numeric setter와 CSS string setter를 구분한다.
- [ ] `offset()` getter를 iframe/scroll 상태에서 검증한다.
- [ ] `offset(top, left)`를 `.offset({top, left})`로 변경한다.
- [ ] hidden layer와 table cell 크기 계산을 검증한다.

완료 기준:

- toolbar, find/replace, accessibility popup, QuickEditor, table resize 위치가 기존과 일치한다.

### MIG-034 `$Element` DOM traversal/mutation 전환

- [ ] `child(callback)` 전환
- [ ] `isChildOf`와 parent 관계 검사 전환
- [ ] `append`, `appendTo`, `before`, `after` 전환
- [ ] `leave`, `remove`, `replace`, `empty` 전환
- [ ] cross-document node 삽입 동작을 검증한다.

완료 기준:

- quote/table/style remover/color picker의 DOM 구조가 기존과 일치한다.
- `jindo.$Element` 참조가 0이다.

### MIG-035 `$A` 제거

- [x] `forEach`, `filter`, `some`, `indexOf`를 native Array로 변경한다.
- [x] `$A.Break/Continue`를 `some`, loop, return 등 명시적인 흐름으로 변경한다.
- [x] `refuse`를 `filter`로 변경한다.
- [x] `has`를 `includes` 또는 `indexOf`로 변경한다.
- [x] `.length(newLength)`를 native length 대입 또는 `slice`로 변경한다.
- [x] `._array`, `$value()` 접근을 제거한다.
- [x] array-like NodeList/arguments를 `Array.from` 또는 slice로 변환한다.

완료 기준:

- `jindo.$A` 참조가 0이다.
- callback 중단/계속 semantics가 동일하다.

### MIG-036 `$H` 제거

- [x] Shortcut hash iteration을 native Object loop로 변경한다.
- [x] PopupManager의 value-to-key 역검색 자료구조를 plain object로 정리한다.
- [x] `add`, `remove`, `search`, `hasValue`, `$(key)`를 제거한다.
- [x] Object와 `Map` 중 직렬화·키 타입에 맞는 자료구조를 선택한다.

완료 기준:

- shortcut 등록/해제와 popup callback routing이 통과한다.
- `jindo.$H` 참조가 0이다.

### MIG-037 소형 wrapper 제거

- [x] `$S.trim()`을 native `trim()`으로 변경한다.
- [x] `$S.stripTags()`를 안전한 DOM 기반 변환으로 변경한다.
- [x] `$Document.scrollPosition/clientSize`를 document/defaultView 기반으로 변경한다.
- [x] `$Cookie`를 작은 cookie helper로 변경한다.
- [x] `$Date().time()`을 `Date.now()`로 변경한다.
- [x] `$Json` 반환값을 plain object로 변경하고 공개 API 영향을 확인한다.

완료 기준:

- `$S`, `$Document`, `$Cookie`, `$Date`, `$Json` 참조가 0이다.

`Cookie.js`는 URL encoding, 만료일, path/domain을 지원하는 최소 cookie helper이며 `DOMMetrics.js`는 iframe document의 scroll position과 viewport size를 해당 document의 `defaultView` 기준으로 계산한다. 문자열 tag 제거는 detached DOM container의 text content를 사용하고, XML 변환 결과는 Jindo wrapper 없이 원래 plain object를 반환한다. 관련 trim, cookie, viewport, XML 반환 동작은 characterization test로 고정했다.

### MIG-038 `$Ajax` 제거

- [x] HTML fragment XHR을 `$.ajax` 또는 `$.get`으로 전환한다.
- [x] QuickEditor JSONP load/save를 `$.ajax({dataType: "jsonp"})`로 전환한다.
- [x] ColorPalette JSONP 세 호출을 전환한다.
- [x] Jindo response `.json()`과 `.text()` 호출을 제거한다.
- [x] timeout/error/success callback signature를 변경한다.
- [x] JSONP callback parameter와 cache 정책을 기존 endpoint 계약과 검증한다.
- [ ] 가능하면 JSONP endpoint를 CORS JSON API로 전환할 수 있는지 별도 조사한다.

`LazyLoader`의 HTML fragment는 `dataType: "html"` success/error callback으로 전환했고, QuickEditor와 ColorPalette의 JSONP 호출은 iframe-local jQuery에 `dataType: "jsonp"`, `jsonp: "callback"`, `cache: false`를 명시했다. QuickEditor의 기존 1초 timeout은 jQuery의 1000ms로 변환했다.

완료 기준:

- `jindo.$Ajax` 참조가 0이다.
- success/error/timeout characterization test가 통과한다.

## 7. Milestone 4 — Jindo Component 제거

### MIG-040 내부 Component 구현

- [ ] ColorPicker에 필요한 option getter/setter를 구현한다.
- [ ] custom event `attach`, `detach`, `fireEvent`를 구현한다.
- [ ] event 취소 semantics가 실제 사용되는지 확인하고 필요한 범위만 구현한다.
- [ ] instance 전역 registry 등 사용하지 않는 JC 기능은 구현하지 않는다.
- [ ] ColorPicker와 ColorPalette의 `jindo.Component` 상속을 제거한다.

완료 기준:

- ColorPicker `colorchange` event와 ColorPalette 연결이 동작한다.
- `jindo.Component` 참조가 0이다.

### MIG-041 QuickEditor DragArea 대체

- [ ] 현재 사용 옵션 `sClassName`, `bFlowOut`, `nThreshold`를 정의한다.
- [ ] `beforeDrag`, `dragStart`, `dragEnd` event payload를 정의한다.
- [ ] drag handle과 실제 이동 layer가 다른 현재 동작을 보존한다.
- [ ] editor 영역 경계를 넘지 않는 동작을 보존한다.
- [ ] mouse event를 우선 지원하고 범용 에디터 정책에 따라 pointer/touch 지원을 결정한다.
- [ ] drag 종료 시 document handler를 항상 해제한다.

완료 기준:

- QuickEditor 위치 저장, 고정 모드와 editing-area cover가 정상 동작한다.
- `jindo.DragArea` 참조가 0이다.

### MIG-042 cached lazy script loader 대체

- [ ] URL 단위 in-flight/completed 상태를 관리한다.
- [ ] 요청 순서를 보존한다.
- [ ] script 실행 완료 후 callback을 호출한다.
- [ ] cache 사용을 명시한다.
- [ ] charset 요구를 확인한다.
- [ ] network/parse/execute 실패를 호출부에 전달한다.
- [ ] 같은 script의 중복 요청을 합친다.
- [ ] `HuskyCore.addLoadedFile`과 기존 loaded-file map을 통합한다.

완료 기준:

- lazy mixin script가 최초 message에서 한 번만 로드되고 원래 message가 재실행된다.
- 실패가 무한 대기나 무한 재시도를 만들지 않는다.
- `jindo.LazyLoading` 참조가 0이다.

### MIG-043 Jindo Component 번들 제거

- [ ] 내부에서 사용하지 않는 나머지 16개 component의 외부 호환성 영향을 문서화한다.
- [ ] `jindo.FileUploader` 기반 legacy 문서에 대체 경로를 제공한다.
- [ ] skin에서 `jindo_component.js` script를 제거한다.
- [ ] 테스트 import를 제거한다.
- [ ] 정적 파일을 삭제한다.

완료 기준:

- build 산출물에 `jindo_component.js`가 없다.
- 내부 코드와 공식 문서가 JC global을 요구하지 않는다.

## 8. Milestone 5 — 고위험 기능군 전환과 회귀

### MIG-050 HuskyCore와 lazy mixin 안정화

- [ ] plugin 등록과 message map 갱신 검증
- [ ] BEFORE/ON/AFTER 실행 순서 검증
- [ ] LOCAL_BEFORE_FIRST 재실행 검증
- [ ] lazy class mixin 전후 instance 검증
- [ ] event registration과 delayed execution 검증

### MIG-051 HuskyRange와 Selection 전환 검증

- [ ] native Range 지원 경로를 기본 경로로 정리한다.
- [ ] IE `document.selection` 전용 코드를 제거한다.
- [ ] selection 저장/복구, bookmark, pasteHTML 회귀 테스트를 추가한다.
- [ ] collapsed range, text node, table cell selection을 검증한다.
- [ ] WYSIWYG iframe document 간 Range 생성 위치를 검증한다.

완료 기준:

- 입력, paste, hyperlink, style, table 기능에서 cursor/selection이 유지된다.

### MIG-052 WYSIWYG editing 영역 검증

- [ ] iframe load event 전환
- [ ] key/mouse/paste/drop event 전환
- [ ] body height와 auto resize 검증
- [ ] browser-specific blank page 선택 로직 정리
- [ ] IE beforedeactivate와 EmulateIE7 경로 제거

### MIG-053 Toolbar와 layer UI 검증

- [ ] toolbar selector와 event delegation 검증
- [ ] active/disabled/hover class 검증
- [ ] left/right layer positioning 검증
- [ ] keyboard accessibility와 focus loop 검증

### MIG-054 TableEditor와 TableCreator 검증

- [ ] 선행 `>` selector 전환 검증
- [ ] cell selection과 map 구성 검증
- [ ] merge/split/add/delete row/column 검증
- [ ] table/cell resize 좌표 검증
- [ ] template/background color/background image 검증
- [ ] lazy load 후 handler 등록 검증

### MIG-055 Find/Replace, Quote, Hyperlink 검증

- [ ] find/replace layer offset과 focus 검증
- [ ] quote DOM insertion/removal 검증
- [ ] hyperlink selection 저장·복구 검증
- [ ] URL/email 자동 링크 검증

### MIG-056 ColorPicker와 QuickEditor 검증

- [ ] canvas color picker 크기·좌표·custom event 검증
- [ ] recent color JSONP 검증
- [ ] QuickEditor open/close/toggle/drag 검증
- [ ] iframe scroll 상태의 위치 계산 검증

## 9. Milestone 6 — 배포물, 테스트, 문서 정리

### MIG-060 Jindo core asset 제거

- [ ] 모든 `jindo.*` runtime 참조가 제거되었는지 guard로 확인한다.
- [ ] 7개 skin/sample HTML에서 `jindo2.all.js`를 제거한다.
- [ ] `SE2BasicCreator`의 Jindo 존재 검사와 오류 문구를 제거한다.
- [ ] 테스트에서 Jindo core import를 제거한다.
- [ ] `workspace/static/js/lib/jindo2.all.js`를 삭제한다.
- [ ] `CopyWebpackPlugin` 결과에 파일이 없는지 확인한다.

### MIG-061 테스트 assertion 정리

- [x] `instanceof jindo.$Event` assertion을 Husky event 동작 assertion으로 변경한다.
- [ ] `jindo.LazyLoading.load` spy를 내부 script loader spy로 변경한다.
- [x] `$Class.extend` fixture를 새 class helper/native class fixture로 변경한다.
- [ ] bundle smoke test가 Jindo 사전 import 없이 성공하도록 변경한다.

### MIG-062 공개 문서 갱신

- [ ] README의 Third-party libraries에서 Jindo/JC를 제거한다.
- [ ] jQuery 기준 버전과 업그레이드 정책을 추가한다.
- [ ] browser support 표를 갱신한다.
- [ ] plugin 작성 예제를 새 class/selector/event API로 변경한다.
- [ ] upgrade 문서의 Jindo asset 목록을 제거한다.
- [ ] photo uploader 문서에서 Jindo FileUploader 경로를 제거하거나 legacy로 명확히 표시한다.
- [ ] Jindo 기반 사용자 plugin migration guide를 작성한다.
- [ ] CHANGELOG의 과거 기록은 보존하고 새 제거 내역을 추가한다.

### MIG-063 배포 호환성 및 release note

- [ ] Jindo global을 사용하던 custom plugin이 breaking change 대상임을 명시한다.
- [ ] 대체 plugin skeleton을 제공한다.
- [ ] Jindo/JC 파일을 직접 참조하던 URL이 더 이상 제공되지 않음을 명시한다.
- [ ] semantic version상 major release 여부를 결정한다.
- [ ] 범용 host application integration guide를 작성한다.

### MIG-064 최종 검증

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run coverage`
- [ ] `npm run build`
- [ ] standalone demo smoke test
- [ ] 별도 host application에 삽입하는 integration smoke test
- [ ] 모든 locale skin smoke test
- [ ] production build에서 Jindo 문자열/asset 검사
- [ ] 반복 editor 생성·제거 memory/event leak 검사

## 10. Milestone 7 — jQuery 4 전환 준비

### MIG-070 jQuery 4 compatibility CI 준비

- [ ] jQuery 4를 사용하는 비차단 experimental CI job을 추가한다.
- [ ] jQuery 3 전용 동작과 jQuery 4 변경점을 목록화한다.
- [ ] 제거된/deprecated API 정적 검사를 유지한다.
- [ ] jQuery 4 정식 전환 때 활성화할 release checklist를 작성한다.

### MIG-071 jQuery Migrate 활용 계획

- [ ] jQuery 4 실험 branch에서만 jQuery Migrate를 활성화할 방법을 정의한다.
- [ ] Migrate warning을 수집하고 SmartEditor2 관련 warning을 0으로 만든다.
- [ ] Migrate 제거 상태에서도 모든 테스트가 통과하는 것을 최종 조건으로 둔다.

완료 기준:

- jQuery Migrate는 문제 탐지 도구이며 제품 동작을 유지하는 숨은 필수 의존성이 아니다.

## 11. 권장 작업 순서 요약

```text
M0 통합 계약
  → M1 빌드/characterization test
    → M2 class/event/browser 기반 계층
      → M3 Jindo utility API 제거
        → M4 JC 세 컴포넌트 제거
          → M5 고위험 editor 기능 회귀
            → M6 asset/test/document 정리
              → M7 jQuery 4 전환 준비
```

Class와 event 기반 계층이 안정되기 전에 TableEditor나 WYSIWYG 파일을 대규모로 치환하지 않는다. 반대로 Jindo asset 삭제는 모든 runtime reference, test import, public document 전환이 끝난 마지막 단계에 수행한다.
