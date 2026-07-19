# SmartEditor2 Jindo 의존성 분석 및 jQuery 전환 기준

## 1. 문서 목적

이 문서는 SmartEditor2 저장소에 포함된 Jindo 및 Jindo Component 의존성의 실제 범위를 정리하고, 특정 CMS에 종속되지 않는 범용 jQuery 기반 SmartEditor2로 전환하기 위한 원칙을 정의한다.

분석 대상은 다음과 같다.

- `workspace/src`의 런타임 소스와 번들 진입점
- `workspace/static`의 스킨, 서비스 스크립트, 포함 라이브러리
- `workspace/test`의 테스트와 테스트 헬퍼
- README, 사용자 가이드, 개발자 가이드
- 저장소에 포함된 `jindo2.all.js`, `jindo_component.js`
- 참고 upstream인 `naver/jindojs-jindo`, `naver/jindojs-jc`, `naver/jindojs-jmc`

이 문서는 구현 전 분석 결과이며, 실제 작업 순서는 [Jindo 제거 및 jQuery 전환 Task List](./jindo-to-jquery-task-list.md)를 따른다.

## 2. 확정된 전환 정책

### 2.1 브라우저 정책

- Internet Explorer 계열은 지원하지 않는다.
- IE8 전용 코드, HTML, 빌드 옵션과 문서는 동작 보존 대상에서 제외한다.
- 빌드 target은 현재 유지보수되는 evergreen browser를 기준으로 한다.
- Internet Explorer만을 위한 분기는 원칙적으로 제거한다.
- 브라우저 종류를 판별해 분기하기보다 Selection, Range, Pointer Event 등 실제 기능의 존재 여부를 검사한다.

### 2.2 jQuery 정책

- 초기 개발·배포 기준은 jQuery 3.7.1이다.
- SmartEditor2 배포물에 jQuery 3.7.1을 포함하여 특정 host framework의 전역 jQuery에 의존하지 않는다.
- 향후 jQuery 4.x로 전환할 때 변경 범위를 줄일 수 있어야 한다.
- 신규 코드에서는 jQuery 4 전환에 불리한 deprecated API를 사용하지 않는다.
  - `$.proxy()` 대신 `Function.prototype.bind()` 사용
  - `$.trim()` 대신 `String.prototype.trim()` 사용
  - `.bind()`, `.unbind()`, `.delegate()` 같은 구형 이벤트 API 대신 `.on()`, `.off()` 사용
  - jQuery 내부 selector 동작이나 비공개 프로퍼티에 의존하지 않기
- jQuery Migrate는 향후 jQuery 4 전환 시 검증 도구로 사용할 수 있지만, SmartEditor2의 정상 동작을 위한 상시 런타임 의존성으로 만들지는 않는다.

### 2.3 대체 구현 정책

Jindo API 전체에 jQuery 일대일 대응물이 있는 것은 아니다. 최종 구조는 다음 원칙을 따른다.

- DOM 탐색, DOM 조작, 브라우저 이벤트, Ajax: jQuery 3.x
- 클래스 생성, 배열과 객체 처리, 기능 탐지, 쿠키: 표준 JavaScript 또는 프로젝트 내부 유틸리티
- 객체 단위 custom event와 option 관리: 작은 프로젝트 내부 Component 구현
- drag와 동적 script loading: SmartEditor2 사용 범위에 맞춘 작은 프로젝트 내부 구현
- Jindo 이름과 전역 객체를 흉내 내는 영구 compatibility layer는 만들지 않는다.
- 단계적 전환에 임시 adapter가 필요하다면 제거 조건과 제거 task를 함께 둔다.

## 3. 요약 결론

Jindo는 SmartEditor2의 주변 유틸리티가 아니라 클래스, 이벤트, DOM 조작과 브라우저 호환성의 기반 계층이다.

아래 정량 값은 전환 작업을 시작하기 전 기준이다. 현재 진행 상태는 Task List의 migration guard 상한으로 추적한다.

