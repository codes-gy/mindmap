(window.MINDMAP_X = window.MINDMAP_X || {})['spring-12'] = {
  groups: {
    'HTTP 클라이언트': { cmp: {
      cols: ['기준', 'RestTemplate', 'RestClient', 'WebClient', 'HTTP Interface (@HttpExchange)', 'OpenFeign'],
      rows: [
        ['방식', '동기 · 블로킹', '동기 · 블로킹', '논블로킹 · 리액티브', '선언형 (하위 클라이언트 따름)', '선언형 · 동기'],
        ['API 스타일', '오버로드 메서드', '플루언트 체이닝', '플루언트 체이닝', '인터페이스 + 애너테이션', '인터페이스 + MVC 애너테이션'],
        ['도입 · 상태', '3.0, 유지보수 모드', '6.1, 권장', '5.0, 활발', '6.0, 권장', 'Spring Cloud, 기능 완료'],
        ['추가 의존성', '없음 (spring-web)', '없음 (spring-web)', 'spring-webflux', '없음', 'spring-cloud-starter-openfeign'],
        ['적합한 경우', '기존 코드 유지', 'MVC 동기 호출 기본', '대량 동시 호출, 리액티브 스택', '여러 엔드포인트를 가진 외부 API', '기존 Spring Cloud 프로젝트']
      ]
    } },
    '외부 API 에러 처리': { cmp: {
      cols: ['기준', '외부 API 오류 응답 처리', '외부 API 예외 변환'],
      rows: [
        ['관심사', 'HTTP 응답을 예외로 바꾸는 시점과 방법', '예외를 어떤 도메인 의미로 분류할지'],
        ['주요 도구', 'onStatus, defaultStatusHandler, ErrorDecoder', '예외 계층, @RestControllerAdvice, ProblemDetail'],
        ['결과', '호출 지점에서 예외 발생', '재시도 · 서킷 · 응답 정책이 타입으로 결정']
      ]
    } },
    'Resilience4j 보조 모듈': { cmp: {
      cols: ['기준', 'Resilience4j Retry', 'Resilience4j RateLimiter', 'Resilience4j Bulkhead', 'Resilience4j TimeLimiter'],
      rows: [
        ['막는 문제', '일시적 실패', '호출 한도 초과', '동시 호출로 인한 자원 고갈', '끝나지 않는 비동기 호출'],
        ['제한 기준', '시도 횟수 · 간격', '주기당 호출 수', '동시 실행 수 · 스레드', '실행 시간'],
        ['초과 시 예외', '마지막 원래 예외', 'RequestNotPermitted', 'BulkheadFullException', 'TimeoutException'],
        ['주요 설정', 'maxAttempts, waitDuration', 'limitForPeriod, limitRefreshPeriod', 'maxConcurrentCalls, maxWaitDuration', 'timeoutDuration, cancelRunningFuture'],
        ['기본 순서 위치', '가장 바깥', 'CircuitBreaker 안쪽', '가장 안쪽', 'Bulkhead 바깥']
      ]
    } },
    'Spring Retry': { cmp: {
      cols: ['기준', '@Retryable', 'Resilience4j Retry'],
      rows: [
        ['라이브러리', 'spring-retry', 'resilience4j-spring-boot3'],
        ['설정 위치', '주로 애너테이션 속성', 'application.yml 인스턴스별 설정'],
        ['복구 메서드', '@Recover', 'fallbackMethod'],
        ['함께 쓰는 기능', '재시도 중심', 'CircuitBreaker, RateLimiter, Bulkhead와 조합'],
        ['메트릭', '직접 구성', 'Micrometer 메트릭 자동 제공']
      ]
    } },
    '연결 관리 · 인터셉터': { cmp: {
      cols: ['기준', 'ClientHttpRequestFactory', 'HTTP 커넥션 풀', 'HTTP 클라이언트 인터셉터'],
      rows: [
        ['역할', '하위 HTTP 라이브러리 선택', 'TCP·TLS 연결 재사용', '요청·응답 공통 처리'],
        ['대표 구현·설정', '`HttpComponentsClientHttpRequestFactory`', '`maxTotal`, `maxPerRoute`', '`ClientHttpRequestInterceptor`'],
        ['설정 위치', '`RestClient.Builder#requestFactory`', 'HttpClient 5 연결 관리자', '`requestInterceptor()`'],
        ['주의점', '구현마다 풀·타임아웃 다름', 'HttpClient 5 기본 라우트당 5개', '본문 로깅 시 버퍼링 필요']
      ]
    } },
    'Resilience4j 서킷 브레이커': { cmp: {
      cols: ['기준', 'Resilience4j CircuitBreaker', 'CircuitBreaker 상태 전이', 'Resilience4j fallback'],
      rows: [
        ['역할', '실패율 기반 호출 차단', '상태별 호출 허용 규칙', '실패·차단 시 대체 응답'],
        ['핵심 설정', '`failureRateThreshold`, 윈도우 크기', '`waitDurationInOpenState`', '`fallbackMethod` 속성'],
        ['동작 시점', '호출 결과 집계 시', '임계 초과·대기 시간 경과', '예외 또는 `CallNotPermittedException`'],
        ['주의점', '`minimumNumberOfCalls` 전엔 판단 보류', 'HALF_OPEN 허용 호출 수 제한', '같은 시그니처 + 예외 파라미터']
      ]
    } },
    '재시도 안전성': { cmp: {
      cols: ['기준', '재시도와 멱등성', 'Idempotency-Key'],
      rows: [
        ['성격', '설계 원칙', '구현 패턴'],
        ['해결하는 문제', '재시도 시 중복 처리', '비멱등 POST의 중복 실행'],
        ['핵심 방법', '멱등한 연산만 재시도', '키별 처리 결과 저장·재사용'],
        ['적용 대상', 'GET·PUT·DELETE (멱등)', '결제·주문 생성 API'],
        ['주의점', '타임아웃이 실제론 성공일 수 있음', '동시 요청 시 키 선점 락 필요']
      ]
    } }
  },
  items: {
    'RestTemplate': {
      why: '레거시 코드에 널리 쓰여 여전히 마주치지만 유지보수 모드라는 점을 알고 새 코드에서는 RestClient를 고르기 위해서다.',
      ans: 'RestTemplate은 스프링의 오래된 동기 HTTP 클라이언트로, 현재는 새 기능이 추가되지 않는 유지보수 모드입니다. 동작에는 문제가 없지만 오버로드 메서드가 많아 읽기 어렵고, 스프링 6.1부터는 같은 동기 방식의 RestClient가 후속으로 권장됩니다. 그래서 기존 코드는 유지하되 새 코드는 RestClient로 쓰고, RestClient.create(restTemplate)으로 점진적으로 옮깁니다.',
      use: [
        '레거시 서비스의 RestTemplate 빈을 그대로 RestClient.create()에 넘겨 인터셉터와 타임아웃 설정을 재사용하며 호출부만 교체한다.',
        '`new RestTemplate()`으로 만든 곳을 `RestTemplateBuilder`로 바꿔 타임아웃과 메트릭을 적용한다.'
      ],
      myth: [['RestTemplate은 deprecated되어 당장 쓰면 안 된다.', '스프링 6.x에서는 유지보수 모드일 뿐 deprecated가 아니다. 다만 신규 코드에는 RestClient가 권장되고, 향후 deprecated 예정이 공지되었다.']],
      fq: [['RestTemplate은 WebClient로 대체해야 하나요?', '꼭 그렇지 않습니다. 동기 MVC 애플리케이션이라면 리액터 의존성이 필요한 WebClient보다 같은 동기 방식인 RestClient로 옮기는 것이 자연스럽습니다.']]
    },
    'RestClient': {
      ans: 'RestClient는 스프링 6.1에 추가된 동기 HTTP 클라이언트로, WebClient 같은 체이닝 API를 블로킹 방식으로 제공합니다. 부트가 자동 설정한 RestClient.Builder로 서비스별 클라이언트 빈을 만들고, retrieve와 body로 응답을 받으며 onStatus로 오류를 도메인 예외로 바꿉니다. 저는 요청 팩토리에 타임아웃과 커넥션 풀을 명시하는 것을 기본으로 합니다.',
      ana: 'RestTemplate이 기능별 버튼이 잔뜩 달린 리모컨이라면, RestClient는 "누구에게, 무엇을, 어떻게 받을지"를 차례대로 고르는 단계형 메뉴입니다.',
      flow: ['RestClient.Builder 주입', 'baseUrl · 요청 팩토리 설정', 'get() · uri() 요청 구성', 'retrieve()로 전송', 'onStatus 오류 변환', 'body()로 객체 변환'],
      use: [
        '결제, 회원, 재고 서비스마다 baseUrl과 타임아웃이 다른 RestClient 빈을 따로 등록한다.',
        '가상 스레드를 켠 MVC 서비스에서 RestClient로 외부 API를 동기 호출해 코드 단순함과 동시성을 함께 얻는다.',
        '`@RestClientTest`와 MockRestServiceServer로 요청 URL과 오류 처리 로직을 테스트한다.'
      ],
      myth: [['동기 클라이언트는 성능이 나빠서 WebClient를 써야 한다.', '호출 동시성이 아주 높지 않다면 RestClient로 충분하고, 가상 스레드를 쓰면 블로킹 호출의 스레드 비용도 크게 줄어든다.']],
      fq: [
        ['retrieve()와 exchange()는 어떻게 다른가요?', 'retrieve()는 4xx·5xx에 기본 예외를 던지고 본문 변환을 간단히 해 주는 일반적인 방식입니다. exchange()는 요청과 응답을 직접 받아 상태 코드에 따라 자유롭게 분기할 때 쓰며, 기본 상태 처리기가 적용되지 않으므로 오류 처리를 직접 해야 합니다.'],
        ['RestClient.create()로 만들면 무엇이 빠지나요?', '부트가 자동 설정한 빌더를 거치지 않으므로 커스텀 메시지 컨버터, 공통 요청 팩토리 설정, Micrometer 관측이 적용되지 않습니다. 그래서 운영 코드에서는 주입받은 RestClient.Builder로 만듭니다.']
      ]
    },
    'WebClient': {
      why: '외부 API를 많이 호출할 때 스레드를 붙잡지 않고 여러 요청을 병렬로 보내 적은 자원으로 처리하기 위해서다.',
      ans: 'WebClient는 WebFlux의 논블로킹 HTTP 클라이언트로, Mono와 Flux로 응답을 다룹니다. 적은 스레드로 많은 요청을 동시에 보낼 수 있어 여러 외부 API를 병렬로 호출해 합치는 데 유리합니다. MVC에서도 쓸 수 있지만 단순 동기 호출이면 block()을 붙이기보다 RestClient를 씁니다.',
      ana: '식당에서 주문을 넣고 진동벨을 받아 자리로 돌아가는 방식입니다. 기다리는 동안 다른 일을 할 수 있고 음식이 나오면 알림이 옵니다.',
      use: [
        '상품 상세 화면에서 가격, 재고, 리뷰 API를 `Mono.zip()`으로 동시에 호출해 응답 시간을 가장 느린 하나 수준으로 줄인다.',
        'Spring Cloud Gateway 같은 WebFlux 기반 서비스에서 하위 서비스를 호출한다.'
      ],
      myth: [['WebClient를 쓰면 MVC 애플리케이션도 논블로킹이 된다.', '호출 결과를 block()으로 기다리면 요청 스레드는 그대로 블로킹된다. 전체 스택이 리액티브여야 논블로킹 이점이 생긴다.']],
      fq: [['WebClient에서 타임아웃은 어떻게 거나요?', 'Reactor Netty HttpClient에 CONNECT_TIMEOUT_MILLIS 옵션으로 연결 타임아웃을, responseTimeout()으로 응답 타임아웃을 설정합니다. 요청 단위로는 Mono에 timeout() 연산자를 붙일 수도 있습니다.']]
    },
    'HTTP Interface (@HttpExchange)': {
      ans: 'HTTP Interface는 인터페이스에 @GetExchange 같은 애너테이션만 선언하면 스프링이 호출 구현을 프록시로 만들어 주는 선언형 클라이언트입니다. RestClient나 WebClient를 어댑터로 감싸 HttpServiceProxyFactory로 프록시를 만들고 빈으로 등록합니다. Spring Cloud 없이 OpenFeign 같은 편의를 얻을 수 있어 새 프로젝트에서는 이것을 우선 씁니다.',
      ana: '식당 메뉴판과 같습니다. 손님은 메뉴 이름만 고르면 되고, 주방(RestClient)이 실제 요리 과정을 처리합니다.',
      flow: ['인터페이스에 @HttpExchange 선언', 'RestClient 생성', 'RestClientAdapter로 감쌈', 'HttpServiceProxyFactory 생성', 'createClient()로 프록시 빈 등록', '메서드 호출 시 HTTP 요청 전송'],
      use: [
        '외부 결제사 API의 여러 엔드포인트를 `PaymentApi` 인터페이스 하나로 정리해 호출부에서 URI 조립 코드를 없앤다.',
        'OpenFeign으로 만든 클라이언트를 애너테이션만 `@GetExchange`로 바꿔 Spring Cloud 의존성을 제거한다.'
      ],
      myth: [['HTTP Interface는 WebClient가 있어야 쓸 수 있다.', '스프링 6.0에서는 WebClient만 지원했지만 6.1부터 RestClient와 RestTemplate 어댑터가 추가되어 MVC 동기 환경에서도 쓴다.']],
      fq: [
        ['HTTP Interface에 타임아웃이나 오류 처리는 어디서 설정하나요?', '인터페이스는 선언만 담기 때문에 감싸는 RestClient나 WebClient에 설정합니다. 요청 팩토리의 타임아웃, defaultStatusHandler, 인터셉터가 그대로 적용됩니다.'],
        ['메서드마다 다른 응답 헤더나 상태를 확인하려면?', '반환 타입을 ResponseEntity<T>로 선언하면 상태 코드와 헤더를 함께 받을 수 있습니다.']
      ]
    },
    'OpenFeign': {
      why: 'URL 조립, 요청·응답 변환 같은 반복 코드 없이 인터페이스 선언만으로 외부 API 호출을 간결하게 만들기 위해서다.',
      ans: 'OpenFeign은 Spring Cloud가 제공하는 선언형 HTTP 클라이언트로, @FeignClient 인터페이스에 MVC 애너테이션으로 API를 선언합니다. ErrorDecoder로 오류를 도메인 예외로 바꾸고, 클라이언트별 타임아웃과 Resilience4j 연동 fallback을 설정할 수 있습니다. 다만 현재는 기능 완료 상태라 새 프로젝트라면 HTTP Interface도 함께 검토합니다.',
      use: [
        '마이크로서비스 간 호출을 `@FeignClient(name = "member")`로 선언하고 서비스 디스커버리·로드밸런서와 연동한다.',
        '`ErrorDecoder`에서 외부 404를 `MemberNotFoundException`으로, 5xx를 재시도 대상 예외로 바꾼다.'
      ],
      myth: [['Feign은 기본으로 실패 시 재시도해 준다.', 'Spring Cloud OpenFeign의 기본 Retryer는 NEVER_RETRY라 재시도하지 않는다. 필요하면 명시적으로 설정한다.']],
      fq: [['Feign 클라이언트에 fallback을 적용하려면?', 'spring.cloud.openfeign.circuitbreaker.enabled를 켜고 @FeignClient에 fallback 또는 fallbackFactory를 지정합니다. fallbackFactory를 쓰면 원인 예외를 받아 상황별로 다르게 처리할 수 있습니다.']]
    },
    'ClientHttpRequestFactory': {
      why: '코드를 바꾸지 않고 하위 HTTP 라이브러리를 교체해 커넥션 풀과 타임아웃을 상황에 맞게 설정하기 위해서다.',
      ans: 'ClientHttpRequestFactory는 RestClient와 RestTemplate이 실제로 어떤 HTTP 라이브러리로 연결할지를 추상화한 인터페이스입니다. 기본 JDK 구현은 풀 설정이 제한적이라 운영에서는 Apache HttpClient 5 기반 팩토리로 커넥션 풀과 타임아웃을 세밀하게 잡습니다. 부트 3.4부터는 클래스패스를 보고 자동 선택하고 공통 타임아웃 프로퍼티도 제공합니다.',
      ana: '택배 회사에 배송을 맡기는 것과 같습니다. 보내는 방법(RestClient API)은 같아도 어떤 택배사(HTTP 라이브러리)를 쓰느냐에 따라 속도와 옵션이 달라집니다.',
      use: [
        'httpclient5 의존성을 추가해 부트가 `HttpComponentsClientHttpRequestFactory`를 자동 선택하게 하고 풀 크기만 커스터마이징한다.',
        '`spring.http.client.connect-timeout`, `read-timeout`으로 모든 자동 설정 클라이언트의 기본 타임아웃을 한 번에 지정한다.'
      ],
      fq: [['어떤 요청 팩토리가 쓰이고 있는지 어떻게 아나요?', '부트 3.4+는 클래스패스에 있는 라이브러리를 Apache HttpClient, Jetty, Reactor Netty, JDK HttpClient, Simple 순으로 찾아 선택합니다. 확실히 하려면 spring.http.client.factory로 지정하거나 RestClient 빈 생성 시 요청 팩토리를 직접 넣습니다.']]
    },
    'HTTP 커넥션 풀': {
      why: '요청마다 TCP·TLS 연결을 새로 맺으면 핸드셰이크 비용으로 지연 시간과 CPU 사용이 크게 늘기 때문이다.',
      ans: 'HTTP 커넥션 풀은 외부 서버와 맺은 연결을 재사용해 TCP·TLS 연결 비용을 줄이는 장치입니다. Apache HttpClient 5는 기본이 전체 25개, 대상별 5개라 트래픽이 많으면 풀 대기에서 지연이 생기므로 대상별 한도를 늘리고 풀 대기 타임아웃도 둡니다. 상대 쪽이 먼저 끊은 유휴 연결을 재사용하지 않도록 유휴 연결 정리 시간도 상대보다 짧게 설정합니다.',
      ana: '매번 새로 택시를 부르는 대신 회사 셔틀버스를 몇 대 대기시켜 두고 돌려 쓰는 것과 같습니다. 버스가 모자라면 줄을 서야 합니다.',
      flow: ['요청 시 풀에서 연결 대여', '유휴 연결 없으면 새 연결 생성', '한도 초과 시 풀 대기', '요청 · 응답 처리', '연결 반납 (keep-alive)', '유휴 시간 초과 연결 정리'],
      use: [
        '외부 결제 API 응답은 빠른데 피크 시간에만 지연이 생겨 확인해 보니 per-route 5개 한도에서 대기하고 있어 50개로 늘렸다.',
        '로드밸런서 유휴 타임아웃(60초)보다 짧은 30초로 유휴 연결을 정리해 간헐적인 Connection reset 오류를 없앴다.'
      ],
      myth: [['커넥션 풀은 클수록 좋다.', '풀이 너무 크면 상대 서버에 과도한 동시 연결을 만들어 상대를 느리게 하고, 우리 쪽 메모리와 소켓도 낭비한다. 상대 처리 한도와 우리 동시 요청 수에 맞춘다.']],
      fq: [['연결 타임아웃, 읽기 타임아웃 외에 어떤 타임아웃이 더 필요한가요?', '풀에서 연결을 얻기까지 기다리는 connectionRequestTimeout이 필요합니다. 이것이 없으면 풀이 가득 찼을 때 요청 스레드가 오래 묶여 외부 API는 멀쩡한데도 우리 서비스가 느려집니다.']]
    },
    'HTTP 클라이언트 인터셉터': {
      why: '인증 헤더, 로깅, 추적 ID 전파를 호출 코드마다 반복하지 않고 한 곳에서 공통 처리하기 위해서다.',
      ans: 'HTTP 클라이언트 인터셉터는 외부 호출 요청과 응답 사이에 끼어들어 공통 처리를 하는 확장 지점입니다. RestClient는 ClientHttpRequestInterceptor, WebClient는 ExchangeFilterFunction, Feign은 RequestInterceptor를 씁니다. 인증 토큰 추가, 호출 시간 로깅, 추적 ID 전파 같은 일을 호출 코드마다 반복하지 않게 해 줍니다.',
      use: [
        'OAuth2 액세스 토큰을 인터셉터에서 붙이고, 401이면 토큰을 갱신하는 로직을 한곳에 모은다.',
        '외부 호출마다 URL, 상태 코드, 소요 시간을 남겨 느린 API를 찾는다.'
      ],
      myth: [['로그를 남기려면 인터셉터에서 응답 본문을 그냥 읽으면 된다.', '응답 본문은 스트림이라 한 번 읽으면 이후 변환이 실패한다. 버퍼링 팩토리를 쓰거나 본문 로깅은 디버그 환경에 한정한다.']],
      fq: [['분산 추적의 trace ID는 어떻게 외부 호출에 전달되나요?', '부트가 자동 설정한 RestClient.Builder나 WebClient.Builder로 만든 클라이언트에는 Micrometer Observation이 적용되어 traceparent 같은 추적 헤더가 자동으로 붙습니다. 직접 new로 만든 클라이언트에는 적용되지 않습니다.']]
    },
    '외부 API 오류 응답 처리': {
      why: '외부 API의 4xx·5xx와 연결 오류를 구분해 다루지 않으면 재시도 여부나 사용자 응답을 잘못 결정하기 때문이다.',
      ans: 'RestClient는 기본적으로 4xx에 HttpClientErrorException, 5xx에 HttpServerErrorException을 던지고, 연결 실패나 타임아웃은 ResourceAccessException으로 감쌉니다. 저는 클라이언트 빌더의 defaultStatusHandler로 상태 코드 범위별 공통 변환을 두고, 특정 호출에서만 의미가 다른 404 같은 경우는 onStatus로 따로 처리합니다. 이렇게 하면 호출 코드에 try-catch가 흩어지지 않습니다.',
      flow: ['응답 수신', '상태 코드 확인', 'onStatus 처리기 탐색', '없으면 defaultStatusHandler', '없으면 기본 예외 발생', '정상이면 본문 변환'],
      use: [
        '외부 회원 API의 404를 `MemberNotFoundException`으로 바꿔 서비스 계층에서 "없는 회원" 흐름으로 처리한다.',
        '5xx와 ResourceAccessException을 하나의 `ExternalUnavailableException`으로 모아 재시도·서킷 브레이커 대상으로 지정한다.'
      ],
      fq: [['외부 API가 200을 주면서 본문에 오류 코드를 담아 보내면 어떻게 하나요?', 'HTTP 상태로는 오류를 알 수 없으므로 본문을 객체로 받은 뒤 결과 코드를 검사해 도메인 예외로 바꿉니다. Resilience4j Retry라면 retryOnResultPredicate로 결과 기반 재시도 조건을 줄 수도 있습니다.']]
    },
    '외부 API 예외 변환': {
      why: '외부 오류를 그대로 내보내면 내부 구조가 노출되고 외부 404가 우리 404로 잘못 해석되는 등 혼란이 생기기 때문이다.',
      ans: '외부 시스템의 오류를 그대로 전파하지 않고 우리 도메인 예외로 바꿔 다룹니다. 우리 요청이 잘못된 4xx는 재시도해도 소용없는 예외로, 5xx와 타임아웃은 일시적 장애 예외로 나눠 두면 재시도와 서킷 브레이커 설정을 예외 타입 하나로 지정할 수 있습니다. 사용자 응답은 @RestControllerAdvice에서 502나 503 같은 일관된 ProblemDetail로 내려줍니다.',
      ana: '해외 거래처의 다양한 거절 사유를 사내 표준 코드표로 번역해 두는 것과 같습니다. 각 부서는 표준 코드만 보고 대응합니다.',
      use: [
        '외부 결제사의 다양한 오류 코드를 `PaymentDeclinedException`(재시도 불가)과 `PaymentUnavailableException`(재시도 가능)으로 정리한다.',
        '외부 API 장애 시 우리 API는 502 Bad Gateway와 정해진 오류 코드를 반환하고 상세 원인은 로그에만 남긴다.'
      ],
      myth: [['외부 API의 상태 코드를 그대로 전달하는 것이 가장 정확하다.', '외부 404가 우리 API의 404로 나가면 클라이언트는 우리 리소스가 없다고 오해한다. 외부 의존성 실패는 502·503처럼 게이트웨이 성격 코드로 바꾸는 편이 정확하다.']],
      fq: [['서킷 브레이커에서 4xx를 실패로 세면 어떤 문제가 생기나요?', '잘못된 입력이 몰리는 것만으로 서킷이 열려 정상 요청까지 차단됩니다. 그래서 4xx 계열 예외는 ignoreExceptions에 넣어 실패율에서 제외합니다.']]
    },
    'Resilience4j CircuitBreaker': {
      ans: 'Resilience4j CircuitBreaker는 최근 호출의 실패율과 느린 호출 비율을 슬라이딩 윈도우로 집계해, 임계값을 넘으면 OPEN 상태로 바꿔 호출을 즉시 차단합니다. 일정 시간이 지나면 HALF_OPEN에서 시험 호출을 보내 결과에 따라 CLOSED로 복귀하거나 다시 OPEN이 됩니다. 장애 난 외부 서비스 때문에 우리 스레드와 커넥션이 타임아웃까지 묶이는 것을 막는 것이 목적입니다.',
      ana: '집의 누전 차단기와 같습니다. 이상 전류가 감지되면 전원을 내려 집 전체가 타는 것을 막고, 점검 후 다시 올려 봅니다.',
      flow: ['CLOSED에서 호출 결과 기록', '최소 호출 수 충족', '실패율 · 느린 호출 비율 임계값 초과', 'OPEN: 즉시 차단 + fallback', '대기 시간 경과 후 HALF_OPEN', '시험 호출 결과로 CLOSED 또는 OPEN'],
      use: [
        '결제 대행사 장애 시 서킷을 열어 주문은 "결제 대기"로 받아 두고, 복구 후 배치로 결제를 재시도한다.',
        '추천 API 서킷이 열리면 fallback으로 인기 상품 목록을 보여 줘 상품 화면은 정상 동작하게 한다.',
        'Grafana에서 `resilience4j_circuitbreaker_state` 메트릭으로 서킷 상태 변화에 알림을 건다.'
      ],
      myth: [['서킷 브레이커를 붙이면 타임아웃 설정은 필요 없다.', '서킷은 실패가 쌓인 뒤에 열린다. 그 전까지 각 호출을 끊어 주는 것은 타임아웃이고, 느린 호출이 실패로 집계되려면 타임아웃이나 slowCallDurationThreshold가 있어야 한다.']],
      fq: [
        ['COUNT_BASED와 TIME_BASED 슬라이딩 윈도우는 어떻게 고르나요?', 'COUNT_BASED는 최근 N건의 호출로, TIME_BASED는 최근 N초 동안의 호출로 집계합니다. 호출량이 일정하면 COUNT_BASED가 단순하고, 시간대별 트래픽 편차가 크면 TIME_BASED가 최근 상태를 더 잘 반영합니다.'],
        ['서킷이 열렸을 때 클라이언트에는 무엇을 돌려주나요?', 'CallNotPermittedException을 받는 fallback에서 캐시 값이나 대체 응답을 주거나, 기능 특성상 대체가 불가능하면 503과 함께 잠시 후 다시 시도하라는 응답을 줍니다.']
      ]
    },
    'CircuitBreaker 상태 전이': {
      why: '장애 난 외부 서비스에 계속 요청을 보내 스레드가 묶이고 장애가 전파되는 것을 막고, 회복되면 자동으로 되살리기 위해서다.',
      ans: 'Resilience4j 서킷은 CLOSED에서 실패율이 임계값을 넘으면 OPEN, 대기 시간이 지나면 HALF_OPEN, 시험 호출 결과에 따라 CLOSED나 OPEN으로 전이합니다. 이 외에 DISABLED, FORCED_OPEN, METRICS_ONLY 같은 특수 상태가 있어 운영 중 수동으로 강제할 수 있습니다. 상태와 전이 이벤트는 Actuator 엔드포인트와 메트릭으로 확인합니다.',
      flow: ['CLOSED', '임계값 초과 → OPEN', 'waitDurationInOpenState 경과', 'HALF_OPEN 시험 호출', '성공 → CLOSED / 실패 → OPEN'],
      use: [
        '외부 결제사의 정기 점검 시간에 운영자가 서킷을 FORCED_OPEN으로 바꿔 불필요한 호출과 타임아웃을 막는다.',
        '새 설정값을 적용하기 전 METRICS_ONLY로 두고 실제 실패율만 관찰한다.'
      ],
      myth: [['대기 시간이 지나면 서킷은 자동으로 HALF_OPEN이 된다.', '기본값에서는 대기 시간이 지난 뒤 첫 호출이 들어올 때 전이한다. 즉시 전이하려면 automaticTransitionFromOpenToHalfOpenEnabled를 켠다.']],
      fq: [['HALF_OPEN에서 시험 호출이 들어오지 않으면 어떻게 되나요?', '기본으로는 허용된 시험 호출이 모두 끝날 때까지 HALF_OPEN에 머뭅니다. maxWaitDurationInHalfOpenState를 설정하면 그 시간이 지나 자동으로 OPEN으로 돌아갑니다.']]
    },
    'Resilience4j fallback': {
      why: '외부 호출이 실패하거나 차단될 때 사용자에게 에러 대신 기본값이나 캐시된 값으로 응답하기 위해서다.',
      ans: 'Resilience4j fallback은 fallbackMethod로 지정한 대체 메서드로, 호출이 실패하거나 차단될 때 실행됩니다. 같은 클래스에 원래 메서드와 같은 파라미터에 예외 파라미터를 하나 더 붙여 선언하고 반환 타입을 맞춰야 합니다. 예외 타입별로 오버로드하면 가장 가까운 타입이 선택되므로, 서킷 차단과 일반 실패를 구분해 처리할 수 있습니다.',
      ana: '비행기 결항 시 항공사가 미리 정해 둔 대체 항공편 안내와 같습니다. 원래 계획이 안 되면 정해진 차선책으로 넘어갑니다.',
      use: [
        '상품 가격 조회 실패 시 Redis에 캐시해 둔 마지막 가격을 반환하고 "가격 변동 가능" 표시를 붙인다.',
        '알림 발송 실패 시 발송 대기 테이블에 저장해 두고 스케줄러가 나중에 재발송한다.'
      ],
      myth: [['fallback은 모든 실패를 숨겨 주므로 많이 쓸수록 안전하다.', '정확성이 중요한 기능에서 기본값을 돌려주면 장애가 묻히고 잘못된 데이터가 퍼진다. 실패를 명확히 알리는 것이 더 안전한 경우도 많다.']],
      fq: [['fallback 메서드가 호출되지 않는 흔한 원인은?', '시그니처 불일치(파라미터 순서·반환 타입), 같은 클래스 내부 호출로 프록시를 거치지 않은 경우, AOP 의존성 누락이 대표적입니다.']]
    },
    'Resilience4j Retry': {
      ans: 'Resilience4j Retry는 실패한 호출을 정해진 횟수와 간격으로 다시 시도하는 모듈입니다. maxAttempts는 첫 호출을 포함한 총 횟수이고, retryExceptions와 ignoreExceptions로 연결 실패나 503 같은 일시적 장애만 재시도하게 합니다. 재시도는 상대 서버 부하를 늘리므로 지수 백오프와 함께 작은 횟수로 쓰고, 멱등하지 않은 요청은 멱등 키가 있을 때만 재시도합니다.',
      flow: ['호출 실패', '재시도 대상 예외인지 판단', 'waitDuration만큼 대기 (백오프)', '다시 호출', '성공 시 반환', 'maxAttempts 소진 시 예외 또는 fallback'],
      use: [
        '재고 조회 API의 간헐적 연결 끊김을 300ms 간격 최대 3회 재시도로 사용자에게 보이지 않게 처리한다.',
        '외부 API가 200 응답에 "BUSY" 코드를 주는 경우 `retryOnResultPredicate`로 결과 기반 재시도를 한다.'
      ],
      myth: [['maxAttempts가 3이면 첫 호출 후 3번 더 시도한다.', 'maxAttempts는 첫 호출을 포함한 총 시도 횟수라 3이면 재시도는 2번이다.']],
      fq: [
        ['재시도로 인해 응답 시간이 너무 길어지는 것은 어떻게 막나요?', '각 시도의 읽기 타임아웃, 대기 간격, 시도 횟수를 곱해 최악의 응답 시간을 계산하고 사용자 요청 타임아웃 안에 들어오게 맞춥니다. 필요하면 시도 횟수를 줄이고 서킷 브레이커로 빠르게 실패시킵니다.'],
        ['재시도 횟수와 결과는 어떻게 모니터링하나요?', 'resilience4j_retry_calls 메트릭이 재시도 없이 성공, 재시도 후 성공, 재시도 후 실패 등으로 나뉘어 나오므로 재시도 후 성공 비율이 늘면 상대 서비스가 불안정해지는 신호로 봅니다.']
      ]
    },
    'Resilience4j RateLimiter': {
      why: '외부 API 호출 한도를 넘기거나 갑작스러운 요청 폭주로 상대 시스템을 과부하시키는 것을 막기 위해서다.',
      ans: 'Resilience4j RateLimiter는 주기마다 허용 호출 수를 채워 넣고 그 이상은 기다리게 하거나 RequestNotPermitted로 거절합니다. 주로 외부 API의 호출 한도를 넘지 않도록 클라이언트 쪽에서 속도를 맞출 때 씁니다. 인스턴스마다 따로 세기 때문에 여러 서버의 합계를 맞추려면 인스턴스 수로 나누거나 분산 제한을 씁니다.',
      ana: '놀이공원 놀이기구가 회차마다 정원만큼만 태우는 것과 같습니다. 정원이 차면 다음 회차를 기다리거나 돌아가야 합니다.',
      use: [
        '초당 10회 제한이 있는 지도 API 호출에 `limitForPeriod: 10`, `limitRefreshPeriod: 1s`를 걸어 429 응답을 막는다.',
        '배치에서 외부 API를 대량 호출할 때 RateLimiter로 속도를 일정하게 유지한다.'
      ],
      fq: [['서버를 보호하는 Rate Limit과 무엇이 다른가요?', 'Resilience4j RateLimiter는 주로 우리 쪽에서 나가는 호출을 조절하는 클라이언트 측 제한입니다. 우리 API로 들어오는 요청을 막는 서버 측 제한은 보통 게이트웨이나 Redis 기반 분산 제한으로 구현합니다.']]
    },
    'Resilience4j Bulkhead': {
      why: '느려진 외부 서비스 하나가 스레드를 모두 점유해 관련 없는 기능까지 멈추게 하는 것을 막기 위해서다.',
      ans: 'Resilience4j Bulkhead는 특정 외부 호출이 동시에 쓸 수 있는 자원을 제한해, 한 의존성이 느려져도 전체 스레드가 잠식되지 않게 합니다. 기본인 세마포어 방식은 동시 호출 수만 제한하고, 스레드 풀 방식은 별도 풀에서 비동기로 실행합니다. 느린 추천 API가 톰캣 스레드를 모두 묶어 결제까지 멈추는 상황을 막는 데 씁니다.',
      ana: '배의 격벽과 같습니다. 한 칸에 물이 차도 격벽이 막아 배 전체가 가라앉지 않습니다.',
      use: [
        '추천 API에 `maxConcurrentCalls: 20`을 걸어 지연이 생겨도 나머지 180개 톰캣 스레드는 다른 요청을 처리하게 한다.',
        '가상 스레드 환경에서 외부 API 동시 호출 수를 세마포어 Bulkhead로 제한해 상대 서버와 커넥션 풀을 보호한다.'
      ],
      myth: [['Bulkhead와 RateLimiter는 같은 것이다.', 'RateLimiter는 시간당 호출 수를, Bulkhead는 같은 순간의 동시 실행 수를 제한한다. 호출이 느려질 때 자원을 지키는 것은 Bulkhead다.']],
      fq: [['세마포어 Bulkhead와 스레드 풀 Bulkhead는 언제 각각 쓰나요?', '동기 코드에서 동시 실행 수만 제한하면 되면 오버헤드가 적은 세마포어 방식을 씁니다. 호출 스레드와 실행 스레드를 완전히 분리하고 비동기 결과(CompletableFuture)가 필요하면 스레드 풀 방식을 씁니다.']]
    },
    'Resilience4j TimeLimiter': {
      why: '비동기 호출이 끝없이 늘어져 자원을 붙잡고 호출자가 무한정 기다리는 것을 막기 위해서다.',
      ans: 'Resilience4j TimeLimiter는 CompletableFuture나 리액티브 타입 같은 비동기 호출에 최대 실행 시간을 두는 모듈입니다. 시간이 넘으면 TimeoutException으로 실패시키고 Future 취소를 시도합니다. 동기 HTTP 호출은 TimeLimiter가 아니라 HTTP 클라이언트의 연결·읽기 타임아웃으로 제한합니다.',
      use: [
        '여러 외부 조회를 CompletableFuture로 병렬 실행하면서 각각 `@TimeLimiter`로 1초 상한을 둔다.',
        '리액티브 체인에서 TimeLimiterOperator로 느린 하위 호출을 끊고 fallback 값을 낸다.'
      ],
      myth: [['@TimeLimiter를 붙이면 동기 메서드에도 타임아웃이 걸린다.', '반환 타입이 CompletableFuture나 리액티브 타입일 때만 동작한다. 동기 메서드는 HTTP 클라이언트 타임아웃으로 제한한다.']],
      fq: [['TimeLimiter로 타임아웃이 나면 실제 HTTP 요청도 끊기나요?', '반드시 그렇지는 않습니다. Future 취소를 시도할 뿐 블로킹 I/O가 인터럽트에 반응하지 않으면 요청은 계속 진행됩니다. 그래서 HTTP 클라이언트 자체 타임아웃을 함께 설정합니다.']]
    },
    'Resilience4j 애너테이션 순서': {
      why: '적용 순서에 따라 재시도가 서킷 브레이커의 실패 집계에 포함되는지 등 동작이 달라지기 때문이다.',
      ans: 'Resilience4j 애너테이션을 함께 쓰면 기본적으로 Retry가 가장 바깥에서 CircuitBreaker, RateLimiter, TimeLimiter, Bulkhead 순으로 감쌉니다. 애너테이션을 적는 순서가 아니라 각 애스펙트의 order 값으로 결정되며, 프로퍼티로 바꿀 수 있습니다. 이 구조에서는 각 재시도가 서킷에 실패로 집계되므로 CallNotPermittedException은 재시도 대상에서 빼 둡니다.',
      ana: '양파 껍질처럼 바깥 층부터 벗겨 들어갑니다. 가장 바깥의 Retry가 안쪽 전체를 여러 번 다시 실행합니다.',
      flow: ['Retry', 'CircuitBreaker', 'RateLimiter', 'TimeLimiter', 'Bulkhead', '실제 메서드'],
      use: [
        '결제 호출에 Retry, CircuitBreaker, Bulkhead를 함께 걸고 fallback은 CircuitBreaker에만 두어 최종 실패 시 한 번만 실행되게 한다.',
        '서킷이 열려도 재시도가 대기 시간만큼 지연시키던 문제를 `CallNotPermittedException` 무시 설정으로 해결한다.'
      ],
      myth: [['애너테이션을 위에 적은 것이 먼저 실행된다.', '자바 애너테이션 선언 순서는 의미가 없다. 각 애스펙트의 order 값이 실행 순서를 결정한다.']],
      fq: [['안쪽 애너테이션에 fallback을 지정하면 어떤 문제가 생기나요?', '안쪽 애스펙트에서 fallback이 정상 값을 반환하면 바깥 Retry는 성공으로 보고 재시도하지 않고, 서킷도 실패를 집계하지 못할 수 있습니다. 그래서 fallback은 보통 가장 바깥에서 최종 실패를 처리하는 곳 하나에만 둡니다.']]
    },
    '@Retryable': {
      why: '일시적인 네트워크 오류로 실패한 호출을 재시도 코드를 직접 반복해 쓰지 않고 선언적으로 다시 시도하기 위해서다.',
      ans: '@Retryable은 Spring Retry에서 메서드에 붙여 지정한 예외가 나면 선언적으로 재시도하게 하는 애너테이션입니다. @EnableRetry로 켜고 retryFor, maxAttempts, @Backoff로 대상 예외와 횟수, 백오프를 지정합니다. AOP 프록시 기반이라 셀프 호출에는 적용되지 않고, 트랜잭션 안쪽이 아니라 바깥에 두어야 새 트랜잭션으로 다시 시도됩니다.',
      use: [
        '낙관적 락 충돌(`ObjectOptimisticLockingFailureException`) 시 트랜잭션 바깥 메서드에서 `@Retryable`로 다시 시도한다.',
        '외부 API 일시 장애에 `@Backoff(delay = 500, multiplier = 2)`로 지수 백오프 재시도를 건다.'
      ],
      myth: [['@Transactional 메서드에 @Retryable을 같이 붙이면 매번 새 트랜잭션으로 재시도된다.', '애스펙트 순서에 따라 같은 트랜잭션 안에서 재시도될 수 있고, 이미 롤백 표시된 트랜잭션이면 결국 실패한다. 재시도 메서드를 트랜잭션 메서드의 호출자 쪽에 둔다.']],
      fq: [['Spring Retry와 Resilience4j Retry 중 무엇을 쓰나요?', '재시도만 필요하면 Spring Retry가 간단하지만, 서킷 브레이커나 Bulkhead와 함께 쓰고 설정을 yml로 관리하며 메트릭까지 보려면 Resilience4j가 낫습니다. 스프링 7부터는 프레임워크 자체 @Retryable도 있어 버전에 맞게 선택합니다.']]
    },
    '@Recover': {
      why: '재시도를 모두 소진한 뒤에도 예외를 그대로 터뜨리지 않고 대체 처리나 실패 기록으로 마무리하기 위해서다.',
      ans: '@Recover는 @Retryable의 재시도를 모두 소진했을 때 호출되는 복구 메서드를 지정합니다. 첫 파라미터는 처리할 예외, 나머지는 원래 메서드 파라미터와 같게 두고 반환 타입도 맞춰야 합니다. 시그니처가 맞지 않으면 조용히 무시되고 예외가 던져지므로 테스트로 확인합니다.',
      use: [
        '환율 API 재시도가 모두 실패하면 `@Recover`에서 마지막으로 저장된 환율을 반환한다.',
        '알림 발송 재시도 실패 시 실패 테이블에 저장해 운영자가 재처리하게 한다.'
      ],
      fq: [['@Recover 메서드가 여러 개면 어떤 것이 호출되나요?', '발생한 예외 타입에 가장 가깝게 맞는 메서드가 선택됩니다. 헷갈리면 @Retryable의 recover 속성에 메서드 이름을 명시합니다.']]
    },
    '재시도 백오프 · 지터': {
      why: '모든 클라이언트가 같은 간격으로 동시에 재시도해 회복 중인 서버를 다시 쓰러뜨리는 것을 막기 위해서다.',
      ans: '백오프는 재시도 간격을 점점 늘리는 것이고, 지터는 그 간격에 무작위 값을 섞는 것입니다. 고정 간격으로 재시도하면 장애 직후 모든 클라이언트가 같은 박자로 몰려 회복 중인 서버를 다시 쓰러뜨립니다. 그래서 지수 백오프에 상한과 지터를 함께 두고, 서버가 Retry-After를 주면 그 값을 따릅니다.',
      ana: '정전 후 모든 집이 동시에 에어컨을 켜면 다시 정전이 납니다. 집마다 조금씩 시간을 두고 켜는 것이 지터입니다.',
      use: [
        '수백 대 인스턴스가 같은 외부 API를 호출하는 환경에서 지터를 넣어 장애 복구 직후의 재시도 폭주를 막는다.',
        '429 응답의 Retry-After 헤더 값을 읽어 그 시간 이후에 재시도한다.'
      ],
      fq: [['지수 백오프만으로는 왜 부족한가요?', '모든 클라이언트가 같은 시점에 실패했다면 지수 백오프를 해도 재시도 시점이 계속 같아 몰림이 반복됩니다. 무작위 지터를 섞어야 재시도가 시간축에 퍼집니다.']]
    },
    '재시도와 멱등성': {
      ans: '재시도는 같은 요청을 여러 번 처리해도 결과가 같은 멱등한 요청에만 안전합니다. 읽기 타임아웃은 상대가 이미 처리했을 수 있다는 뜻이라, 결제 같은 POST를 그대로 재시도하면 이중 결제가 납니다. 그래서 연결 실패처럼 도달하지 않은 것이 확실한 경우만 바로 재시도하고, 그 외에는 멱등 키를 보내거나 상태 조회로 확인한 뒤 처리합니다.',
      ana: '엘리베이터 버튼을 여러 번 눌러도 한 번 부른 것과 같지만(멱등), 자판기 결제 버튼을 여러 번 누르면 여러 번 결제됩니다(비멱등).',
      flow: ['호출 실패', '요청이 상대에 도달했는지 판단', '도달 안 함 → 재시도', '도달했을 수 있음 → 멱등성 확인', '멱등 키 있으면 재시도', '없으면 상태 조회 후 처리'],
      use: [
        '결제 요청에 주문 번호 기반 Idempotency-Key를 넣어 타임아웃 후 재시도해도 결제가 한 번만 되게 한다.',
        'HTTP 클라이언트, Feign, Resilience4j 세 곳에 재시도가 걸려 실제로 27번 호출되던 문제를 Resilience4j 한 곳으로 정리한다.'
      ],
      myth: [
        ['타임아웃이 났으면 요청은 실패한 것이다.', '타임아웃은 응답을 못 받았다는 뜻일 뿐, 상대 서버는 이미 처리를 끝냈을 수 있다.'],
        ['PUT은 멱등하니 항상 안전하게 재시도할 수 있다.', 'HTTP 명세상 멱등이어도 상대 구현이 버전 증가나 이력 생성처럼 부수 효과를 낼 수 있어 API 문서로 확인해야 한다.']
      ],
      fq: [
        ['재시도 계층이 여러 개면 왜 문제가 되나요?', '각 계층의 시도 횟수가 곱으로 늘어 3회씩 세 계층이면 최대 27번 호출됩니다. 장애 중인 상대에게 부하를 폭증시키므로 재시도는 한 계층에만 둡니다.'],
        ['메시지 컨슈머에서 외부 API를 호출할 때도 멱등성이 필요한가요?', '네. 메시지 브로커는 보통 최소 한 번 전달이라 같은 메시지가 다시 올 수 있으므로, 처리 이력 테이블이나 멱등 키로 중복 처리를 막아야 합니다.']
      ]
    },
    'Idempotency-Key': {
      why: '타임아웃 후 클라이언트가 재요청했을 때 결제나 주문이 두 번 처리되는 것을 막기 위해서다.',
      ans: 'Idempotency-Key는 클라이언트가 요청마다 고유 키를 헤더로 보내고, 서버가 키별 처리 결과를 저장해 같은 키의 재요청에는 저장된 결과를 돌려주는 패턴입니다. 키를 원자적으로 선점해야 동시 중복 요청을 막을 수 있어 DB 유니크 제약이나 Redis SET NX로 구현합니다. 키는 비즈니스 요청 단위로 한 번 만들고 재시도 내내 같은 값을 써야 합니다.',
      ana: '택배 송장 번호와 같습니다. 같은 송장 번호로 접수가 두 번 들어와도 택배사는 이미 접수된 건이라고 알려 줍니다.',
      flow: ['클라이언트가 키 생성', '헤더에 담아 요청', '서버가 키 선점 (유니크)', '처리 후 결과 저장', '같은 키 재요청 시 저장 결과 반환'],
      use: [
        '우리 주문 API에 Idempotency-Key를 받아, 모바일 앱이 네트워크 불안정으로 재전송해도 주문이 한 번만 생성되게 한다.',
        'Stripe 결제 API 호출 시 주문 ID 기반 키를 보내 우리 쪽 재시도를 안전하게 만든다.'
      ],
      myth: [['재시도할 때마다 새 UUID를 키로 보내면 된다.', '키가 바뀌면 서버는 다른 요청으로 보고 다시 처리한다. 키는 원래 요청 하나에 고정해야 한다.']],
      fq: [['같은 키로 처리 중에 두 번째 요청이 오면 어떻게 하나요?', '첫 요청이 키를 "처리 중"으로 선점했으므로 두 번째 요청은 409 Conflict 등으로 응답하고, 클라이언트는 잠시 후 다시 조회하게 합니다. 처리 완료 후에는 저장된 응답을 그대로 돌려줍니다.']]
    }
  }
};
