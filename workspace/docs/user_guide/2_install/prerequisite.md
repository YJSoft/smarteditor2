## 설치 전 확인 사항

SmartEditor2을 설치하기 전에 다음과 같은 사항을 확인한다.

#### HTML DOCTYPE {#html-doctype}

SmartEditor2는 표준 HTML 문서에서 사용한다. Internet Explorer 호환 모드는 지원하지 않는다.

#### 파일 인코딩 {#-0}

SmartEditor2에서 제공하는 JavaScript, CSS, HTML 코드는 모두 UTF-8 BOM(Byte Order Mark)으로 인코딩되었다.

#### 에디터 도메인 {#-1}

에디터를 설치하는 서비스의 도메인과 에디터의 도메인이 일치해야 에디터의 기능이 정상적으로 동작한다. 에디터의 도메인을 설정하는 방법은 &quot;[2.0 버전 설치](setting.md)&quot;와 &quot;[0.3.x 버전에서 업그레이드](upgrade.md)&quot;에서 설명한다.

#### jQuery

SmartEditor2 배포물은 jQuery 3.7.1을 포함하며 각 skin iframe에서 직접 로드한다. 설치하는 페이지가 별도의 jQuery를 사용해도 SmartEditor2는 host page의 `$` 또는 `window.jQuery`에 의존하지 않는다.