- `workspace/src` JavaScript 72개 중 59개 파일이 활성 코드에서 `jindo.*`를 직접 참조한다.
- 번들 진입점 5개와 언어팩 5개를 제외한 실질 기능 모듈은 62개이며, 이 중 59개인 약 95.2%가 Jindo를 직접 사용한다.
- 주석을 제외한 활성 코드의 `jindo.*` 참조는 746곳이다.
- 49개 파일에서 `jindo.$Class`가 사용되며 클래스 생성 지점은 53곳이다.
- `HuskyCore.registerBrowserEvent()` 호출은 93곳이다.
- 22개 파일이 Jindo event wrapper의 `element`, `key()`, `pos()`, `stop()` 등의 규약을 직접 소비한다.
- Jindo Component 런타임 사용은 `Component`, `DragArea`, `LazyLoading` 세 종류로 제한된다.
- Jindo Mobile Component의 `jindo.m.*` 사용은 없다.

따라서 DOM API부터 파일별로 치환하는 방식보다 클래스와 이벤트 경계를 먼저 분리하고, 이후 기능군별로 전환해야 한다.

## 4. 포함 라이브러리와 로딩 구조

### 4.1 포함된 버전

저장소가 사용하는 Jindo는 upstream 최신판이 아니라 SmartEditor 전용 커스텀 빌드다.

| 파일 | 내부 버전/구성 | 크기 |
| --- | --- | ---: |
| [`jindo2.all.js`](../../static/js/lib/jindo2.all.js) | `1.5.2-SMART_EDITOR` | 105,871 bytes |
| [`jindo_component.js`](../../static/js/lib/jindo_component.js) | 19개 JC 컴포넌트 포함 | 70,132 bytes |
| 합계 | minified 배포 코드 | 176,003 bytes |

upstream Jindo 최신 문서만 기준으로 치환하면 SmartEditor 전용 patch와 오래된 API 동작을 놓칠 수 있다. 회귀 테스트의 기준은 저장소에 포함된 두 파일의 실제 동작이어야 한다.

### 4.2 런타임 로딩

다음 7개 HTML이 Jindo core와 component를 전역 script로 로드한다.

- `workspace/static/index.html`
- `workspace/static/SmartEditor2Skin.html`
- `workspace/static/SmartEditor2Skin_ko_KR.html`
- `workspace/static/SmartEditor2Skin_en_US.html`
- `workspace/static/SmartEditor2Skin_ja_JP.html`
- `workspace/static/SmartEditor2Skin_zh_CN.html`
- `workspace/static/SmartEditor2Skin_zh_TW.html`

전환 기간의 로딩 순서는 jQuery 3.7.1, Jindo core, Jindo Component, 설정과 creator, `smarteditor2.js` 순서다. Webpack이 Jindo를 module dependency로 묶는 구조가 아니라 `CopyWebpackPlugin`이 `workspace/static` 전체를 배포물로 복사한다. jQuery는 npm 개발 의존성의 `dist/jquery.min.js`를 배포물의 `js/lib/jquery.min.js`로 복사한다.

[`SE2BasicCreator.js`](../../static/js/service/SE2BasicCreator.js)는 Jindo 존재 여부를 검사하고 `$`, `$$`를 사용한다. 따라서 `workspace/src` 전환만으로는 Jindo를 제거할 수 없다.

### 4.3 iframe 런타임 경계

SmartEditor2는 host page에서 skin iframe을 만들고, 실제 편집기 코드와 DOM은 iframe window에서 실행된다. host page에 jQuery가 존재하더라도 iframe에 동일한 `window.jQuery`가 자동으로 생기는 것은 아니다.

범용 배포물은 다음 계약을 사용한다.

- 각 skin iframe이 SmartEditor2 배포물의 `js/lib/jquery.min.js`를 직접 로드한다.
- 편집기 내부 코드는 iframe 자신의 `window.jQuery`를 사용한다.
- host page의 `$`, `window.jQuery` 또는 특정 CMS adapter에 의존하지 않는다.
- 모든 locale skin과 standalone demo가 같은 런타임 구성을 사용한다.

이 방식은 jQuery가 기준으로 삼는 window/document를 편집기 DOM과 일치시키고, host application의 jQuery plugin이나 전역 설정과 SmartEditor2를 격리한다.

## 5. API 사용 인벤토리

활성 코드의 root API 참조 수는 다음과 같다.

