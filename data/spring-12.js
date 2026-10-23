(window.MINDMAP = window.MINDMAP || {})['spring-12'] = {
  name: '외부 연동 · 회복성',
  groups: [
    { name: 'HTTP 클라이언트', items: [
      { t: 'RestTemplate', deep: false,
        d: '스프링 3.0부터 쓰인 동기·블로킹 방식의 템플릿 메서드형 HTTP 클라이언트로, 현재는 유지보수 모드다.',
        how: [
          '`getForObject()`, `postForEntity()`, `exchange()`처럼 HTTP 메서드별 오버로드 메서드를 제공한다.',
          '스프링 5.0부터 새 기능은 추가되지 않는 유지보수 모드이고, 스프링 6.1에서 같은 동기 방식에 플루언트 API를 갖춘 `RestClient`가 후속으로 나왔다. 스프링 7에서는 향후 deprecated 예정임이 공지되었다.',
          '부트는 `RestTemplate` 빈을 직접 만들지 않고 `RestTemplateBuilder`만 자동 설정한다. 빌더로 만들어야 메시지 컨버터, 타임아웃, 관측(Observation) 설정이 적용된다.',
          '기존 코드는 `RestClient.create(restTemplate)`로 같은 설정(요청 팩토리, 인터셉터, 컨버터)을 재사용해 점진적으로 옮길 수 있다.'
        ],
        warn: ['`new RestTemplate()`으로 만들면 기본 요청 팩토리(`HttpURLConnection`)에 타임아웃이 사실상 무제한이고 커넥션 풀 설정도 없다.'],
        rel: ['RestClient', 'ClientHttpRequestFactory', '외부 호출 타임아웃'] },
      { t: 'RestClient', deep: true,
        d: '스프링 6.1(부트 3.2)에 추가된 동기 HTTP 클라이언트로, WebClient와 비슷한 플루언트 API를 블로킹 방식으로 제공한다.',
        why: 'RestTemplate의 오버로드 메서드 난립을 없애고, 리액터 의존성 없이 WebClient 수준의 읽기 쉬운 API를 쓰기 위해서다. 가상 스레드와 함께 쓰면 동기 코드로도 높은 동시성을 얻는다.',
        how: [
          '부트는 프로토타입 스코프의 `RestClient.Builder`를 자동 설정한다. 주입받은 빌더로 만들면 메시지 컨버터, 요청 팩토리, 관측 설정이 함께 적용된다.',
          '1) `builder.baseUrl(...).defaultHeader(...).requestFactory(...)`로 대상 서비스별 클라이언트 빈을 만든다.',
          '2) `get().uri("/users/{id}", id)`로 메서드와 URI를 정하고 헤더·본문을 붙인다.',
          '3) `retrieve()`로 응답을 받고 `body(User.class)` 또는 `toEntity(User.class)`로 변환한다.',
          '4) 4xx·5xx 응답은 기본으로 `HttpClientErrorException`, `HttpServerErrorException`이 던져지며, `onStatus()`로 원하는 예외로 바꿀 수 있다.',
          '- `exchange()`: 상태 코드와 본문을 직접 다뤄야 할 때 쓰며, 이때는 기본 상태 처리기가 적용되지 않는다.',
          '- `RestClient.create()`: 빌더 자동 설정을 거치지 않아 관측·컨버터 커스터마이징이 빠진다.'
        ],
        code: `@Bean
RestClient userClient(RestClient.Builder builder,
                      ClientHttpRequestFactory requestFactory) {
    return builder.baseUrl("https://user.example.com")
                  .requestFactory(requestFactory)
                  .defaultHeader("X-Client", "order-service")
                  .build();
}

public UserDto findUser(long id) {
    return userClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .onStatus(status -> status.value() == 404,
                      (req, res) -> { throw new UserNotFoundException(id); })
            .body(UserDto.class);
}`,
        warn: ['`RestClient.Builder`는 가변 객체다. 같은 빌더 인스턴스를 여러 클라이언트에서 공유하며 설정을 바꾸면 서로 섞이므로, 주입받은 빌더를 한 클라이언트에만 쓰거나 `clone()`한다.'],
        qa: ['RestTemplate 대신 RestClient를 쓰는 이유는?', 'RestTemplate은 유지보수 모드라 새 기능이 들어오지 않고, 메서드 오버로드가 많아 읽기 어렵습니다. RestClient는 같은 동기 방식이면서 WebClient처럼 체이닝 API를 제공해 요청 구성과 오류 처리가 명확합니다. 내부 인프라(요청 팩토리, 컨버터, 인터셉터)를 공유하므로 RestClient.create(restTemplate)으로 점진적으로 옮길 수 있습니다.'],
        rel: ['RestTemplate', 'WebClient', 'HTTP Interface (@HttpExchange)', '외부 API 오류 응답 처리', '@RestClientTest', '가상 스레드'] },
      { t: 'WebClient', deep: false,
        d: 'WebFlux에 포함된 논블로킹 리액티브 HTTP 클라이언트로, `Mono`·`Flux`로 응답을 다룬다.',
        how: [
          '기본 커넥터는 Reactor Netty이며, 적은 스레드로 많은 동시 요청을 보낼 수 있다.',
          '`retrieve().bodyToMono(User.class)`로 응답을 받고 `Mono.zip()`으로 여러 API를 병렬 호출해 결과를 합칠 수 있다.',
          '타임아웃은 Reactor Netty `HttpClient`의 `CONNECT_TIMEOUT_MILLIS` 옵션과 `responseTimeout()`으로 설정한다.',
          'MVC 애플리케이션에서도 쓸 수 있지만, 단순 동기 호출이라면 `block()`을 붙이는 것보다 RestClient가 더 단순하다.'
        ],
        code: `HttpClient httpClient = HttpClient.create()
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2000)
        .responseTimeout(Duration.ofSeconds(3));

WebClient client = builder.baseUrl("https://user.example.com")
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();`,
        warn: ['WebFlux 이벤트 루프 스레드 안에서 `block()`을 호출하면 예외가 나거나 서버 전체가 멈출 수 있다.'],
        rel: ['WebFlux', 'Mono', 'RestClient', 'HTTP 커넥션 풀'] },
      { t: 'HTTP Interface (@HttpExchange)', deep: true,
        d: '자바 인터페이스에 `@GetExchange` 같은 애너테이션만 선언하면 스프링이 HTTP 호출 구현을 프록시로 만들어 주는 선언형 HTTP 클라이언트다(스프링 6.0+).',
        why: '호출 코드(URI 조립, 변환)를 반복해서 쓰지 않고 API 명세를 인터페이스로 표현하기 위해서다. 외부 의존성(Spring Cloud) 없이 프레임워크 기본 기능으로 OpenFeign 같은 경험을 얻는다.',
        how: [
          '`@HttpExchange`(공통 경로)와 `@GetExchange`, `@PostExchange` 등을 메서드에 붙이고, 파라미터에는 MVC와 같은 `@PathVariable`, `@RequestParam`, `@RequestBody`, `@RequestHeader`를 쓴다.',
          '1) 실제 전송을 맡을 `RestClient`(6.1+), `WebClient`, `RestTemplate` 중 하나를 만든다.',
          '2) `RestClientAdapter.create(restClient)`처럼 어댑터로 감싼다.',
          '3) `HttpServiceProxyFactory.builderFor(adapter).build()`로 팩토리를 만든다.',
          '4) `factory.createClient(UserApi.class)`로 프록시를 만들어 빈으로 등록한다.',
          '반환 타입으로 `User`, `ResponseEntity<User>`, `Mono<User>`(WebClient 어댑터) 등을 쓸 수 있다.',
          '타임아웃, 인터셉터, 오류 처리는 감싼 클라이언트의 설정을 그대로 따른다. 스프링 7(부트 4)부터는 `@ImportHttpServices`로 그룹 단위 자동 등록이 추가되었다.'
        ],
        code: `@HttpExchange("/users")
public interface UserApi {
    @GetExchange("/{id}")
    UserDto getUser(@PathVariable long id);

    @PostExchange
    UserDto create(@RequestBody CreateUserRequest request);
}

@Bean
UserApi userApi(RestClient.Builder builder) {
    RestClient restClient = builder.baseUrl("https://user.example.com").build();
    HttpServiceProxyFactory factory = HttpServiceProxyFactory
            .builderFor(RestClientAdapter.create(restClient))
            .build();
    return factory.createClient(UserApi.class);
}`,
        warn: ['인터페이스 자체에는 타임아웃·재시도 설정이 없다. 감싼 RestClient의 요청 팩토리에 타임아웃을 반드시 설정한다.'],
        qa: ['HTTP Interface와 OpenFeign은 어떻게 다른가요?', '둘 다 인터페이스로 HTTP 호출을 선언하는 방식이지만, HTTP Interface는 스프링 프레임워크 기본 기능이라 Spring Cloud 의존성이 필요 없고 RestClient·WebClient 위에서 동작합니다. OpenFeign은 Spring Cloud 모듈로 서비스 디스커버리, 로드밸런서와 통합이 쉽지만 현재는 기능 추가가 거의 없는 상태입니다. 새 프로젝트에서는 HTTP Interface를 우선 검토합니다.'],
        rel: ['RestClient', 'OpenFeign', 'ClientHttpRequestFactory'] },
      { t: 'OpenFeign', deep: false,
        d: 'Spring Cloud OpenFeign이 제공하는 선언형 HTTP 클라이언트로, `@FeignClient` 인터페이스만으로 외부 API를 호출한다.',
        how: [
          '`@EnableFeignClients`를 켜고 `@FeignClient(name = "user", url = "...")` 인터페이스에 MVC 애너테이션(`@GetMapping` 등)으로 메서드를 선언한다.',
          '- 오류 변환: `ErrorDecoder`를 빈으로 등록해 응답 상태별로 도메인 예외를 만든다.',
          '- 공통 헤더: `RequestInterceptor`로 인증 토큰 등을 붙인다.',
          '- 타임아웃: `spring.cloud.openfeign.client.config.<이름>.connect-timeout`, `read-timeout`으로 클라이언트별로 지정한다.',
          '- 회복성: `spring.cloud.openfeign.circuitbreaker.enabled=true`로 Spring Cloud CircuitBreaker(Resilience4j)와 연동하고 `fallback`, `fallbackFactory`를 지정한다.',
          'Spring Cloud 팀은 OpenFeign을 기능 완료(feature complete) 상태로 두고 HTTP Interface로의 이동을 권장한다.'
        ],
        warn: ['기본 `Retryer`는 재시도를 하지 않는다(`Retryer.NEVER_RETRY`). 재시도가 필요하면 멱등성을 확인한 뒤 명시적으로 설정한다.'],
        rel: ['HTTP Interface (@HttpExchange)', '외부 API 예외 변환', 'Resilience4j fallback'] }
    ]},
    { name: '연결 관리 · 인터셉터', items: [
      { t: 'ClientHttpRequestFactory', deep: false,
        d: 'RestClient·RestTemplate이 실제 HTTP 연결을 만들 때 쓰는 하위 HTTP 라이브러리를 추상화한 인터페이스다.',
        how: [
          '- `SimpleClientHttpRequestFactory`: JDK `HttpURLConnection` 기반. 의존성이 없지만 풀 설정이 제한적이다.',
          '- `JdkClientHttpRequestFactory`: JDK 11+ `HttpClient` 기반(스프링 6.1+).',
          '- `HttpComponentsClientHttpRequestFactory`: Apache HttpClient 5 기반. 커넥션 풀을 세밀하게 설정할 수 있다.',
          '- `JettyClientHttpRequestFactory`, `ReactorClientHttpRequestFactory`: Jetty, Reactor Netty 기반.',
          '부트 3.4+는 클래스패스를 보고 Apache HttpClient → Jetty → Reactor Netty → JDK HttpClient → Simple 순서로 자동 선택하며, `spring.http.client.factory`로 직접 고를 수 있다.',
          '부트 3.4+에서는 `spring.http.client.connect-timeout`, `spring.http.client.read-timeout`으로 자동 설정되는 요청 팩토리의 타임아웃을 공통 지정한다. 코드로는 `ClientHttpRequestFactoryBuilder`와 `ClientHttpRequestFactorySettings`를 쓴다.'
        ],
        warn: ['요청 팩토리를 직접 `new`로 만들어 넣으면 부트의 공통 타임아웃 프로퍼티가 적용되지 않는다. 직접 만들 때는 타임아웃도 직접 설정한다.'],
        rel: ['외부 호출 타임아웃', 'HTTP 커넥션 풀', 'RestClient'] },
      { t: 'HTTP 커넥션 풀', deep: false,
        d: '외부 서버와 맺은 TCP(및 TLS) 연결을 요청마다 새로 만들지 않고 재사용하도록 보관하는 풀이다.',
        how: [
          '연결 수립(3-way handshake, TLS handshake) 비용을 줄여 지연 시간과 CPU 사용을 낮춘다.',
          '- Apache HttpClient 5: `PoolingHttpClientConnectionManager`의 `maxTotal`(기본 25), `defaultMaxPerRoute`(기본 5)를 조절한다. 대상 서버가 하나라면 per-route 한도가 실제 동시 호출 수의 상한이 된다.',
          '- 풀 대기 시간: 풀이 가득 차면 연결을 얻기 위해 기다리는데, 이 시간도 `connectionRequestTimeout`으로 제한해야 한다.',
          '- 유휴 연결 정리: 상대 서버나 로드밸런서가 먼저 끊은 연결을 재사용하면 `Connection reset`이 나므로, 유휴 시간 제한(`evictIdleConnections`, Reactor Netty `maxIdleTime`)을 상대보다 짧게 둔다.',
          'Reactor Netty(WebClient)는 `ConnectionProvider`로 최대 연결 수, 대기 큐, 유휴 시간을 설정한다.'
        ],
        code: `PoolingHttpClientConnectionManager cm = PoolingHttpClientConnectionManagerBuilder.create()
        .setMaxConnTotal(100)
        .setMaxConnPerRoute(50)
        .setDefaultConnectionConfig(ConnectionConfig.custom()
                .setConnectTimeout(Timeout.ofSeconds(2))
                .setSocketTimeout(Timeout.ofSeconds(3))
                .build())
        .build();

CloseableHttpClient httpClient = HttpClients.custom()
        .setConnectionManager(cm)
        .evictIdleConnections(TimeValue.ofSeconds(30))
        .build();

var factory = new HttpComponentsClientHttpRequestFactory(httpClient);
factory.setConnectionRequestTimeout(Duration.ofSeconds(1)); // 풀 대기`,
        warn: ['기본 per-route 5개 그대로 운영하면 트래픽이 몰릴 때 외부 API가 빨라도 풀 대기에서 지연이 생긴다. 톰캣 스레드 수와 외부 API 처리 한도를 함께 보고 정한다.'],
        rel: ['ClientHttpRequestFactory', '외부 호출 타임아웃', '톰캣 스레드 풀 설정', 'Resilience4j Bulkhead'] },
      { t: 'HTTP 클라이언트 인터셉터', deep: false,
        d: '외부 호출 요청과 응답 사이에 끼어들어 인증 헤더 추가, 로깅, 추적 정보 전파 같은 공통 처리를 하는 확장 지점이다.',
        how: [
          '- RestClient·RestTemplate: `ClientHttpRequestInterceptor`를 `requestInterceptor()`로 등록한다.',
          '- WebClient: `ExchangeFilterFunction`을 `filter()`로 등록한다.',
          '- OpenFeign: `RequestInterceptor` 빈을 등록한다.',
          '로깅은 `logging.level.org.springframework.web.client=DEBUG`로 요청 URL과 상태를 볼 수 있고, Apache HttpClient는 `org.apache.hc.client5.http.wire` 로거로 전송 바이트까지 볼 수 있다.',
          '부트 자동 설정 빌더로 만든 클라이언트는 Micrometer Observation이 적용되어 `http.client.requests` 메트릭과 trace 헤더 전파가 자동으로 된다.'
        ],
        code: `ClientHttpRequestInterceptor logging = (request, body, execution) -> {
    long start = System.nanoTime();
    ClientHttpResponse response = execution.execute(request, body);
    log.info("{} {} -> {} ({}ms)", request.getMethod(), request.getURI(),
             response.getStatusCode(), (System.nanoTime() - start) / 1_000_000);
    return response;
};

RestClient client = builder.requestInterceptor(logging).build();`,
        warn: ['인터셉터에서 응답 본문을 읽으면 스트림이 소모되어 이후 변환이 실패한다. 본문 로깅이 필요하면 버퍼링(`BufferingClientHttpRequestFactory`)을 쓰고, 개인정보·토큰은 마스킹한다.'],
        rel: ['Interceptor', 'Micrometer 메트릭', 'RestClient'] }
    ]},
    { name: '외부 API 에러 처리', items: [
      { t: '외부 API 오류 응답 처리', deep: false,
        d: '외부 API가 4xx·5xx나 비정상 본문을 돌려줄 때 HTTP 클라이언트가 이를 어떻게 예외로 바꾸고 처리할지 정하는 방법이다.',
        how: [
          'RestClient·RestTemplate은 기본으로 4xx면 `HttpClientErrorException`, 5xx면 `HttpServerErrorException`을 던지며 둘 다 `RestClientResponseException`의 하위 타입이라 상태 코드와 응답 본문을 꺼낼 수 있다.',
          '연결 실패, 타임아웃 같은 I/O 오류는 `ResourceAccessException`으로 감싸져 나온다.',
          '- 호출별 처리: `retrieve().onStatus(predicate, handler)`.',
          '- 클라이언트 공통 처리: `RestClient.Builder.defaultStatusHandler(...)`.',
          '- 직접 처리: `exchange((req, res) -> ...)`로 상태 코드를 보고 분기한다.',
          'WebClient는 `WebClientResponseException`을 쓰며 `onStatus()`에서 `Mono.error(...)`를 반환한다.'
        ],
        code: `RestClient client = builder
        .defaultStatusHandler(HttpStatusCode::is4xxClientError, (req, res) -> {
            throw new ExternalClientException(res.getStatusCode(),
                    new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8));
        })
        .defaultStatusHandler(HttpStatusCode::is5xxServerError, (req, res) -> {
            throw new ExternalServerException(res.getStatusCode());
        })
        .build();`,
        warn: ['외부 API의 오류 본문이 항상 JSON이라고 가정하지 않는다. 게이트웨이가 HTML 오류 페이지를 돌려주는 경우도 있어 파싱 실패까지 대비한다.'],
        rel: ['외부 API 예외 변환', 'RestClient', 'Resilience4j CircuitBreaker'] },
      { t: '외부 API 예외 변환', deep: false,
        d: '외부 시스템의 오류를 그대로 전파하지 않고 우리 도메인 예외와 응답 규약으로 바꿔, 호출자와 회복성 설정이 일관되게 다루게 하는 설계다.',
        how: [
          '외부 상태 코드를 그대로 우리 API 응답으로 내보내면 내부 구조가 노출되고, 외부 404가 우리 404로 잘못 해석될 수 있다.',
          '- 4xx(우리 요청 문제): 재시도해도 소용없는 예외(예: `ExternalBadRequestException`)로 바꾸고 서킷 브레이커 실패로 집계하지 않는다.',
          '- 5xx·타임아웃(상대 장애): 재시도·서킷 브레이커 대상 예외(예: `ExternalUnavailableException`)로 바꾼다.',
          '- 응답 변환: `@RestControllerAdvice`에서 도메인 예외를 `ProblemDetail`(502, 503, 504 등)로 바꿔 클라이언트에 일관된 형식으로 내려준다.',
          '예외 계층을 이렇게 나눠 두면 Resilience4j의 `recordExceptions`, `ignoreExceptions`, Retry의 `retryExceptions`를 타입 하나로 지정할 수 있다.'
        ],
        warn: ['외부 오류 메시지나 스택 트레이스를 그대로 사용자 응답에 담지 않는다. 로그에는 남기고 응답은 정해진 코드와 메시지로 내보낸다.'],
        rel: ['외부 API 오류 응답 처리', '@RestControllerAdvice', 'ProblemDetail', 'Resilience4j Retry'] }
    ]},
    { name: 'Resilience4j 서킷 브레이커', items: [
      { t: 'Resilience4j CircuitBreaker', deep: true,
        d: '최근 호출의 실패율·느린 호출 비율을 슬라이딩 윈도우로 집계해, 임계값을 넘으면 호출 자체를 차단하는 Resilience4j 모듈이다.',
        why: '장애 난 외부 서비스를 계속 호출하면 스레드와 커넥션이 타임아웃까지 묶여 우리 서비스까지 함께 죽는다. 빨리 실패(fail fast)시켜 자원을 보호하고 상대 서비스가 회복할 시간을 주기 위해서다.',
        how: [
          '`resilience4j-spring-boot3`와 `spring-boot-starter-aop`를 추가하고 `@CircuitBreaker(name = "payment", fallbackMethod = "...")`를 메서드에 붙인다.',
          '1) CLOSED 상태에서 호출 결과를 슬라이딩 윈도우(`COUNT_BASED` 최근 N건 또는 `TIME_BASED` 최근 N초)에 기록한다.',
          '2) 호출 수가 `minimumNumberOfCalls` 이상이고 실패율이 `failureRateThreshold`(기본 50%) 또는 느린 호출 비율이 `slowCallRateThreshold` 이상이면 OPEN으로 바뀐다.',
          '3) OPEN 동안은 실제 호출 없이 즉시 `CallNotPermittedException`이 나고 fallback이 실행된다.',
          '4) `waitDurationInOpenState`(기본 60초)가 지나면 HALF_OPEN으로 바뀌어 `permittedNumberOfCallsInHalfOpenState`만큼 시험 호출을 허용한다.',
          '5) 시험 호출의 실패율이 임계값 미만이면 CLOSED로, 이상이면 다시 OPEN으로 돌아간다.',
          '- `recordExceptions`/`ignoreExceptions`: 어떤 예외를 실패로 셀지 정한다. 4xx 같은 비즈니스 오류는 무시 대상으로 둔다.',
          '- `slowCallDurationThreshold`: 이 시간을 넘는 호출을 느린 호출로 센다.'
        ],
        code: `resilience4j:
  circuitbreaker:
    instances:
      payment:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 20
        minimum-number-of-calls: 10
        failure-rate-threshold: 50
        slow-call-duration-threshold: 2s
        slow-call-rate-threshold: 80
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true
        ignore-exceptions:
          - com.example.payment.ExternalBadRequestException

// 서비스
@CircuitBreaker(name = "payment", fallbackMethod = "payFallback")
public PayResult pay(PayCommand cmd) {
    return paymentApi.pay(cmd);
}

private PayResult payFallback(PayCommand cmd, CallNotPermittedException e) {
    return PayResult.pending(cmd.orderId()); // 차단 중: 보류 처리
}`,
        warn: [
          '기본값(`slidingWindowSize`, `minimumNumberOfCalls` 100)은 트래픽이 적은 API에서 서킷이 거의 열리지 않는다. 호출량에 맞게 줄인다.',
          'AOP 프록시 기반이라 같은 클래스 안에서 호출하면 적용되지 않는다.'
        ],
        qa: ['서킷 브레이커가 OPEN에서 CLOSED로 돌아오는 과정을 설명해 주세요.', 'OPEN 상태에서는 waitDurationInOpenState 동안 호출을 즉시 차단하고 fallback을 실행합니다. 대기 시간이 지나면 HALF_OPEN으로 바뀌어 정해진 수의 시험 호출만 실제로 보냅니다. 시험 호출의 실패율이 임계값보다 낮으면 CLOSED로 복귀하고, 높으면 다시 OPEN이 되어 대기를 반복합니다.'],
        rel: ['CircuitBreaker 상태 전이', 'Resilience4j fallback', 'Resilience4j 애너테이션 순서', '셀프 호출 문제', '외부 API 예외 변환'] },
      { t: 'CircuitBreaker 상태 전이', deep: false,
        d: 'Resilience4j 서킷 브레이커가 CLOSED, OPEN, HALF_OPEN과 특수 상태 사이를 오가는 규칙과 이를 관찰·제어하는 방법이다.',
        how: [
          '- CLOSED → OPEN: 최소 호출 수를 채운 뒤 실패율 또는 느린 호출 비율이 임계값 이상일 때.',
          '- OPEN → HALF_OPEN: `waitDurationInOpenState` 경과 후. `automaticTransitionFromOpenToHalfOpenEnabled`가 false(기본)면 대기 후 첫 호출이 들어올 때 전이한다.',
          '- HALF_OPEN → CLOSED/OPEN: 허용된 시험 호출의 결과로 결정한다. `maxWaitDurationInHalfOpenState`로 HALF_OPEN에 머무는 최대 시간을 정할 수 있다.',
          '- 특수 상태: `DISABLED`(항상 허용), `FORCED_OPEN`(항상 차단), `METRICS_ONLY`(집계만 하고 차단하지 않음). `CircuitBreakerRegistry`로 운영 중 전환할 수 있다.',
          'Actuator의 `/actuator/circuitbreakers`, `/actuator/circuitbreakerevents`와 `resilience4j.circuitbreaker.state` 메트릭으로 상태와 전이 이벤트를 확인한다.'
        ],
        warn: ['`registerHealthIndicator: true`로 서킷 상태를 health에 포함하면, 외부 API 서킷이 열릴 때 우리 인스턴스가 DOWN으로 보고되어 로드밸런서에서 빠질 수 있다. 헬스 그룹을 분리한다.'],
        rel: ['Resilience4j CircuitBreaker', 'Actuator', 'health 엔드포인트'] },
      { t: 'Resilience4j fallback', deep: false,
        d: 'Resilience4j 애너테이션의 `fallbackMethod`로 지정해, 호출이 실패하거나 차단될 때 대신 실행하는 대체 메서드다.',
        how: [
          'fallback 메서드는 같은 클래스에 두고, 원래 메서드와 같은 파라미터에 마지막 파라미터로 예외 타입을 추가하며, 반환 타입이 같아야 한다.',
          '예외 타입별로 여러 fallback을 오버로드하면 발생한 예외에 가장 가까운 타입의 메서드가 선택된다.',
          '- 캐시된 이전 값이나 기본값 반환.',
          '- "처리 중" 상태로 저장하고 나중에 재처리.',
          '- 대체 서비스 호출, 또는 의미 있는 도메인 예외로 바꿔 던지기.',
          '여러 애너테이션에 각각 fallback을 지정하면 각 애스펙트 단계에서 실행되므로, 보통 가장 바깥 애너테이션 하나에만 지정한다.'
        ],
        warn: ['fallback에서 무조건 기본값을 돌려주면 장애가 조용히 묻힌다. 결제처럼 정확성이 중요한 곳은 실패를 명확히 알리거나 보류 상태로 남긴다.'],
        rel: ['Resilience4j CircuitBreaker', 'Resilience4j 애너테이션 순서', '@Recover'] }
    ]},
    { name: 'Resilience4j 보조 모듈', items: [
      { t: 'Resilience4j Retry', deep: true,
        d: '실패한 호출을 정해진 횟수와 대기 간격으로 다시 시도하는 Resilience4j 모듈이다.',
        why: '네트워크 순간 끊김, 일시적 503처럼 잠시 후 다시 하면 성공하는 일시적 장애를 사용자에게 노출하지 않기 위해서다.',
        how: [
          '`@Retry(name = "inventory", fallbackMethod = "...")`를 메서드에 붙이고 `resilience4j.retry.instances.<이름>`에 설정한다.',
          '1) 호출이 예외를 던지거나 `retryOnResultPredicate`가 참이면 재시도 대상인지 판단한다.',
          '2) `retryExceptions`에 포함되고 `ignoreExceptions`에 없으면 `waitDuration`만큼 기다린다.',
          '3) 다시 호출한다. `maxAttempts`(기본 3)는 첫 호출을 포함한 총 시도 횟수다.',
          '4) 모두 실패하면 마지막 예외가 던져지고 fallback이 있으면 실행된다.',
          '- `enableExponentialBackoff`, `exponentialBackoffMultiplier`: 대기 시간을 지수적으로 늘린다.',
          '- `enableRandomizedWait`, `randomizedWaitFactor`: 대기 시간에 무작위성을 준다. 지수 백오프와 함께 켤 수 없으므로 둘 다 필요하면 `IntervalFunction.ofExponentialRandomBackoff`로 직접 지정한다.'
        ],
        code: `resilience4j:
  retry:
    instances:
      inventory:
        max-attempts: 3
        wait-duration: 300ms
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        retry-exceptions:
          - org.springframework.web.client.ResourceAccessException
          - com.example.ExternalUnavailableException
        ignore-exceptions:
          - com.example.ExternalBadRequestException

@Retry(name = "inventory", fallbackMethod = "stockFallback")
public Stock getStock(long productId) {
    return inventoryApi.getStock(productId);
}`,
        warn: ['재시도는 상대 서버에 부하를 곱으로 더한다. 장애 중인 서비스에 모든 클라이언트가 재시도하면 회복을 방해하므로 서킷 브레이커와 함께 쓰고 횟수를 작게 둔다.'],
        qa: ['어떤 예외를 재시도하고 어떤 예외는 재시도하면 안 되나요?', '연결 실패, 타임아웃, 503처럼 일시적인 장애만 재시도합니다. 400, 401, 404 같은 4xx는 요청 자체가 잘못되어 다시 보내도 결과가 같으므로 ignoreExceptions로 제외합니다. 특히 결제처럼 멱등하지 않은 POST는 읽기 타임아웃 후 재시도하면 중복 처리될 수 있어 멱등 키가 없으면 재시도하지 않습니다.'],
        rel: ['재시도와 멱등성', '재시도 백오프 · 지터', 'Resilience4j 애너테이션 순서', '@Retryable'] },
      { t: 'Resilience4j RateLimiter', deep: false,
        d: '정해진 주기마다 허용 호출 수(permission)를 채워 넣어, 그 이상의 호출을 대기시키거나 거절하는 Resilience4j 모듈이다.',
        how: [
          '- `limitForPeriod`(기본 50): 한 주기에 허용할 호출 수.',
          '- `limitRefreshPeriod`: 허용 수를 다시 채우는 주기.',
          '- `timeoutDuration`(기본 5초): 허용을 얻기 위해 기다리는 최대 시간. 넘으면 `RequestNotPermitted` 예외가 난다.',
          '외부 API의 호출 한도(예: 초당 10회)를 넘겨 429를 받거나 차단되는 것을 막기 위해 클라이언트 쪽에서 미리 속도를 맞출 때 쓴다.',
          '인스턴스(JVM)마다 따로 세므로, 여러 인스턴스 합계를 제한하려면 인스턴스 수로 나누거나 Redis 같은 분산 제한을 쓴다.'
        ],
        warn: ['`timeoutDuration`을 길게 두면 한도 초과 시 요청 스레드가 그만큼 대기한다. 사용자 요청 경로에서는 짧게 두거나 0으로 즉시 거절한다.'],
        rel: ['Resilience4j Bulkhead', 'Resilience4j 애너테이션 순서'] },
      { t: 'Resilience4j Bulkhead', deep: false,
        d: '특정 외부 호출이 동시에 쓸 수 있는 자원(동시 호출 수나 스레드)을 격리해, 한 의존성의 지연이 전체 스레드를 잠식하지 못하게 하는 Resilience4j 모듈이다.',
        how: [
          '- `SemaphoreBulkhead`(기본): `maxConcurrentCalls`(기본 25)로 동시 실행 수를 제한하고, `maxWaitDuration`(기본 0) 동안 자리가 나지 않으면 `BulkheadFullException`이 난다. 호출 스레드에서 그대로 실행된다.',
          '- `ThreadPoolBulkhead`: `@Bulkhead(type = THREADPOOL)`로 지정하며 별도 스레드 풀(`maxThreadPoolSize`, `coreThreadPoolSize`, `queueCapacity`)에서 실행한다. 반환 타입이 `CompletableFuture`여야 한다.',
          '느린 추천 API 때문에 톰캣 스레드 200개가 모두 묶이는 대신, 그 API에는 최대 20개만 쓰게 해 결제·주문 같은 다른 기능을 지킨다.'
        ],
        warn: ['가상 스레드 환경에서는 스레드 수가 아니라 외부 자원(커넥션 풀, 상대 서버 처리량)이 병목이 되므로 세마포어 방식 동시 호출 제한이 더 중요해진다.'],
        rel: ['HTTP 커넥션 풀', 'Resilience4j RateLimiter', 'Thread per Request', '가상 스레드'] },
      { t: 'Resilience4j TimeLimiter', deep: false,
        d: '비동기 호출(`CompletableFuture`, `Mono` 등)에 최대 실행 시간을 두고, 넘으면 `TimeoutException`으로 실패시키는 Resilience4j 모듈이다.',
        how: [
          '- `timeoutDuration`(기본 1초): 허용 시간.',
          '- `cancelRunningFuture`(기본 true): 시간 초과 시 실행 중인 Future 취소를 시도한다.',
          '`@TimeLimiter`는 반환 타입이 `CompletableFuture`나 리액티브 타입일 때만 동작한다. 동기 메서드에는 적용되지 않는다.',
          '동기 HTTP 호출은 TimeLimiter 대신 HTTP 클라이언트의 연결·읽기 타임아웃으로 제한하는 것이 정석이다. 그래야 소켓까지 실제로 정리된다.'
        ],
        warn: ['TimeLimiter가 시간 초과를 알려도 내부 블로킹 작업이 인터럽트에 반응하지 않으면 스레드는 계속 일한다. HTTP 클라이언트 타임아웃을 함께 설정한다.'],
        rel: ['외부 호출 타임아웃', 'Resilience4j 애너테이션 순서'] },
      { t: 'Resilience4j 애너테이션 순서', deep: false,
        d: '한 메서드에 Resilience4j 애너테이션을 여러 개 붙였을 때 각 애스펙트가 감싸는 순서로, 기본은 Retry가 가장 바깥이다.',
        how: [
          '기본 적용 순서(바깥 → 안): `Retry ( CircuitBreaker ( RateLimiter ( TimeLimiter ( Bulkhead ( 메서드 ) ) ) ) )`.',
          '각 애스펙트의 `Ordered` 값이 정해져 있어 Retry가 가장 먼저(가장 바깥) 실행되고 Bulkhead가 가장 안쪽이다.',
          '- 의미: 재시도 한 번 한 번이 서킷 브레이커에 각각 기록된다. 서킷이 열리면 재시도도 `CallNotPermittedException`을 받는다.',
          '- 순서 변경: `resilience4j.retry.retry-aspect-order`, `resilience4j.circuitbreaker.circuit-breaker-aspect-order` 등에 값을 주며, 값이 클수록 우선순위가 높아(바깥) 먼저 실행된다.',
          '`CallNotPermittedException`은 Retry의 `ignoreExceptions`에 넣어, 서킷이 열렸을 때 쓸데없이 재시도하지 않게 한다.'
        ],
        code: `@Retry(name = "payment")
@CircuitBreaker(name = "payment", fallbackMethod = "payFallback")
@Bulkhead(name = "payment")
public PayResult pay(PayCommand cmd) {
    return paymentApi.pay(cmd);
}
// 실행: Retry -> CircuitBreaker -> Bulkhead -> pay()`,
        warn: ['애너테이션을 적는 순서는 실행 순서와 무관하다. 순서를 바꾸려면 aspect-order 프로퍼티를 바꿔야 한다.'],
        qa: ['Retry와 CircuitBreaker를 함께 쓰면 어떤 순서로 동작하나요?', '기본적으로 Retry가 CircuitBreaker를 감쌉니다. 그래서 각 재시도 시도가 서킷 브레이커에 실패로 집계되고, 서킷이 열리면 이후 시도는 CallNotPermittedException으로 즉시 실패합니다. 이 예외는 재시도 대상에서 제외해 두어야 열린 서킷에 불필요한 대기가 생기지 않습니다.'],
        rel: ['Aspect 실행 순서', 'Resilience4j Retry', 'Resilience4j CircuitBreaker', 'Resilience4j fallback'] }
    ]},
    { name: 'Spring Retry', items: [
      { t: '@Retryable', deep: false,
        d: 'Spring Retry 라이브러리에서 메서드에 붙여 예외 발생 시 선언적으로 재시도하게 하는 애너테이션이다.',
        how: [
          '`spring-retry`와 AOP 의존성을 추가하고 설정 클래스에 `@EnableRetry`를 붙인다.',
          '- `retryFor`: 재시도할 예외(2.0부터 `value`, `include` 대신 권장). `noRetryFor`: 제외할 예외.',
          '- `maxAttempts`(기본 3): 첫 호출을 포함한 총 시도 횟수.',
          '- `backoff = @Backoff(delay = 500, multiplier = 2, maxDelay = 5000, random = true)`: 지수 백오프와 지터.',
          '코드로 제어하려면 `RetryTemplate`을 쓴다.',
          'Spring Retry는 현재 유지보수 단계이며, 스프링 7에는 같은 이름의 `@Retryable`(`org.springframework.resilience.annotation`)과 `@EnableResilientMethods`가 프레임워크 핵심 기능으로 들어왔다. 부트 3.x에서는 Spring Retry 또는 Resilience4j를 쓴다.'
        ],
        code: `@Retryable(retryFor = ExternalUnavailableException.class,
           maxAttempts = 3,
           backoff = @Backoff(delay = 500, multiplier = 2))
public Stock getStock(long productId) {
    return inventoryApi.getStock(productId);
}`,
        warn: ['`@Transactional` 메서드 안에서 재시도하면 이미 롤백 표시된 같은 트랜잭션에서 다시 시도하게 된다. 재시도는 트랜잭션 바깥(호출하는 쪽)에 둔다.'],
        rel: ['@Recover', 'Resilience4j Retry', 'Spring AOP', '셀프 호출 문제'] },
      { t: '@Recover', deep: false,
        d: '`@Retryable` 재시도를 모두 소진했을 때 호출되는 복구 메서드를 지정하는 Spring Retry 애너테이션이다.',
        how: [
          '같은 클래스에 두고, 첫 파라미터는 처리할 예외 타입, 나머지는 원래 메서드의 파라미터와 같은 순서·타입으로 선언한다. 반환 타입도 같아야 한다.',
          '조건에 맞는 `@Recover`가 여러 개면 예외 타입이 가장 가까운 것이 선택되며, `@Retryable(recover = "메서드명")`으로 명시할 수도 있다.',
          '맞는 복구 메서드가 없으면 마지막 예외가 그대로 호출자에게 던져진다.'
        ],
        code: `@Recover
public Stock recover(ExternalUnavailableException e, long productId) {
    log.warn("재고 조회 실패, 캐시 값 사용 productId={}", productId);
    return stockCache.getOrUnknown(productId);
}`,
        warn: ['반환 타입이나 파라미터가 조금만 달라도 복구 메서드로 인식되지 않아, 조용히 무시되고 예외가 던져진다.'],
        rel: ['@Retryable', 'Resilience4j fallback'] },
      { t: '재시도 백오프 · 지터', deep: false,
        d: '재시도 사이 대기 시간을 점점 늘리고(백오프) 무작위 값을 섞어(지터), 여러 클라이언트의 재시도가 한순간에 몰리지 않게 하는 방법이다.',
        how: [
          '고정 간격 재시도는 장애 직후 모든 클라이언트가 같은 박자로 다시 몰려 상대 서버를 또 쓰러뜨린다(thundering herd).',
          '- 지수 백오프: 300ms → 600ms → 1.2s처럼 배수로 늘리고 `maxDelay`로 상한을 둔다.',
          '- 지터: 계산된 대기 시간에 무작위 범위를 섞어 재시도 시점을 흩뜨린다.',
          '- Spring Retry: `@Backoff(delay, multiplier, maxDelay, random = true)`.',
          '- Resilience4j: `enableExponentialBackoff`, `enableRandomizedWait` 또는 `IntervalFunction.ofExponentialRandomBackoff(...)`.',
          '전체 재시도 시간이 사용자 요청 타임아웃보다 길어지지 않도록 횟수와 상한을 함께 계산한다.'
        ],
        warn: ['외부 API가 429·503과 함께 `Retry-After` 헤더를 주면 임의 백오프보다 그 값을 우선한다.'],
        rel: ['Resilience4j Retry', '@Retryable', '외부 호출 타임아웃'] }
    ]},
    { name: '재시도 안전성', items: [
      { t: '재시도와 멱등성', deep: true,
        d: '같은 요청이 여러 번 처리되어도 결과가 한 번 처리한 것과 같아야(멱등) 재시도를 안전하게 할 수 있다는 원칙이다.',
        why: '읽기 타임아웃은 "요청이 실패했다"가 아니라 "결과를 모른다"는 뜻이다. 상대는 이미 처리했을 수 있으므로, 멱등하지 않은 요청을 재시도하면 이중 결제·중복 주문이 생긴다.',
        how: [
          'HTTP 의미상 GET, PUT, DELETE는 멱등하고 POST, PATCH는 멱등하지 않다. 하지만 실제 구현이 명세를 지키는지는 상대 API 문서로 확인한다.',
          '1) 요청이 상대에 도달하지 않은 것이 확실한 실패(연결 실패, 풀 대기 시간 초과)는 어떤 메서드든 재시도할 수 있다.',
          '2) 도달했을 수 있는 실패(읽기 타임아웃, 연결 끊김, 502·504)는 멱등한 요청만 재시도한다.',
          '3) 멱등하지 않은 요청을 재시도해야 하면 `Idempotency-Key`처럼 요청 고유 키를 보내 상대가 중복을 걸러 내게 한다.',
          '4) 키 지원이 없으면 재시도 대신 상태 조회 API로 처리 여부를 먼저 확인한다.',
          '- 재시도 계층 중복 주의: HTTP 클라이언트, Feign, Resilience4j, 메시지 컨슈머가 각각 재시도하면 시도 횟수가 곱으로 늘어난다. 재시도는 한 계층에만 둔다.'
        ],
        code: `// 결제 요청: 재시도해도 같은 키를 보내 상대가 중복 처리하지 않게 한다
String idempotencyKey = "order-" + orderId; // 주문 단위로 고정된 키

@Retry(name = "payment")
public PayResult pay(long orderId, Money amount, String idempotencyKey) {
    return paymentClient.post()
            .uri("/payments")
            .header("Idempotency-Key", idempotencyKey)
            .body(new PayRequest(orderId, amount))
            .retrieve()
            .body(PayResult.class);
}`,
        warn: ['재시도할 때마다 `UUID.randomUUID()`로 새 키를 만들면 멱등 키의 의미가 없다. 키는 비즈니스 요청 단위로 한 번 만들고 재시도 내내 같은 값을 쓴다.'],
        qa: ['결제 API 호출이 타임아웃 났을 때 어떻게 처리하나요?', '타임아웃은 상대가 처리했는지 모르는 상태라 그냥 재시도하면 이중 결제가 날 수 있습니다. 그래서 주문 단위로 고정한 멱등 키를 헤더에 담아 재시도하거나, 키를 지원하지 않으면 결제 상태 조회 API로 처리 여부를 먼저 확인합니다. 확인이 안 되면 주문을 결제 확인 중 상태로 두고 비동기로 대사해 정리합니다.'],
        rel: ['Idempotency-Key', 'Resilience4j Retry', '@Retryable', '외부 호출 타임아웃'] },
      { t: 'Idempotency-Key', deep: false,
        d: '클라이언트가 요청마다 고유 키를 헤더로 보내고 서버가 키별 처리 결과를 저장해, 같은 키의 재요청에는 저장된 결과를 돌려주는 멱등성 구현 패턴이다.',
        how: [
          'Stripe 같은 결제 API가 쓰는 방식이며 IETF에서 `Idempotency-Key` 헤더 표준화가 진행 중이다.',
          '- 첫 요청: 키를 "처리 중"으로 저장(유니크 제약)한 뒤 처리하고, 결과를 키와 함께 저장한다.',
          '- 같은 키 재요청: 저장된 응답을 그대로 돌려준다. 처리 중이면 409 등으로 응답한다.',
          '- 같은 키에 다른 본문: 잘못된 사용이므로 422 등으로 거절한다.',
          '- 보관 기간: 키는 일정 시간(예: 24시간) 후 만료시킨다.',
          '우리 API가 이 패턴을 제공하면 클라이언트가 안심하고 재시도할 수 있고, 외부 API가 지원하면 우리 쪽 재시도를 안전하게 만든다.'
        ],
        warn: ['"조회 후 없으면 저장"을 따로 하면 동시 요청이 둘 다 통과한다. DB 유니크 제약이나 Redis `SET NX`처럼 원자적인 선점으로 구현한다.'],
        rel: ['재시도와 멱등성', '@RestControllerAdvice'] }
    ]}
  ],
  must: [
    '새 코드의 동기 HTTP 호출은 RestClient(또는 그 위의 HTTP Interface)를 쓰고, RestTemplate은 유지보수 모드임을 안다.',
    '외부 호출에는 연결·읽기·풀 대기 타임아웃을 모두 명시하고, 커넥션 풀 크기를 트래픽에 맞춘다.',
    'Resilience4j 기본 순서는 Retry가 CircuitBreaker를 감싸며, 4xx와 CallNotPermittedException은 재시도하지 않는다.',
    '멱등하지 않은 요청은 타임아웃 후 그냥 재시도하지 말고 멱등 키나 상태 조회로 중복을 막는다.',
    '재시도는 한 계층에만 두고, 지수 백오프와 지터로 상대 서버에 몰리지 않게 한다.'
  ]
};