| Jindo API | 참조 수 | 주 사용 영역 | 권장 대체 |
| --- | ---: | --- | --- |
| `jindo.$$` | 176 | selector, 단일/복수 DOM 탐색 | jQuery `.find()`, `.children()`, `.get()` |
| `jindo.$Element` | 163 | style, class, 크기, 위치, DOM 삽입/삭제 | jQuery 객체와 raw DOM API |
| `jindo.$Fn` | 161 | context bind, 이벤트 attach/detach | native `bind`, jQuery `.on()`/`.off()` |
| `jindo.$Agent` | 82 | 브라우저·OS 분기 | 기능 탐지와 중앙 환경 정보 |
| `jindo.$Class` | 53 | Husky plugin과 range 클래스 | 프로젝트 class helper 또는 native class |
| `jindo.$A` | 45 | 배열 순회와 필터링 | native Array API |
| `jindo.$` | 31 | ID 조회, HTML element 생성 | `getElementById`, `createElement`, jQuery |
| `jindo.$H` | 6 | hash 순회와 역검색 | Object 또는 `Map` |
| `jindo.$Ajax` | 6 | XHR 1곳, JSONP 5곳 | `$.ajax()` |
| `jindo.$Event` | 5 | native event wrapping | jQuery Event 또는 내부 event adapter |
| `jindo.$S` | 4 | trim, tag 제거 | native String과 DOM parsing |
| `jindo.$Document` | 4 | scroll position, viewport size | jQuery/window/document API |
| `jindo.$Cookie` | 2 | 리사이저 안내 상태 | cookie helper |
| `jindo.Component` | 2 | ColorPicker, ColorPalette | 내부 option/custom-event base |
| `jindo.cssquery` | 2 | 단일 selector | jQuery selector |
| `jindo.$Date` | 1 | timestamp | `Date.now()` |
| `jindo.$Json` | 1 | XML 변환 결과 wrapper | plain object |
| `jindo.DragArea` | 1 | QuickEditor drag | 내부 drag controller |
| `jindo.LazyLoading` | 1 | lazy bundle 실행 | cached script loader |

디렉터리별 참조 수는 다음과 같다.

| 영역 | Jindo 참조 수 | 직접 참조 파일 수 |
| --- | ---: | ---: |
| `fundamental` | 527 | 36 |
| `util` | 70 | 10 |
| `quick_editor` | 39 | 2 |
| `husky_framework` | 32 | 4 |
| `common` | 31 | 1 |
| `extra` | 20 | 3 |
| `shortcut` | 18 | 2 |
| `undo_redo` | 9 | 1 |

## 6. 핵심 결합 지점

### 6.1 `$Class`와 Husky plugin 모델

대부분의 plugin은 다음 형태다.

```javascript
nhn.husky.PluginName = jindo.$Class({
    $init: function () {},
    $ON_MESSAGE: function () {}
});
```

필요한 호환 동작은 다음과 같다.

- `new` 호출 시 `$init` 자동 실행
- prototype method 유지
- `instanceof`가 정상 동작하는 상속
- lazy script가 기존 prototype에 method를 추가하는 `HuskyCore.mixin()`
- 이미 생성된 plugin instance에 lazy handler 추가
- message map 갱신

분석 당시 [`HuskyCore.js`](../../src/husky_framework/HuskyCore.js)의 mixin은 Jindo 내부 필드인 `_$superClass`까지 검사했다. [`HuskyRange.js`](../../src/husky_framework/HuskyRange.js)는 `nhn.HuskyRange`가 `nhn.W3CDOMRange`를 상속한다.

소스에는 직접적인 `this.$super` 호출이나 `$static` 정의가 없으므로 Jindo의 복잡한 `$super` 문자열 재작성과 `eval` 동작까지 복제할 필요는 없다.

전환용 내부 API인 [`HuskyClass.js`](../../src/husky_framework/HuskyClass.js)는 다음 범위만 제공한다.

- `$init`을 부모에서 자식 순서로 자동 실행
- 실제 prototype chain을 사용하는 `.extend()`와 정상적인 `instanceof`
- `new`를 생략한 기존 호출 방식 허용
- class의 `$static` 값과 부모 static 값 복사
- `$super` rewriting, `eval`, Jindo 내부 필드는 제공하지 않음

이 helper는 Jindo compatibility shim이 아니라 기존 object-literal Husky plugin 형식을 보존하는 프로젝트 내부 class factory다. 53개 class 생성 지점이 모두 전환되었고, `HuskyCore.mixin()`의 `_$superClass` 예외 처리도 제거되었다. `ColorPicker`와 `ColorPalette`의 부모인 `jindo.Component`는 Component 전환 단계까지 임시로 유지한다.

### 6.2 `$Fn`, `$Event`, `registerBrowserEvent`

`HuskyCore.registerBrowserEvent()`가 editor plugin 이벤트의 중심 경계다. 분석 당시에는 일부 파일이 `$Fn.attach()`를 직접 사용했으므로 중앙 경계와 직접 등록 지점을 함께 전환해야 했다.

현재 plugin이 기대하는 event API는 다음과 같다.

- `element`: 실제 event target
- `currentElement`: handler가 연결된 element
- `relatedElement`
- `key()`: keyCode와 modifier 정보
- `mouse()`: mouse button 정보
- `pos()`: client/page/layer 좌표
- `stop()`, `stopDefault()`, `stopBubble()`
- `$value()`: 원본 native event

jQuery Event의 대응값은 `target`, `currentTarget`, `relatedTarget`, `pageX`, `pageY`, `preventDefault()`, `stopPropagation()`, `originalEvent` 등이다. 이름과 반환 형태가 다르므로 전환 기간에는 Husky plugin용 event adapter를 두는 것이 안전하다.

전환용 내부 API인 [`HuskyEvent.js`](../../src/husky_framework/HuskyEvent.js)는 위 규약과 원본 event를 제공한다. jQuery Event의 공개 필드와 메서드만 사용하며 jQuery private field에는 의존하지 않는다. `HuskyCore.registerBrowserEvent()`는 iframe 자신의 `window.jQuery`로 `.on()`을 호출하고, 반환된 등록 핸들의 `detach()`가 같은 함수 참조로 `.off()`를 수행한다. 일반 element, document, iframe body와 iframe document에 대한 연결, 지연 dispatch와 해제 동작을 테스트한다.

현재 HuskyCore에는 editor 전체를 폐기하는 destroy lifecycle이 없다. 따라서 기존 lifetime을 유지하면서 등록별 `detach()` 핸들만 제공한다. 향후 destroy API를 추가할 때는 이 핸들을 core가 수집해 일괄 해제하는 방식으로 확장하고, 전역 event registry는 만들지 않는다.

MIG-024에서 event가 아닌 callback의 `$Fn.bind()`는 native `Function.prototype.bind()`로, 중앙 경계 밖 browser event는 `HuskyEvent.createHandler()`와 jQuery `.on()`/`.off()`로 전환했다. attach와 detach가 같은 handler reference를 사용하도록 정리했으며, 지원하지 않는 IE 전용 direct event 경로는 제거했다. MIG-025에서는 browser·OS capability를 [`BrowserCapabilities.js`](../../src/husky_framework/BrowserCapabilities.js)로 중앙화해 `$Agent` 호출을 제거했다. MIG-035/036에서는 Array/Hash wrapper를 native Array와 `Object.create(null)` 자료구조로 전환했다. 활성 runtime source와 service의 `jindo.$Fn`, `jindo.$Agent`, `jindo.$A`, `jindo.$H` 참조는 0개이고 migration guard가 재도입을 금지한다.

### 6.3 selector 차이

`jindo.$$`에는 기계적으로 `$()`로 바꿀 수 없는 사용이 있다.

- context 바로 아래를 찾는 선행 `>` selector가 활성 코드에 14곳 존재
- Jindo 문법인 `p:empty()` 사용
- `oneTimeOffCache` 옵션 사용
- 배열 반환과 단일 element 반환의 구분

선행 `>` selector는 `.children()` 또는 명확한 `.find()` 조합으로 바꾸고, `p:empty()`는 jQuery의 `p:empty`로 바꿔야 한다. `oneTimeOffCache`는 제거하되 해당 코드가 selector cache 무효화에 의존하지 않는지 DOM 변경 직후 테스트한다.

### 6.4 `$Element` 의미 차이

주요 사용 method는 `css`, `width`, `height`, `offset`, class 조작, `attr`, `html`, `appendTo`, `leave`, `empty`, `visible`, `opacity`, `child`, `isChildOf` 등이다.

주의할 차이는 다음과 같다.

- `jindo.$()`는 raw DOM을 반환하지만 jQuery `$()`는 collection을 반환한다.
- `$Element.$value()`는 raw DOM을 반환하며 jQuery에서는 `.get(0)`에 해당한다.
- Jindo `offset(top, left)` setter는 jQuery `.offset({top, left})`와 signature가 다르다.
- width/height가 content, border, hidden element에서 반환하는 값이 같은지 확인해야 한다.
- iframe document의 element를 parent window 기준으로 계산하지 않도록 owner document를 보존해야 한다.
- `leave()`, `replace()`, `child(callback)`은 단순 이름 치환이 불가능하다.

### 6.5 `$Agent`와 legacy browser 분기

분석 당시 `$Agent` 호출 82곳은 대부분 IE, Firefox, Chrome, Safari와 macOS 분기였다. jQuery에는 `$Agent` 또는 `$.browser` 대체 기능이 없으므로, 현재는 [`BrowserCapabilities.js`](../../src/husky_framework/BrowserCapabilities.js)가 user agent를 한 번만 분석해 필요한 플래그와 OS 정보를 제공한다. runtime source와 service의 `$Agent` 호출은 모두 제거되었다.

분기 처리 원칙은 다음과 같다.

1. IE8 이하 전용 코드는 제거한다.
2. Internet Explorer 전용 workaround도 제거 후보로 분류한다.
3. selection/range처럼 동작 차이가 남는 영역은 browser name 대신 API 존재 여부와 실제 capability를 검사한다.
4. macOS 단축키처럼 플랫폼 의미가 남는 경우에만 작은 중앙 환경 객체를 사용한다.
5. 각 파일이 직접 user agent를 다시 parsing하지 않도록 한다.

### 6.6 Array와 Hash wrapper

MIG-035에서 `$A` 사용부는 native Array와 `Array.from()`으로 전환했다. 기존 코드가 의존하던 다음 동작은 전환 시 명시적인 흐름과 표준 메서드로 대체했다.

- `$A.Break()`와 `$A.Continue()`
- `.refuse()`
- `.has()`
- `.length(newLength)`
- `._array` 직접 접근
- filter 결과에서 `$value()` 호출

MIG-036에서 `$H`는 제거했다. Shortcut은 `Object.keys()` 순회로, [`hp_PopupManager.js`](../../src/util/hp_PopupManager.js)의 plugin/window registry는 prototype 없는 plain object와 명시적인 value-to-key 검색으로 전환했다.

### 6.7 Ajax와 JSONP

`$Ajax` 6곳은 다음과 같이 나뉜다.

- HTML fragment를 가져오는 XHR 1곳
- QuickEditor 설정 JSONP 2곳
- 최근 색상 JSONP 3곳

Jindo response의 `.json()`과 `.text()`를 사용하므로 jQuery success callback의 첫 번째 인자인 parsed data/text로 호출부를 바꿔야 한다. timeout, error, JSONP callback parameter, cache 정책도 characterization test로 고정한다.

### 6.8 Jindo Component

포함 번들에는 19개 컴포넌트가 있지만 내부 런타임에서 사용하는 것은 세 종류다.

| 컴포넌트 | 사용 위치 | 필요한 동작 |
| --- | --- | --- |
| `Component` | ColorPicker, ColorPalette | option, attach, custom event, fireEvent |
| `DragArea` | QuickEditor lazy | dragStart, beforeDrag, dragEnd, 경계 제한 |
| `LazyLoading` | HuskyCore | script 실행, 완료 callback, 순차 로딩 |

`Component`는 전체 JC를 유지할 이유가 없을 정도로 사용 범위가 작다. `DragArea`도 QuickEditor 한 곳의 옵션과 세 이벤트만 보존하면 된다.

`LazyLoading`은 script가 단순히 내려받아지는 것뿐 아니라 전역 context에서 실행된 뒤 `HuskyCore.mixin()`이 완료된 상태에서 callback이 호출되어야 한다. 중복 요청 방지, 순서, cache, error 처리를 명시해야 한다.

### 6.9 JMC

`jindo.m`, JMC class, JMC asset의 런타임·테스트·문서 참조는 발견되지 않았다. JMC는 이번 마이그레이션 구현 범위가 아니다.

## 7. 가장 위험한 파일

직접 참조 수 기준 hotspot은 다음과 같다.

| 파일 | 참조 수 | 주요 위험 |
| --- | ---: | --- |
| `hp_SE2M_TableEditor$Lazy.js` | 98 | table 좌표, selector, drag/resize, iframe |
| `hp_SE2M_FindReplacePlugin$Lazy.js` | 43 | layer 좌표, event, iframe |
| `hp_SE_EditingArea_WYSIWYG.js` | 42 | iframe, selection, paste/drop, browser 분기 |
| `hp_SE2M_QuickEditor_Common$Lazy.js` | 32 | DragArea, layer 좌표, JSONP |
| `hp_SE2M_Toolbar.js` | 31 | event delegation, selector, layer 배치 |
| `hp_SE2M_Utils.js` | 29 | 공용 DOM/array/string helper |
| `hp_SE2M_ColorPalette.js` | 28 | Component, custom event, JSONP |

참조 수가 상대적으로 적어도 [`HuskyRange.js`](../../src/husky_framework/HuskyRange.js)는 Selection/Range와 실제 상속을 처리하므로 최고 위험 영역으로 취급한다.

## 8. 테스트와 문서 의존성

### 8.1 테스트

- 테스트 파일 11개 중 9개가 `jindo2.all.js`를 직접 import한다.
- 5개가 `jindo_component.js`도 import한다.
- 분석 당시 `HuskyCore.test.js`는 `$Event` instance, `$Class.extend`, `LazyLoading.load` 구현을 직접 단언했다. 현재 `$Event`와 `$Class` assertion은 내부 Husky API의 동작 assertion으로 전환되었고, `LazyLoading` assertion은 남아 있다.

기존 테스트는 Jindo 제거 후 단순 import 수정으로 끝나지 않는다. 외부 구현 객체를 단언하는 테스트를 SmartEditor2가 제공해야 하는 동작 중심으로 다시 작성해야 한다.

### 8.2 공개 문서와 확장 API

README, CHANGELOG, 사용자 문서 중 15개 파일이 Jindo를 언급한다.

- plugin 작성 가이드가 `jindo.$Class`와 `cssquery`를 확장 규약으로 안내한다.
- 사진 업로더 문서가 `jindo.FileUploader`, `$Ajax`, `$Fn` 사용을 안내한다.
- 배포물에는 내부에서 사용하지 않는 JC 컴포넌트도 전역으로 노출된다.

따라서 Jindo script 제거는 기존 사용자 plugin이나 문서 기반 custom code를 깨뜨릴 수 있는 공개 호환성 변경이다. 릴리스 노트와 plugin migration guide가 필요하며, 버전 정책상 breaking change로 다뤄야 한다.

## 9. 빌드 도구 영향

분석 당시 Webpack Babel rule은 `bundle/*.js`에만 적용되고 target은 IE8이었다. 전체 소스를 ES class나 최신 문법으로 변경하려면 loader 범위를 `workspace/src`로 넓히고 evergreen browser 기준으로 Babel target을 다시 정의해야 한다.

필수 변경 후보는 다음과 같다.

- Babel target에서 IE8 제거
- UglifyJS `ie8: true` 제거
- IE8 전용 input area와 문서 제거
- 전체 source transpilation 여부 결정
- npm jQuery 자산이 모든 skin 배포 경로에 포함되는지 검증
- Jindo 정적 파일이 `dist`에 복사되지 않도록 제거

## 10. 목표 구조

완료 시 런타임 의존성 구조는 다음을 목표로 한다.

```text
jQuery 3.7.1
├── DOM selection/manipulation
├── browser event binding
└── Ajax/JSONP

SmartEditor2 internal runtime
├── Husky class construction/inheritance
├── Husky event adapter
├── browser capability information
├── object custom event/options
├── QuickEditor drag controller
└── cached lazy script loader
```

다음 조건을 모두 만족하면 Jindo 의존성 제거가 완료된 것으로 본다.

- 런타임 source와 service script에 `jindo.*` 참조가 없다.
- skin HTML이 Jindo script를 로드하지 않는다.
- `jindo2.all.js`, `jindo_component.js`가 배포물에 포함되지 않는다.
- 테스트가 Jindo 파일이나 Jindo instance를 import/단언하지 않는다.
- 사용자 문서가 신규 plugin에 Jindo 사용을 안내하지 않는다.
- 배포물에 포함된 jQuery 3.7.1에서 editor 주요 기능과 lazy 기능이 통과한다.
- jQuery 4에서 제거되는 deprecated API를 신규 코드가 사용하지 않는다.
- jQuery Migrate 없이 jQuery 3.x에서 정상 동작한다.

## 11. 참고 자료

- [Jindo upstream](https://github.com/naver/jindojs-jindo)
- [Jindo Component upstream](https://github.com/naver/jindojs-jc)
- [Jindo Mobile Component upstream](https://github.com/naver/jindojs-jmc)
- [NAVER Jindo to jQuery 가이드](https://naver.github.io/jindo-to-jquery/)
- [jQuery browser support](https://jquery.com/browser-support/)
- [jQuery support policy](https://jquery.com/support/)
- [jQuery 3.0 upgrade guide](https://jquery.com/upgrade-guide/3.0/)
