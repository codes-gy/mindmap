import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-12",
  name: "외부 연동 · 회복성",
  must: [
    "새 코드의 동기 HTTP 호출은 RestClient(또는 그 위의 HTTP Interface)를 쓰고, RestTemplate은 유지보수 모드임을 안다.",
    "외부 호출에는 연결·읽기·풀 대기 타임아웃을 모두 명시하고, 커넥션 풀 크기를 트래픽에 맞춘다.",
    "Resilience4j 기본 순서는 Retry가 CircuitBreaker를 감싸며, 4xx와 CallNotPermittedException은 재시도하지 않는다.",
    "멱등하지 않은 요청은 타임아웃 후 그냥 재시도하지 말고 멱등 키나 상태 조회로 중복을 막는다.",
    "재시도는 한 계층에만 두고, 지수 백오프와 지터로 상대 서버에 몰리지 않게 한다."
  ],
  groups: [
    {
      name: "HTTP 클라이언트",
      compare: {
        cols: ["기준", "RestTemplate", "RestClient", "WebClient", "HTTP Interface (@HttpExchange)", "OpenFeign"],
        rows: [
          ["방식", "동기 · 블로킹", "동기 · 블로킹", "논블로킹 · 리액티브", "선언형 (하위 클라이언트 따름)", "선언형 · 동기"],
          ["API 스타일", "오버로드 메서드", "플루언트 체이닝", "플루언트 체이닝", "인터페이스 + 애너테이션", "인터페이스 + MVC 애너테이션"],
          ["도입 · 상태", "3.0, 유지보수 모드", "6.1, 권장", "5.0, 활발", "6.0, 권장", "Spring Cloud, 기능 완료"],
          [
            "추가 의존성",
            "없음 (spring-web)",
            "없음 (spring-web)",
            "spring-webflux",
            "없음",
            "spring-cloud-starter-openfeign"
          ],
          [
            "적합한 경우",
            "기존 코드 유지",
            "MVC 동기 호출 기본",
            "대량 동시 호출, 리액티브 스택",
            "여러 엔드포인트를 가진 외부 API",
            "기존 Spring Cloud 프로젝트"
          ]
        ]
      },
      concepts: [
        {
          id: "spring/resttemplate",
          slug: "resttemplate",
          title: "RestTemplate",
          deep: false,
          def: "스프링 3.0부터 쓰인 동기·블로킹 방식의 템플릿 메서드형 HTTP 클라이언트로, 현재는 유지보수 모드다.",
          why: "레거시 코드에 널리 쓰여 여전히 마주치지만 유지보수 모드라는 점을 알고 새 코드에서는 RestClient를 고르기 위해서다.",
          how: [
            "`getForObject()`, `postForEntity()`, `exchange()`처럼 HTTP 메서드별 오버로드 메서드를 제공한다.",
            "스프링 5.0부터 새 기능은 추가되지 않는 유지보수 모드이고, 스프링 6.1에서 같은 동기 방식에 플루언트 API를 갖춘 `RestClient`가 후속으로 나왔다. 스프링 7에서는 향후 deprecated 예정임이 공지되었다.",
            "부트는 `RestTemplate` 빈을 직접 만들지 않고 `RestTemplateBuilder`만 자동 설정한다. 빌더로 만들어야 메시지 컨버터, 타임아웃, 관측(Observation) 설정이 적용된다.",
            "기존 코드는 `RestClient.create(restTemplate)`로 같은 설정(요청 팩토리, 인터셉터, 컨버터)을 재사용해 점진적으로 옮길 수 있다."
          ],
          use: [
            "레거시 서비스의 RestTemplate 빈을 그대로 RestClient.create()에 넘겨 인터셉터와 타임아웃 설정을 재사용하며 호출부만 교체한다.",
            "`new RestTemplate()`으로 만든 곳을 `RestTemplateBuilder`로 바꿔 타임아웃과 메트릭을 적용한다."
          ],
          warn: ["`new RestTemplate()`으로 만들면 기본 요청 팩토리(`HttpURLConnection`)에 타임아웃이 사실상 무제한이고 커넥션 풀 설정도 없다."],
          myth: [
            [
              "RestTemplate은 deprecated되어 당장 쓰면 안 된다.",
              "스프링 6.x에서는 유지보수 모드일 뿐 deprecated가 아니다. 다만 신규 코드에는 RestClient가 권장되고, 향후 deprecated 예정이 공지되었다."
            ]
          ],
          answer: "RestTemplate은 스프링의 오래된 동기 HTTP 클라이언트로, 현재는 새 기능이 추가되지 않는 유지보수 모드입니다. 동작에는 문제가 없지만 오버로드 메서드가 많아 읽기 어렵고, 스프링 6.1부터는 같은 동기 방식의 RestClient가 후속으로 권장됩니다. 그래서 기존 코드는 유지하되 새 코드는 RestClient로 쓰고, RestClient.create(restTemplate)으로 점진적으로 옮깁니다.",
          followUps: [
            [
              "RestTemplate은 WebClient로 대체해야 하나요?",
              "꼭 그렇지 않습니다. 동기 MVC 애플리케이션이라면 리액터 의존성이 필요한 WebClient보다 같은 동기 방식인 RestClient로 옮기는 것이 자연스럽습니다."
            ]
          ],
          related: ["spring/restclient", "spring/clienthttprequestfactory", "spring/oebu-hochul-taimaut"]
        },
        {
          id: "spring/restclient",
          slug: "restclient",
          title: "RestClient",
          deep: true,
          def: "스프링 6.1(부트 3.2)에 추가된 동기 HTTP 클라이언트로, WebClient와 비슷한 플루언트 API를 블로킹 방식으로 제공한다.",
          why: "RestTemplate의 오버로드 메서드 난립을 없애고, 리액터 의존성 없이 WebClient 수준의 읽기 쉬운 API를 쓰기 위해서다. 가상 스레드와 함께 쓰면 동기 코드로도 높은 동시성을 얻는다.",
          how: [
            "부트는 프로토타입 스코프의 `RestClient.Builder`를 자동 설정한다. 주입받은 빌더로 만들면 메시지 컨버터, 요청 팩토리, 관측 설정이 함께 적용된다.",
            "1) `builder.baseUrl(...).defaultHeader(...).requestFactory(...)`로 대상 서비스별 클라이언트 빈을 만든다.",
            "2) `get().uri(\"/users/{id}\", id)`로 메서드와 URI를 정하고 헤더·본문을 붙인다.",
            "3) `retrieve()`로 응답을 받고 `body(User.class)` 또는 `toEntity(User.class)`로 변환한다.",
            "4) 4xx·5xx 응답은 기본으로 `HttpClientErrorException`, `HttpServerErrorException`이 던져지며, `onStatus()`로 원하는 예외로 바꿀 수 있다.",
            "- `exchange()`: 상태 코드와 본문을 직접 다뤄야 할 때 쓰며, 이때는 기본 상태 처리기가 적용되지 않는다.",
            "- `RestClient.create()`: 빌더 자동 설정을 거치지 않아 관측·컨버터 커스터마이징이 빠진다."
          ],
          flow: [
            "RestClient.Builder 주입",
            "baseUrl · 요청 팩토리 설정",
            "get() · uri() 요청 구성",
            "retrieve()로 전송",
            "onStatus 오류 변환",
            "body()로 객체 변환"
          ],
          code: "@Bean\nRestClient userClient(RestClient.Builder builder,\n                      ClientHttpRequestFactory requestFactory) {\n    return builder.baseUrl(\"https://user.example.com\")\n                  .requestFactory(requestFactory)\n                  .defaultHeader(\"X-Client\", \"order-service\")\n                  .build();\n}\n\npublic UserDto findUser(long id) {\n    return userClient.get()\n            .uri(\"/users/{id}\", id)\n            .retrieve()\n            .onStatus(status -> status.value() == 404,\n                      (req, res) -> { throw new UserNotFoundException(id); })\n            .body(UserDto.class);\n}",
          codeLang: "java",
          use: [
            "결제, 회원, 재고 서비스마다 baseUrl과 타임아웃이 다른 RestClient 빈을 따로 등록한다.",
            "가상 스레드를 켠 MVC 서비스에서 RestClient로 외부 API를 동기 호출해 코드 단순함과 동시성을 함께 얻는다.",
            "`@RestClientTest`와 MockRestServiceServer로 요청 URL과 오류 처리 로직을 테스트한다."
          ],
          warn: [
            "`RestClient.Builder`는 가변 객체다. 같은 빌더 인스턴스를 여러 클라이언트에서 공유하며 설정을 바꾸면 서로 섞이므로, 주입받은 빌더를 한 클라이언트에만 쓰거나 `clone()`한다."
          ],
          myth: [
            [
              "동기 클라이언트는 성능이 나빠서 WebClient를 써야 한다.",
              "호출 동시성이 아주 높지 않다면 RestClient로 충분하고, 가상 스레드를 쓰면 블로킹 호출의 스레드 비용도 크게 줄어든다."
            ]
          ],
          answer: "RestClient는 스프링 6.1에 추가된 동기 HTTP 클라이언트로, WebClient 같은 체이닝 API를 블로킹 방식으로 제공합니다. 부트가 자동 설정한 RestClient.Builder로 서비스별 클라이언트 빈을 만들고, retrieve와 body로 응답을 받으며 onStatus로 오류를 도메인 예외로 바꿉니다. 저는 요청 팩토리에 타임아웃과 커넥션 풀을 명시하는 것을 기본으로 합니다.",
          analogy: "RestTemplate이 기능별 버튼이 잔뜩 달린 리모컨이라면, RestClient는 \"누구에게, 무엇을, 어떻게 받을지\"를 차례대로 고르는 단계형 메뉴입니다.",
          qa: [
            "RestTemplate 대신 RestClient를 쓰는 이유는?",
            "RestTemplate은 유지보수 모드라 새 기능이 들어오지 않고, 메서드 오버로드가 많아 읽기 어렵습니다. RestClient는 같은 동기 방식이면서 WebClient처럼 체이닝 API를 제공해 요청 구성과 오류 처리가 명확합니다. 내부 인프라(요청 팩토리, 컨버터, 인터셉터)를 공유하므로 RestClient.create(restTemplate)으로 점진적으로 옮길 수 있습니다."
          ],
          followUps: [
            [
              "retrieve()와 exchange()는 어떻게 다른가요?",
              "retrieve()는 4xx·5xx에 기본 예외를 던지고 본문 변환을 간단히 해 주는 일반적인 방식입니다. exchange()는 요청과 응답을 직접 받아 상태 코드에 따라 자유롭게 분기할 때 쓰며, 기본 상태 처리기가 적용되지 않으므로 오류 처리를 직접 해야 합니다."
            ],
            [
              "RestClient.create()로 만들면 무엇이 빠지나요?",
              "부트가 자동 설정한 빌더를 거치지 않으므로 커스텀 메시지 컨버터, 공통 요청 팩토리 설정, Micrometer 관측이 적용되지 않습니다. 그래서 운영 코드에서는 주입받은 RestClient.Builder로 만듭니다."
            ]
          ],
          related: [
            "spring/resttemplate",
            "spring/webclient",
            "spring/http-interface-httpexchange",
            "spring/oebu-api-oryu-eungdap-cheori",
            "spring/restclienttest",
            "spring/gasang-seuredeu"
          ]
        },
        {
          id: "spring/webclient",
          slug: "webclient",
          title: "WebClient",
          deep: false,
          def: "WebFlux에 포함된 논블로킹 리액티브 HTTP 클라이언트로, `Mono`·`Flux`로 응답을 다룬다.",
          why: "외부 API를 많이 호출할 때 스레드를 붙잡지 않고 여러 요청을 병렬로 보내 적은 자원으로 처리하기 위해서다.",
          how: [
            "기본 커넥터는 Reactor Netty이며, 적은 스레드로 많은 동시 요청을 보낼 수 있다.",
            "`retrieve().bodyToMono(User.class)`로 응답을 받고 `Mono.zip()`으로 여러 API를 병렬 호출해 결과를 합칠 수 있다.",
            "타임아웃은 Reactor Netty `HttpClient`의 `CONNECT_TIMEOUT_MILLIS` 옵션과 `responseTimeout()`으로 설정한다.",
            "MVC 애플리케이션에서도 쓸 수 있지만, 단순 동기 호출이라면 `block()`을 붙이는 것보다 RestClient가 더 단순하다."
          ],
          code: "HttpClient httpClient = HttpClient.create()\n        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2000)\n        .responseTimeout(Duration.ofSeconds(3));\n\nWebClient client = builder.baseUrl(\"https://user.example.com\")\n        .clientConnector(new ReactorClientHttpConnector(httpClient))\n        .build();",
          codeLang: "java",
          use: [
            "상품 상세 화면에서 가격, 재고, 리뷰 API를 `Mono.zip()`으로 동시에 호출해 응답 시간을 가장 느린 하나 수준으로 줄인다.",
            "Spring Cloud Gateway 같은 WebFlux 기반 서비스에서 하위 서비스를 호출한다."
          ],
          warn: ["WebFlux 이벤트 루프 스레드 안에서 `block()`을 호출하면 예외가 나거나 서버 전체가 멈출 수 있다."],
          myth: [
            [
              "WebClient를 쓰면 MVC 애플리케이션도 논블로킹이 된다.",
              "호출 결과를 block()으로 기다리면 요청 스레드는 그대로 블로킹된다. 전체 스택이 리액티브여야 논블로킹 이점이 생긴다."
            ]
          ],
          answer: "WebClient는 WebFlux의 논블로킹 HTTP 클라이언트로, Mono와 Flux로 응답을 다룹니다. 적은 스레드로 많은 요청을 동시에 보낼 수 있어 여러 외부 API를 병렬로 호출해 합치는 데 유리합니다. MVC에서도 쓸 수 있지만 단순 동기 호출이면 block()을 붙이기보다 RestClient를 씁니다.",
          analogy: "식당에서 주문을 넣고 진동벨을 받아 자리로 돌아가는 방식입니다. 기다리는 동안 다른 일을 할 수 있고 음식이 나오면 알림이 옵니다.",
          followUps: [
            [
              "WebClient에서 타임아웃은 어떻게 거나요?",
              "Reactor Netty HttpClient에 CONNECT_TIMEOUT_MILLIS 옵션으로 연결 타임아웃을, responseTimeout()으로 응답 타임아웃을 설정합니다. 요청 단위로는 Mono에 timeout() 연산자를 붙일 수도 있습니다."
            ]
          ],
          related: ["spring/webflux", "spring/mono", "spring/restclient", "spring/http-keoneksyeon-pul"]
        },
        {
          id: "spring/http-interface-httpexchange",
          slug: "http-interface-httpexchange",
          title: "HTTP Interface (@HttpExchange)",
          deep: true,
          def: "자바 인터페이스에 `@GetExchange` 같은 애너테이션만 선언하면 스프링이 HTTP 호출 구현을 프록시로 만들어 주는 선언형 HTTP 클라이언트다(스프링 6.0+).",
          why: "호출 코드(URI 조립, 변환)를 반복해서 쓰지 않고 API 명세를 인터페이스로 표현하기 위해서다. 외부 의존성(Spring Cloud) 없이 프레임워크 기본 기능으로 OpenFeign 같은 경험을 얻는다.",
          how: [
            "`@HttpExchange`(공통 경로)와 `@GetExchange`, `@PostExchange` 등을 메서드에 붙이고, 파라미터에는 MVC와 같은 `@PathVariable`, `@RequestParam`, `@RequestBody`, `@RequestHeader`를 쓴다.",
            "1) 실제 전송을 맡을 `RestClient`(6.1+), `WebClient`, `RestTemplate` 중 하나를 만든다.",
            "2) `RestClientAdapter.create(restClient)`처럼 어댑터로 감싼다.",
            "3) `HttpServiceProxyFactory.builderFor(adapter).build()`로 팩토리를 만든다.",
            "4) `factory.createClient(UserApi.class)`로 프록시를 만들어 빈으로 등록한다.",
            "반환 타입으로 `User`, `ResponseEntity<User>`, `Mono<User>`(WebClient 어댑터) 등을 쓸 수 있다.",
            "타임아웃, 인터셉터, 오류 처리는 감싼 클라이언트의 설정을 그대로 따른다. 스프링 7(부트 4)부터는 `@ImportHttpServices`로 그룹 단위 자동 등록이 추가되었다."
          ],
          flow: [
            "인터페이스에 @HttpExchange 선언",
            "RestClient 생성",
            "RestClientAdapter로 감쌈",
            "HttpServiceProxyFactory 생성",
            "createClient()로 프록시 빈 등록",
            "메서드 호출 시 HTTP 요청 전송"
          ],
          code: "@HttpExchange(\"/users\")\npublic interface UserApi {\n    @GetExchange(\"/{id}\")\n    UserDto getUser(@PathVariable long id);\n\n    @PostExchange\n    UserDto create(@RequestBody CreateUserRequest request);\n}\n\n@Bean\nUserApi userApi(RestClient.Builder builder) {\n    RestClient restClient = builder.baseUrl(\"https://user.example.com\").build();\n    HttpServiceProxyFactory factory = HttpServiceProxyFactory\n            .builderFor(RestClientAdapter.create(restClient))\n            .build();\n    return factory.createClient(UserApi.class);\n}",
          codeLang: "java",
          use: [
            "외부 결제사 API의 여러 엔드포인트를 `PaymentApi` 인터페이스 하나로 정리해 호출부에서 URI 조립 코드를 없앤다.",
            "OpenFeign으로 만든 클라이언트를 애너테이션만 `@GetExchange`로 바꿔 Spring Cloud 의존성을 제거한다."
          ],
          warn: ["인터페이스 자체에는 타임아웃·재시도 설정이 없다. 감싼 RestClient의 요청 팩토리에 타임아웃을 반드시 설정한다."],
          myth: [
            [
              "HTTP Interface는 WebClient가 있어야 쓸 수 있다.",
              "스프링 6.0에서는 WebClient만 지원했지만 6.1부터 RestClient와 RestTemplate 어댑터가 추가되어 MVC 동기 환경에서도 쓴다."
            ]
          ],
          answer: "HTTP Interface는 인터페이스에 @GetExchange 같은 애너테이션만 선언하면 스프링이 호출 구현을 프록시로 만들어 주는 선언형 클라이언트입니다. RestClient나 WebClient를 어댑터로 감싸 HttpServiceProxyFactory로 프록시를 만들고 빈으로 등록합니다. Spring Cloud 없이 OpenFeign 같은 편의를 얻을 수 있어 새 프로젝트에서는 이것을 우선 씁니다.",
          analogy: "식당 메뉴판과 같습니다. 손님은 메뉴 이름만 고르면 되고, 주방(RestClient)이 실제 요리 과정을 처리합니다.",
          qa: [
            "HTTP Interface와 OpenFeign은 어떻게 다른가요?",
            "둘 다 인터페이스로 HTTP 호출을 선언하는 방식이지만, HTTP Interface는 스프링 프레임워크 기본 기능이라 Spring Cloud 의존성이 필요 없고 RestClient·WebClient 위에서 동작합니다. OpenFeign은 Spring Cloud 모듈로 서비스 디스커버리, 로드밸런서와 통합이 쉽지만 현재는 기능 추가가 거의 없는 상태입니다. 새 프로젝트에서는 HTTP Interface를 우선 검토합니다."
          ],
          followUps: [
            [
              "HTTP Interface에 타임아웃이나 오류 처리는 어디서 설정하나요?",
              "인터페이스는 선언만 담기 때문에 감싸는 RestClient나 WebClient에 설정합니다. 요청 팩토리의 타임아웃, defaultStatusHandler, 인터셉터가 그대로 적용됩니다."
            ],
            ["메서드마다 다른 응답 헤더나 상태를 확인하려면?", "반환 타입을 ResponseEntity<T>로 선언하면 상태 코드와 헤더를 함께 받을 수 있습니다."]
          ],
          related: ["spring/restclient", "spring/openfeign", "spring/clienthttprequestfactory"]
        },
        {
          id: "spring/openfeign",
          slug: "openfeign",
          title: "OpenFeign",
          deep: false,
          def: "Spring Cloud OpenFeign이 제공하는 선언형 HTTP 클라이언트로, `@FeignClient` 인터페이스만으로 외부 API를 호출한다.",
          why: "URL 조립, 요청·응답 변환 같은 반복 코드 없이 인터페이스 선언만으로 외부 API 호출을 간결하게 만들기 위해서다.",
          how: [
            "`@EnableFeignClients`를 켜고 `@FeignClient(name = \"user\", url = \"...\")` 인터페이스에 MVC 애너테이션(`@GetMapping` 등)으로 메서드를 선언한다.",
            "- 오류 변환: `ErrorDecoder`를 빈으로 등록해 응답 상태별로 도메인 예외를 만든다.",
            "- 공통 헤더: `RequestInterceptor`로 인증 토큰 등을 붙인다.",
            "- 타임아웃: `spring.cloud.openfeign.client.config.<이름>.connect-timeout`, `read-timeout`으로 클라이언트별로 지정한다.",
            "- 회복성: `spring.cloud.openfeign.circuitbreaker.enabled=true`로 Spring Cloud CircuitBreaker(Resilience4j)와 연동하고 `fallback`, `fallbackFactory`를 지정한다.",
            "Spring Cloud 팀은 OpenFeign을 기능 완료(feature complete) 상태로 두고 HTTP Interface로의 이동을 권장한다."
          ],
          use: [
            "마이크로서비스 간 호출을 `@FeignClient(name = \"member\")`로 선언하고 서비스 디스커버리·로드밸런서와 연동한다.",
            "`ErrorDecoder`에서 외부 404를 `MemberNotFoundException`으로, 5xx를 재시도 대상 예외로 바꾼다."
          ],
          warn: ["기본 `Retryer`는 재시도를 하지 않는다(`Retryer.NEVER_RETRY`). 재시도가 필요하면 멱등성을 확인한 뒤 명시적으로 설정한다."],
          myth: [
            [
              "Feign은 기본으로 실패 시 재시도해 준다.",
              "Spring Cloud OpenFeign의 기본 Retryer는 NEVER_RETRY라 재시도하지 않는다. 필요하면 명시적으로 설정한다."
            ]
          ],
          answer: "OpenFeign은 Spring Cloud가 제공하는 선언형 HTTP 클라이언트로, @FeignClient 인터페이스에 MVC 애너테이션으로 API를 선언합니다. ErrorDecoder로 오류를 도메인 예외로 바꾸고, 클라이언트별 타임아웃과 Resilience4j 연동 fallback을 설정할 수 있습니다. 다만 현재는 기능 완료 상태라 새 프로젝트라면 HTTP Interface도 함께 검토합니다.",
          followUps: [
            [
              "Feign 클라이언트에 fallback을 적용하려면?",
              "spring.cloud.openfeign.circuitbreaker.enabled를 켜고 @FeignClient에 fallback 또는 fallbackFactory를 지정합니다. fallbackFactory를 쓰면 원인 예외를 받아 상황별로 다르게 처리할 수 있습니다."
            ]
          ],
          related: [
            "spring/http-interface-httpexchange",
            "spring/oebu-api-yeoe-byeonhwan",
            "spring/resilience4j-fallback"
          ]
        }
      ]
    },
    {
      name: "연결 관리 · 인터셉터",
      compare: {
        cols: ["기준", "ClientHttpRequestFactory", "HTTP 커넥션 풀", "HTTP 클라이언트 인터셉터"],
        rows: [
          ["역할", "하위 HTTP 라이브러리 선택", "TCP·TLS 연결 재사용", "요청·응답 공통 처리"],
          [
            "대표 구현·설정",
            "`HttpComponentsClientHttpRequestFactory`",
            "`maxTotal`, `maxPerRoute`",
            "`ClientHttpRequestInterceptor`"
          ],
          ["설정 위치", "`RestClient.Builder#requestFactory`", "HttpClient 5 연결 관리자", "`requestInterceptor()`"],
          ["주의점", "구현마다 풀·타임아웃 다름", "HttpClient 5 기본 라우트당 5개", "본문 로깅 시 버퍼링 필요"]
        ]
      },
      concepts: [
        {
          id: "spring/clienthttprequestfactory",
          slug: "clienthttprequestfactory",
          title: "ClientHttpRequestFactory",
          deep: false,
          def: "RestClient·RestTemplate이 실제 HTTP 연결을 만들 때 쓰는 하위 HTTP 라이브러리를 추상화한 인터페이스다.",
          why: "코드를 바꾸지 않고 하위 HTTP 라이브러리를 교체해 커넥션 풀과 타임아웃을 상황에 맞게 설정하기 위해서다.",
          how: [
            "- `SimpleClientHttpRequestFactory`: JDK `HttpURLConnection` 기반. 의존성이 없지만 풀 설정이 제한적이다.",
            "- `JdkClientHttpRequestFactory`: JDK 11+ `HttpClient` 기반(스프링 6.1+).",
            "- `HttpComponentsClientHttpRequestFactory`: Apache HttpClient 5 기반. 커넥션 풀을 세밀하게 설정할 수 있다.",
            "- `JettyClientHttpRequestFactory`, `ReactorClientHttpRequestFactory`: Jetty, Reactor Netty 기반.",
            "부트 3.4+는 클래스패스를 보고 Apache HttpClient → Jetty → Reactor Netty → JDK HttpClient → Simple 순서로 자동 선택하며, `spring.http.client.factory`로 직접 고를 수 있다.",
            "부트 3.4+에서는 `spring.http.client.connect-timeout`, `spring.http.client.read-timeout`으로 자동 설정되는 요청 팩토리의 타임아웃을 공통 지정한다. 코드로는 `ClientHttpRequestFactoryBuilder`와 `ClientHttpRequestFactorySettings`를 쓴다."
          ],
          use: [
            "httpclient5 의존성을 추가해 부트가 `HttpComponentsClientHttpRequestFactory`를 자동 선택하게 하고 풀 크기만 커스터마이징한다.",
            "`spring.http.client.connect-timeout`, `read-timeout`으로 모든 자동 설정 클라이언트의 기본 타임아웃을 한 번에 지정한다."
          ],
          warn: ["요청 팩토리를 직접 `new`로 만들어 넣으면 부트의 공통 타임아웃 프로퍼티가 적용되지 않는다. 직접 만들 때는 타임아웃도 직접 설정한다."],
          answer: "ClientHttpRequestFactory는 RestClient와 RestTemplate이 실제로 어떤 HTTP 라이브러리로 연결할지를 추상화한 인터페이스입니다. 기본 JDK 구현은 풀 설정이 제한적이라 운영에서는 Apache HttpClient 5 기반 팩토리로 커넥션 풀과 타임아웃을 세밀하게 잡습니다. 부트 3.4부터는 클래스패스를 보고 자동 선택하고 공통 타임아웃 프로퍼티도 제공합니다.",
          analogy: "택배 회사에 배송을 맡기는 것과 같습니다. 보내는 방법(RestClient API)은 같아도 어떤 택배사(HTTP 라이브러리)를 쓰느냐에 따라 속도와 옵션이 달라집니다.",
          followUps: [
            [
              "어떤 요청 팩토리가 쓰이고 있는지 어떻게 아나요?",
              "부트 3.4+는 클래스패스에 있는 라이브러리를 Apache HttpClient, Jetty, Reactor Netty, JDK HttpClient, Simple 순으로 찾아 선택합니다. 확실히 하려면 spring.http.client.factory로 지정하거나 RestClient 빈 생성 시 요청 팩토리를 직접 넣습니다."
            ]
          ],
          related: ["spring/oebu-hochul-taimaut", "spring/http-keoneksyeon-pul", "spring/restclient"]
        },
        {
          id: "spring/http-keoneksyeon-pul",
          slug: "http-keoneksyeon-pul",
          title: "HTTP 커넥션 풀",
          deep: false,
          def: "외부 서버와 맺은 TCP(및 TLS) 연결을 요청마다 새로 만들지 않고 재사용하도록 보관하는 풀이다.",
          why: "요청마다 TCP·TLS 연결을 새로 맺으면 핸드셰이크 비용으로 지연 시간과 CPU 사용이 크게 늘기 때문이다.",
          how: [
            "연결 수립(3-way handshake, TLS handshake) 비용을 줄여 지연 시간과 CPU 사용을 낮춘다.",
            "- Apache HttpClient 5: `PoolingHttpClientConnectionManager`의 `maxTotal`(기본 25), `defaultMaxPerRoute`(기본 5)를 조절한다. 대상 서버가 하나라면 per-route 한도가 실제 동시 호출 수의 상한이 된다.",
            "- 풀 대기 시간: 풀이 가득 차면 연결을 얻기 위해 기다리는데, 이 시간도 `connectionRequestTimeout`으로 제한해야 한다.",
            "- 유휴 연결 정리: 상대 서버나 로드밸런서가 먼저 끊은 연결을 재사용하면 `Connection reset`이 나므로, 유휴 시간 제한(`evictIdleConnections`, Reactor Netty `maxIdleTime`)을 상대보다 짧게 둔다.",
            "Reactor Netty(WebClient)는 `ConnectionProvider`로 최대 연결 수, 대기 큐, 유휴 시간을 설정한다."
          ],
          flow: [
            "요청 시 풀에서 연결 대여",
            "유휴 연결 없으면 새 연결 생성",
            "한도 초과 시 풀 대기",
            "요청 · 응답 처리",
            "연결 반납 (keep-alive)",
            "유휴 시간 초과 연결 정리"
          ],
          code: "PoolingHttpClientConnectionManager cm = PoolingHttpClientConnectionManagerBuilder.create()\n        .setMaxConnTotal(100)\n        .setMaxConnPerRoute(50)\n        .setDefaultConnectionConfig(ConnectionConfig.custom()\n                .setConnectTimeout(Timeout.ofSeconds(2))\n                .setSocketTimeout(Timeout.ofSeconds(3))\n                .build())\n        .build();\n\nCloseableHttpClient httpClient = HttpClients.custom()\n        .setConnectionManager(cm)\n        .evictIdleConnections(TimeValue.ofSeconds(30))\n        .build();\n\nvar factory = new HttpComponentsClientHttpRequestFactory(httpClient);\nfactory.setConnectionRequestTimeout(Duration.ofSeconds(1)); // 풀 대기",
          codeLang: "java",
          use: [
            "외부 결제 API 응답은 빠른데 피크 시간에만 지연이 생겨 확인해 보니 per-route 5개 한도에서 대기하고 있어 50개로 늘렸다.",
            "로드밸런서 유휴 타임아웃(60초)보다 짧은 30초로 유휴 연결을 정리해 간헐적인 Connection reset 오류를 없앴다."
          ],
          warn: [
            "기본 per-route 5개 그대로 운영하면 트래픽이 몰릴 때 외부 API가 빨라도 풀 대기에서 지연이 생긴다. 톰캣 스레드 수와 외부 API 처리 한도를 함께 보고 정한다."
          ],
          myth: [
            [
              "커넥션 풀은 클수록 좋다.",
              "풀이 너무 크면 상대 서버에 과도한 동시 연결을 만들어 상대를 느리게 하고, 우리 쪽 메모리와 소켓도 낭비한다. 상대 처리 한도와 우리 동시 요청 수에 맞춘다."
            ]
          ],
          answer: "HTTP 커넥션 풀은 외부 서버와 맺은 연결을 재사용해 TCP·TLS 연결 비용을 줄이는 장치입니다. Apache HttpClient 5는 기본이 전체 25개, 대상별 5개라 트래픽이 많으면 풀 대기에서 지연이 생기므로 대상별 한도를 늘리고 풀 대기 타임아웃도 둡니다. 상대 쪽이 먼저 끊은 유휴 연결을 재사용하지 않도록 유휴 연결 정리 시간도 상대보다 짧게 설정합니다.",
          analogy: "매번 새로 택시를 부르는 대신 회사 셔틀버스를 몇 대 대기시켜 두고 돌려 쓰는 것과 같습니다. 버스가 모자라면 줄을 서야 합니다.",
          followUps: [
            [
              "연결 타임아웃, 읽기 타임아웃 외에 어떤 타임아웃이 더 필요한가요?",
              "풀에서 연결을 얻기까지 기다리는 connectionRequestTimeout이 필요합니다. 이것이 없으면 풀이 가득 찼을 때 요청 스레드가 오래 묶여 외부 API는 멀쩡한데도 우리 서비스가 느려집니다."
            ]
          ],
          related: [
            "spring/clienthttprequestfactory",
            "spring/oebu-hochul-taimaut",
            "spring/tomkaet-seuredeu-pul-seoljeong",
            "spring/resilience4j-bulkhead"
          ]
        },
        {
          id: "spring/http-keulraieonteu-inteosepteo",
          slug: "http-keulraieonteu-inteosepteo",
          title: "HTTP 클라이언트 인터셉터",
          deep: false,
          def: "외부 호출 요청과 응답 사이에 끼어들어 인증 헤더 추가, 로깅, 추적 정보 전파 같은 공통 처리를 하는 확장 지점이다.",
          why: "인증 헤더, 로깅, 추적 ID 전파를 호출 코드마다 반복하지 않고 한 곳에서 공통 처리하기 위해서다.",
          how: [
            "- RestClient·RestTemplate: `ClientHttpRequestInterceptor`를 `requestInterceptor()`로 등록한다.",
            "- WebClient: `ExchangeFilterFunction`을 `filter()`로 등록한다.",
            "- OpenFeign: `RequestInterceptor` 빈을 등록한다.",
            "로깅은 `logging.level.org.springframework.web.client=DEBUG`로 요청 URL과 상태를 볼 수 있고, Apache HttpClient는 `org.apache.hc.client5.http.wire` 로거로 전송 바이트까지 볼 수 있다.",
            "부트 자동 설정 빌더로 만든 클라이언트는 Micrometer Observation이 적용되어 `http.client.requests` 메트릭과 trace 헤더 전파가 자동으로 된다."
          ],
          code: "ClientHttpRequestInterceptor logging = (request, body, execution) -> {\n    long start = System.nanoTime();\n    ClientHttpResponse response = execution.execute(request, body);\n    log.info(\"{} {} -> {} ({}ms)\", request.getMethod(), request.getURI(),\n             response.getStatusCode(), (System.nanoTime() - start) / 1_000_000);\n    return response;\n};\n\nRestClient client = builder.requestInterceptor(logging).build();",
          codeLang: "java",
          use: [
            "OAuth2 액세스 토큰을 인터셉터에서 붙이고, 401이면 토큰을 갱신하는 로직을 한곳에 모은다.",
            "외부 호출마다 URL, 상태 코드, 소요 시간을 남겨 느린 API를 찾는다."
          ],
          warn: [
            "인터셉터에서 응답 본문을 읽으면 스트림이 소모되어 이후 변환이 실패한다. 본문 로깅이 필요하면 버퍼링(`BufferingClientHttpRequestFactory`)을 쓰고, 개인정보·토큰은 마스킹한다."
          ],
          myth: [
            [
              "로그를 남기려면 인터셉터에서 응답 본문을 그냥 읽으면 된다.",
              "응답 본문은 스트림이라 한 번 읽으면 이후 변환이 실패한다. 버퍼링 팩토리를 쓰거나 본문 로깅은 디버그 환경에 한정한다."
            ]
          ],
          answer: "HTTP 클라이언트 인터셉터는 외부 호출 요청과 응답 사이에 끼어들어 공통 처리를 하는 확장 지점입니다. RestClient는 ClientHttpRequestInterceptor, WebClient는 ExchangeFilterFunction, Feign은 RequestInterceptor를 씁니다. 인증 토큰 추가, 호출 시간 로깅, 추적 ID 전파 같은 일을 호출 코드마다 반복하지 않게 해 줍니다.",
          followUps: [
            [
              "분산 추적의 trace ID는 어떻게 외부 호출에 전달되나요?",
              "부트가 자동 설정한 RestClient.Builder나 WebClient.Builder로 만든 클라이언트에는 Micrometer Observation이 적용되어 traceparent 같은 추적 헤더가 자동으로 붙습니다. 직접 new로 만든 클라이언트에는 적용되지 않습니다."
            ]
          ],
          related: ["spring/interceptor", "spring/micrometer-meteurik", "spring/restclient"]
        }
      ]
    },
    {
      name: "외부 API 에러 처리",
      compare: {
        cols: ["기준", "외부 API 오류 응답 처리", "외부 API 예외 변환"],
        rows: [
          ["관심사", "HTTP 응답을 예외로 바꾸는 시점과 방법", "예외를 어떤 도메인 의미로 분류할지"],
          [
            "주요 도구",
            "onStatus, defaultStatusHandler, ErrorDecoder",
            "예외 계층, @RestControllerAdvice, ProblemDetail"
          ],
          ["결과", "호출 지점에서 예외 발생", "재시도 · 서킷 · 응답 정책이 타입으로 결정"]
        ]
      },
      concepts: [
        {
          id: "spring/oebu-api-oryu-eungdap-cheori",
          slug: "oebu-api-oryu-eungdap-cheori",
          title: "외부 API 오류 응답 처리",
          deep: false,
          def: "외부 API가 4xx·5xx나 비정상 본문을 돌려줄 때 HTTP 클라이언트가 이를 어떻게 예외로 바꾸고 처리할지 정하는 방법이다.",
          why: "외부 API의 4xx·5xx와 연결 오류를 구분해 다루지 않으면 재시도 여부나 사용자 응답을 잘못 결정하기 때문이다.",
          how: [
            "RestClient·RestTemplate은 기본으로 4xx면 `HttpClientErrorException`, 5xx면 `HttpServerErrorException`을 던지며 둘 다 `RestClientResponseException`의 하위 타입이라 상태 코드와 응답 본문을 꺼낼 수 있다.",
            "연결 실패, 타임아웃 같은 I/O 오류는 `ResourceAccessException`으로 감싸져 나온다.",
            "- 호출별 처리: `retrieve().onStatus(predicate, handler)`.",
            "- 클라이언트 공통 처리: `RestClient.Builder.defaultStatusHandler(...)`.",
            "- 직접 처리: `exchange((req, res) -> ...)`로 상태 코드를 보고 분기한다.",
            "WebClient는 `WebClientResponseException`을 쓰며 `onStatus()`에서 `Mono.error(...)`를 반환한다."
          ],
          flow: ["응답 수신", "상태 코드 확인", "onStatus 처리기 탐색", "없으면 defaultStatusHandler", "없으면 기본 예외 발생", "정상이면 본문 변환"],
          code: "RestClient client = builder\n        .defaultStatusHandler(HttpStatusCode::is4xxClientError, (req, res) -> {\n            throw new ExternalClientException(res.getStatusCode(),\n                    new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8));\n        })\n        .defaultStatusHandler(HttpStatusCode::is5xxServerError, (req, res) -> {\n            throw new ExternalServerException(res.getStatusCode());\n        })\n        .build();",
          codeLang: "java",
          use: [
            "외부 회원 API의 404를 `MemberNotFoundException`으로 바꿔 서비스 계층에서 \"없는 회원\" 흐름으로 처리한다.",
            "5xx와 ResourceAccessException을 하나의 `ExternalUnavailableException`으로 모아 재시도·서킷 브레이커 대상으로 지정한다."
          ],
          warn: ["외부 API의 오류 본문이 항상 JSON이라고 가정하지 않는다. 게이트웨이가 HTML 오류 페이지를 돌려주는 경우도 있어 파싱 실패까지 대비한다."],
          answer: "RestClient는 기본적으로 4xx에 HttpClientErrorException, 5xx에 HttpServerErrorException을 던지고, 연결 실패나 타임아웃은 ResourceAccessException으로 감쌉니다. 저는 클라이언트 빌더의 defaultStatusHandler로 상태 코드 범위별 공통 변환을 두고, 특정 호출에서만 의미가 다른 404 같은 경우는 onStatus로 따로 처리합니다. 이렇게 하면 호출 코드에 try-catch가 흩어지지 않습니다.",
          followUps: [
            [
              "외부 API가 200을 주면서 본문에 오류 코드를 담아 보내면 어떻게 하나요?",
              "HTTP 상태로는 오류를 알 수 없으므로 본문을 객체로 받은 뒤 결과 코드를 검사해 도메인 예외로 바꿉니다. Resilience4j Retry라면 retryOnResultPredicate로 결과 기반 재시도 조건을 줄 수도 있습니다."
            ]
          ],
          related: ["spring/oebu-api-yeoe-byeonhwan", "spring/restclient", "spring/resilience4j-circuitbreaker"]
        },
        {
          id: "spring/oebu-api-yeoe-byeonhwan",
          slug: "oebu-api-yeoe-byeonhwan",
          title: "외부 API 예외 변환",
          deep: false,
          def: "외부 시스템의 오류를 그대로 전파하지 않고 우리 도메인 예외와 응답 규약으로 바꿔, 호출자와 회복성 설정이 일관되게 다루게 하는 설계다.",
          why: "외부 오류를 그대로 내보내면 내부 구조가 노출되고 외부 404가 우리 404로 잘못 해석되는 등 혼란이 생기기 때문이다.",
          how: [
            "외부 상태 코드를 그대로 우리 API 응답으로 내보내면 내부 구조가 노출되고, 외부 404가 우리 404로 잘못 해석될 수 있다.",
            "- 4xx(우리 요청 문제): 재시도해도 소용없는 예외(예: `ExternalBadRequestException`)로 바꾸고 서킷 브레이커 실패로 집계하지 않는다.",
            "- 5xx·타임아웃(상대 장애): 재시도·서킷 브레이커 대상 예외(예: `ExternalUnavailableException`)로 바꾼다.",
            "- 응답 변환: `@RestControllerAdvice`에서 도메인 예외를 `ProblemDetail`(502, 503, 504 등)로 바꿔 클라이언트에 일관된 형식으로 내려준다.",
            "예외 계층을 이렇게 나눠 두면 Resilience4j의 `recordExceptions`, `ignoreExceptions`, Retry의 `retryExceptions`를 타입 하나로 지정할 수 있다."
          ],
          use: [
            "외부 결제사의 다양한 오류 코드를 `PaymentDeclinedException`(재시도 불가)과 `PaymentUnavailableException`(재시도 가능)으로 정리한다.",
            "외부 API 장애 시 우리 API는 502 Bad Gateway와 정해진 오류 코드를 반환하고 상세 원인은 로그에만 남긴다."
          ],
          warn: ["외부 오류 메시지나 스택 트레이스를 그대로 사용자 응답에 담지 않는다. 로그에는 남기고 응답은 정해진 코드와 메시지로 내보낸다."],
          myth: [
            [
              "외부 API의 상태 코드를 그대로 전달하는 것이 가장 정확하다.",
              "외부 404가 우리 API의 404로 나가면 클라이언트는 우리 리소스가 없다고 오해한다. 외부 의존성 실패는 502·503처럼 게이트웨이 성격 코드로 바꾸는 편이 정확하다."
            ]
          ],
          answer: "외부 시스템의 오류를 그대로 전파하지 않고 우리 도메인 예외로 바꿔 다룹니다. 우리 요청이 잘못된 4xx는 재시도해도 소용없는 예외로, 5xx와 타임아웃은 일시적 장애 예외로 나눠 두면 재시도와 서킷 브레이커 설정을 예외 타입 하나로 지정할 수 있습니다. 사용자 응답은 @RestControllerAdvice에서 502나 503 같은 일관된 ProblemDetail로 내려줍니다.",
          analogy: "해외 거래처의 다양한 거절 사유를 사내 표준 코드표로 번역해 두는 것과 같습니다. 각 부서는 표준 코드만 보고 대응합니다.",
          followUps: [
            [
              "서킷 브레이커에서 4xx를 실패로 세면 어떤 문제가 생기나요?",
              "잘못된 입력이 몰리는 것만으로 서킷이 열려 정상 요청까지 차단됩니다. 그래서 4xx 계열 예외는 ignoreExceptions에 넣어 실패율에서 제외합니다."
            ]
          ],
          related: [
            "spring/oebu-api-oryu-eungdap-cheori",
            "spring/restcontrolleradvice",
            "spring/problemdetail",
            "spring/resilience4j-retry"
          ]
        }
      ]
    },
    {
      name: "Resilience4j 서킷 브레이커",
      compare: {
        cols: ["기준", "Resilience4j CircuitBreaker", "CircuitBreaker 상태 전이", "Resilience4j fallback"],
        rows: [
          ["역할", "실패율 기반 호출 차단", "상태별 호출 허용 규칙", "실패·차단 시 대체 응답"],
          ["핵심 설정", "`failureRateThreshold`, 윈도우 크기", "`waitDurationInOpenState`", "`fallbackMethod` 속성"],
          ["동작 시점", "호출 결과 집계 시", "임계 초과·대기 시간 경과", "예외 또는 `CallNotPermittedException`"],
          ["주의점", "`minimumNumberOfCalls` 전엔 판단 보류", "HALF_OPEN 허용 호출 수 제한", "같은 시그니처 + 예외 파라미터"]
        ]
      },
      concepts: [
        {
          id: "spring/resilience4j-circuitbreaker",
          slug: "resilience4j-circuitbreaker",
          title: "Resilience4j CircuitBreaker",
          deep: true,
          def: "최근 호출의 실패율·느린 호출 비율을 슬라이딩 윈도우로 집계해, 임계값을 넘으면 호출 자체를 차단하는 Resilience4j 모듈이다.",
          why: "장애 난 외부 서비스를 계속 호출하면 스레드와 커넥션이 타임아웃까지 묶여 우리 서비스까지 함께 죽는다. 빨리 실패(fail fast)시켜 자원을 보호하고 상대 서비스가 회복할 시간을 주기 위해서다.",
          how: [
            "`resilience4j-spring-boot3`와 `spring-boot-starter-aop`를 추가하고 `@CircuitBreaker(name = \"payment\", fallbackMethod = \"...\")`를 메서드에 붙인다.",
            "1) CLOSED 상태에서 호출 결과를 슬라이딩 윈도우(`COUNT_BASED` 최근 N건 또는 `TIME_BASED` 최근 N초)에 기록한다.",
            "2) 호출 수가 `minimumNumberOfCalls` 이상이고 실패율이 `failureRateThreshold`(기본 50%) 또는 느린 호출 비율이 `slowCallRateThreshold` 이상이면 OPEN으로 바뀐다.",
            "3) OPEN 동안은 실제 호출 없이 즉시 `CallNotPermittedException`이 나고 fallback이 실행된다.",
            "4) `waitDurationInOpenState`(기본 60초)가 지나면 HALF_OPEN으로 바뀌어 `permittedNumberOfCallsInHalfOpenState`만큼 시험 호출을 허용한다.",
            "5) 시험 호출의 실패율이 임계값 미만이면 CLOSED로, 이상이면 다시 OPEN으로 돌아간다.",
            "- `recordExceptions`/`ignoreExceptions`: 어떤 예외를 실패로 셀지 정한다. 4xx 같은 비즈니스 오류는 무시 대상으로 둔다.",
            "- `slowCallDurationThreshold`: 이 시간을 넘는 호출을 느린 호출로 센다."
          ],
          flow: [
            "CLOSED에서 호출 결과 기록",
            "최소 호출 수 충족",
            "실패율 · 느린 호출 비율 임계값 초과",
            "OPEN: 즉시 차단 + fallback",
            "대기 시간 경과 후 HALF_OPEN",
            "시험 호출 결과로 CLOSED 또는 OPEN"
          ],
          code: "resilience4j:\n  circuitbreaker:\n    instances:\n      payment:\n        sliding-window-type: COUNT_BASED\n        sliding-window-size: 20\n        minimum-number-of-calls: 10\n        failure-rate-threshold: 50\n        slow-call-duration-threshold: 2s\n        slow-call-rate-threshold: 80\n        wait-duration-in-open-state: 30s\n        permitted-number-of-calls-in-half-open-state: 3\n        automatic-transition-from-open-to-half-open-enabled: true\n        ignore-exceptions:\n          - com.example.payment.ExternalBadRequestException\n\n// 서비스\n@CircuitBreaker(name = \"payment\", fallbackMethod = \"payFallback\")\npublic PayResult pay(PayCommand cmd) {\n    return paymentApi.pay(cmd);\n}\n\nprivate PayResult payFallback(PayCommand cmd, CallNotPermittedException e) {\n    return PayResult.pending(cmd.orderId()); // 차단 중: 보류 처리\n}",
          codeLang: "java",
          use: [
            "결제 대행사 장애 시 서킷을 열어 주문은 \"결제 대기\"로 받아 두고, 복구 후 배치로 결제를 재시도한다.",
            "추천 API 서킷이 열리면 fallback으로 인기 상품 목록을 보여 줘 상품 화면은 정상 동작하게 한다.",
            "Grafana에서 `resilience4j_circuitbreaker_state` 메트릭으로 서킷 상태 변화에 알림을 건다."
          ],
          warn: [
            "기본값(`slidingWindowSize`, `minimumNumberOfCalls` 100)은 트래픽이 적은 API에서 서킷이 거의 열리지 않는다. 호출량에 맞게 줄인다.",
            "AOP 프록시 기반이라 같은 클래스 안에서 호출하면 적용되지 않는다."
          ],
          myth: [
            [
              "서킷 브레이커를 붙이면 타임아웃 설정은 필요 없다.",
              "서킷은 실패가 쌓인 뒤에 열린다. 그 전까지 각 호출을 끊어 주는 것은 타임아웃이고, 느린 호출이 실패로 집계되려면 타임아웃이나 slowCallDurationThreshold가 있어야 한다."
            ]
          ],
          answer: "Resilience4j CircuitBreaker는 최근 호출의 실패율과 느린 호출 비율을 슬라이딩 윈도우로 집계해, 임계값을 넘으면 OPEN 상태로 바꿔 호출을 즉시 차단합니다. 일정 시간이 지나면 HALF_OPEN에서 시험 호출을 보내 결과에 따라 CLOSED로 복귀하거나 다시 OPEN이 됩니다. 장애 난 외부 서비스 때문에 우리 스레드와 커넥션이 타임아웃까지 묶이는 것을 막는 것이 목적입니다.",
          analogy: "집의 누전 차단기와 같습니다. 이상 전류가 감지되면 전원을 내려 집 전체가 타는 것을 막고, 점검 후 다시 올려 봅니다.",
          qa: [
            "서킷 브레이커가 OPEN에서 CLOSED로 돌아오는 과정을 설명해 주세요.",
            "OPEN 상태에서는 waitDurationInOpenState 동안 호출을 즉시 차단하고 fallback을 실행합니다. 대기 시간이 지나면 HALF_OPEN으로 바뀌어 정해진 수의 시험 호출만 실제로 보냅니다. 시험 호출의 실패율이 임계값보다 낮으면 CLOSED로 복귀하고, 높으면 다시 OPEN이 되어 대기를 반복합니다."
          ],
          followUps: [
            [
              "COUNT_BASED와 TIME_BASED 슬라이딩 윈도우는 어떻게 고르나요?",
              "COUNT_BASED는 최근 N건의 호출로, TIME_BASED는 최근 N초 동안의 호출로 집계합니다. 호출량이 일정하면 COUNT_BASED가 단순하고, 시간대별 트래픽 편차가 크면 TIME_BASED가 최근 상태를 더 잘 반영합니다."
            ],
            [
              "서킷이 열렸을 때 클라이언트에는 무엇을 돌려주나요?",
              "CallNotPermittedException을 받는 fallback에서 캐시 값이나 대체 응답을 주거나, 기능 특성상 대체가 불가능하면 503과 함께 잠시 후 다시 시도하라는 응답을 줍니다."
            ]
          ],
          related: [
            "spring/circuitbreaker-sangtae-jeoni",
            "spring/resilience4j-fallback",
            "spring/resilience4j-aeneoteisyeon-sunseo",
            "spring/selpeu-hochul-munje",
            "spring/oebu-api-yeoe-byeonhwan"
          ]
        },
        {
          id: "spring/circuitbreaker-sangtae-jeoni",
          slug: "circuitbreaker-sangtae-jeoni",
          title: "CircuitBreaker 상태 전이",
          deep: false,
          def: "Resilience4j 서킷 브레이커가 CLOSED, OPEN, HALF_OPEN과 특수 상태 사이를 오가는 규칙과 이를 관찰·제어하는 방법이다.",
          why: "장애 난 외부 서비스에 계속 요청을 보내 스레드가 묶이고 장애가 전파되는 것을 막고, 회복되면 자동으로 되살리기 위해서다.",
          how: [
            "- CLOSED → OPEN: 최소 호출 수를 채운 뒤 실패율 또는 느린 호출 비율이 임계값 이상일 때.",
            "- OPEN → HALF_OPEN: `waitDurationInOpenState` 경과 후. `automaticTransitionFromOpenToHalfOpenEnabled`가 false(기본)면 대기 후 첫 호출이 들어올 때 전이한다.",
            "- HALF_OPEN → CLOSED/OPEN: 허용된 시험 호출의 결과로 결정한다. `maxWaitDurationInHalfOpenState`로 HALF_OPEN에 머무는 최대 시간을 정할 수 있다.",
            "- 특수 상태: `DISABLED`(항상 허용), `FORCED_OPEN`(항상 차단), `METRICS_ONLY`(집계만 하고 차단하지 않음). `CircuitBreakerRegistry`로 운영 중 전환할 수 있다.",
            "Actuator의 `/actuator/circuitbreakers`, `/actuator/circuitbreakerevents`와 `resilience4j.circuitbreaker.state` 메트릭으로 상태와 전이 이벤트를 확인한다."
          ],
          flow: ["CLOSED", "임계값 초과 → OPEN", "waitDurationInOpenState 경과", "HALF_OPEN 시험 호출", "성공 → CLOSED / 실패 → OPEN"],
          use: [
            "외부 결제사의 정기 점검 시간에 운영자가 서킷을 FORCED_OPEN으로 바꿔 불필요한 호출과 타임아웃을 막는다.",
            "새 설정값을 적용하기 전 METRICS_ONLY로 두고 실제 실패율만 관찰한다."
          ],
          warn: [
            "`registerHealthIndicator: true`로 서킷 상태를 health에 포함하면, 외부 API 서킷이 열릴 때 우리 인스턴스가 DOWN으로 보고되어 로드밸런서에서 빠질 수 있다. 헬스 그룹을 분리한다."
          ],
          myth: [
            [
              "대기 시간이 지나면 서킷은 자동으로 HALF_OPEN이 된다.",
              "기본값에서는 대기 시간이 지난 뒤 첫 호출이 들어올 때 전이한다. 즉시 전이하려면 automaticTransitionFromOpenToHalfOpenEnabled를 켠다."
            ]
          ],
          answer: "Resilience4j 서킷은 CLOSED에서 실패율이 임계값을 넘으면 OPEN, 대기 시간이 지나면 HALF_OPEN, 시험 호출 결과에 따라 CLOSED나 OPEN으로 전이합니다. 이 외에 DISABLED, FORCED_OPEN, METRICS_ONLY 같은 특수 상태가 있어 운영 중 수동으로 강제할 수 있습니다. 상태와 전이 이벤트는 Actuator 엔드포인트와 메트릭으로 확인합니다.",
          followUps: [
            [
              "HALF_OPEN에서 시험 호출이 들어오지 않으면 어떻게 되나요?",
              "기본으로는 허용된 시험 호출이 모두 끝날 때까지 HALF_OPEN에 머뭅니다. maxWaitDurationInHalfOpenState를 설정하면 그 시간이 지나 자동으로 OPEN으로 돌아갑니다."
            ]
          ],
          related: ["spring/resilience4j-circuitbreaker", "spring/actuator", "spring/health-endeupointeu"]
        },
        {
          id: "spring/resilience4j-fallback",
          slug: "resilience4j-fallback",
          title: "Resilience4j fallback",
          deep: false,
          def: "Resilience4j 애너테이션의 `fallbackMethod`로 지정해, 호출이 실패하거나 차단될 때 대신 실행하는 대체 메서드다.",
          why: "외부 호출이 실패하거나 차단될 때 사용자에게 에러 대신 기본값이나 캐시된 값으로 응답하기 위해서다.",
          how: [
            "fallback 메서드는 같은 클래스에 두고, 원래 메서드와 같은 파라미터에 마지막 파라미터로 예외 타입을 추가하며, 반환 타입이 같아야 한다.",
            "예외 타입별로 여러 fallback을 오버로드하면 발생한 예외에 가장 가까운 타입의 메서드가 선택된다.",
            "- 캐시된 이전 값이나 기본값 반환.",
            "- \"처리 중\" 상태로 저장하고 나중에 재처리.",
            "- 대체 서비스 호출, 또는 의미 있는 도메인 예외로 바꿔 던지기.",
            "여러 애너테이션에 각각 fallback을 지정하면 각 애스펙트 단계에서 실행되므로, 보통 가장 바깥 애너테이션 하나에만 지정한다."
          ],
          use: [
            "상품 가격 조회 실패 시 Redis에 캐시해 둔 마지막 가격을 반환하고 \"가격 변동 가능\" 표시를 붙인다.",
            "알림 발송 실패 시 발송 대기 테이블에 저장해 두고 스케줄러가 나중에 재발송한다."
          ],
          warn: ["fallback에서 무조건 기본값을 돌려주면 장애가 조용히 묻힌다. 결제처럼 정확성이 중요한 곳은 실패를 명확히 알리거나 보류 상태로 남긴다."],
          myth: [
            [
              "fallback은 모든 실패를 숨겨 주므로 많이 쓸수록 안전하다.",
              "정확성이 중요한 기능에서 기본값을 돌려주면 장애가 묻히고 잘못된 데이터가 퍼진다. 실패를 명확히 알리는 것이 더 안전한 경우도 많다."
            ]
          ],
          answer: "Resilience4j fallback은 fallbackMethod로 지정한 대체 메서드로, 호출이 실패하거나 차단될 때 실행됩니다. 같은 클래스에 원래 메서드와 같은 파라미터에 예외 파라미터를 하나 더 붙여 선언하고 반환 타입을 맞춰야 합니다. 예외 타입별로 오버로드하면 가장 가까운 타입이 선택되므로, 서킷 차단과 일반 실패를 구분해 처리할 수 있습니다.",
          analogy: "비행기 결항 시 항공사가 미리 정해 둔 대체 항공편 안내와 같습니다. 원래 계획이 안 되면 정해진 차선책으로 넘어갑니다.",
          followUps: [
            [
              "fallback 메서드가 호출되지 않는 흔한 원인은?",
              "시그니처 불일치(파라미터 순서·반환 타입), 같은 클래스 내부 호출로 프록시를 거치지 않은 경우, AOP 의존성 누락이 대표적입니다."
            ]
          ],
          related: ["spring/resilience4j-circuitbreaker", "spring/resilience4j-aeneoteisyeon-sunseo", "spring/recover"]
        }
      ]
    },
    {
      name: "Resilience4j 보조 모듈",
      compare: {
        cols: [
          "기준",
          "Resilience4j Retry",
          "Resilience4j RateLimiter",
          "Resilience4j Bulkhead",
          "Resilience4j TimeLimiter"
        ],
        rows: [
          ["막는 문제", "일시적 실패", "호출 한도 초과", "동시 호출로 인한 자원 고갈", "끝나지 않는 비동기 호출"],
          ["제한 기준", "시도 횟수 · 간격", "주기당 호출 수", "동시 실행 수 · 스레드", "실행 시간"],
          ["초과 시 예외", "마지막 원래 예외", "RequestNotPermitted", "BulkheadFullException", "TimeoutException"],
          [
            "주요 설정",
            "maxAttempts, waitDuration",
            "limitForPeriod, limitRefreshPeriod",
            "maxConcurrentCalls, maxWaitDuration",
            "timeoutDuration, cancelRunningFuture"
          ],
          ["기본 순서 위치", "가장 바깥", "CircuitBreaker 안쪽", "가장 안쪽", "Bulkhead 바깥"]
        ]
      },
      concepts: [
        {
          id: "spring/resilience4j-retry",
          slug: "resilience4j-retry",
          title: "Resilience4j Retry",
          deep: true,
          def: "실패한 호출을 정해진 횟수와 대기 간격으로 다시 시도하는 Resilience4j 모듈이다.",
          why: "네트워크 순간 끊김, 일시적 503처럼 잠시 후 다시 하면 성공하는 일시적 장애를 사용자에게 노출하지 않기 위해서다.",
          how: [
            "`@Retry(name = \"inventory\", fallbackMethod = \"...\")`를 메서드에 붙이고 `resilience4j.retry.instances.<이름>`에 설정한다.",
            "1) 호출이 예외를 던지거나 `retryOnResultPredicate`가 참이면 재시도 대상인지 판단한다.",
            "2) `retryExceptions`에 포함되고 `ignoreExceptions`에 없으면 `waitDuration`만큼 기다린다.",
            "3) 다시 호출한다. `maxAttempts`(기본 3)는 첫 호출을 포함한 총 시도 횟수다.",
            "4) 모두 실패하면 마지막 예외가 던져지고 fallback이 있으면 실행된다.",
            "- `enableExponentialBackoff`, `exponentialBackoffMultiplier`: 대기 시간을 지수적으로 늘린다.",
            "- `enableRandomizedWait`, `randomizedWaitFactor`: 대기 시간에 무작위성을 준다. 지수 백오프와 함께 켤 수 없으므로 둘 다 필요하면 `IntervalFunction.ofExponentialRandomBackoff`로 직접 지정한다."
          ],
          flow: [
            "호출 실패",
            "재시도 대상 예외인지 판단",
            "waitDuration만큼 대기 (백오프)",
            "다시 호출",
            "성공 시 반환",
            "maxAttempts 소진 시 예외 또는 fallback"
          ],
          code: "resilience4j:\n  retry:\n    instances:\n      inventory:\n        max-attempts: 3\n        wait-duration: 300ms\n        enable-exponential-backoff: true\n        exponential-backoff-multiplier: 2\n        retry-exceptions:\n          - org.springframework.web.client.ResourceAccessException\n          - com.example.ExternalUnavailableException\n        ignore-exceptions:\n          - com.example.ExternalBadRequestException\n\n@Retry(name = \"inventory\", fallbackMethod = \"stockFallback\")\npublic Stock getStock(long productId) {\n    return inventoryApi.getStock(productId);\n}",
          codeLang: "java",
          use: [
            "재고 조회 API의 간헐적 연결 끊김을 300ms 간격 최대 3회 재시도로 사용자에게 보이지 않게 처리한다.",
            "외부 API가 200 응답에 \"BUSY\" 코드를 주는 경우 `retryOnResultPredicate`로 결과 기반 재시도를 한다."
          ],
          warn: ["재시도는 상대 서버에 부하를 곱으로 더한다. 장애 중인 서비스에 모든 클라이언트가 재시도하면 회복을 방해하므로 서킷 브레이커와 함께 쓰고 횟수를 작게 둔다."],
          myth: [["maxAttempts가 3이면 첫 호출 후 3번 더 시도한다.", "maxAttempts는 첫 호출을 포함한 총 시도 횟수라 3이면 재시도는 2번이다."]],
          answer: "Resilience4j Retry는 실패한 호출을 정해진 횟수와 간격으로 다시 시도하는 모듈입니다. maxAttempts는 첫 호출을 포함한 총 횟수이고, retryExceptions와 ignoreExceptions로 연결 실패나 503 같은 일시적 장애만 재시도하게 합니다. 재시도는 상대 서버 부하를 늘리므로 지수 백오프와 함께 작은 횟수로 쓰고, 멱등하지 않은 요청은 멱등 키가 있을 때만 재시도합니다.",
          qa: [
            "어떤 예외를 재시도하고 어떤 예외는 재시도하면 안 되나요?",
            "연결 실패, 타임아웃, 503처럼 일시적인 장애만 재시도합니다. 400, 401, 404 같은 4xx는 요청 자체가 잘못되어 다시 보내도 결과가 같으므로 ignoreExceptions로 제외합니다. 특히 결제처럼 멱등하지 않은 POST는 읽기 타임아웃 후 재시도하면 중복 처리될 수 있어 멱등 키가 없으면 재시도하지 않습니다."
          ],
          followUps: [
            [
              "재시도로 인해 응답 시간이 너무 길어지는 것은 어떻게 막나요?",
              "각 시도의 읽기 타임아웃, 대기 간격, 시도 횟수를 곱해 최악의 응답 시간을 계산하고 사용자 요청 타임아웃 안에 들어오게 맞춥니다. 필요하면 시도 횟수를 줄이고 서킷 브레이커로 빠르게 실패시킵니다."
            ],
            [
              "재시도 횟수와 결과는 어떻게 모니터링하나요?",
              "resilience4j_retry_calls 메트릭이 재시도 없이 성공, 재시도 후 성공, 재시도 후 실패 등으로 나뉘어 나오므로 재시도 후 성공 비율이 늘면 상대 서비스가 불안정해지는 신호로 봅니다."
            ]
          ],
          related: [
            "spring/jaesidowa-myeokdeungseong",
            "spring/jaesido-baekopeu-jiteo",
            "spring/resilience4j-aeneoteisyeon-sunseo",
            "spring/retryable"
          ]
        },
        {
          id: "spring/resilience4j-ratelimiter",
          slug: "resilience4j-ratelimiter",
          title: "Resilience4j RateLimiter",
          deep: false,
          def: "정해진 주기마다 허용 호출 수(permission)를 채워 넣어, 그 이상의 호출을 대기시키거나 거절하는 Resilience4j 모듈이다.",
          why: "외부 API 호출 한도를 넘기거나 갑작스러운 요청 폭주로 상대 시스템을 과부하시키는 것을 막기 위해서다.",
          how: [
            "- `limitForPeriod`(기본 50): 한 주기에 허용할 호출 수.",
            "- `limitRefreshPeriod`: 허용 수를 다시 채우는 주기.",
            "- `timeoutDuration`(기본 5초): 허용을 얻기 위해 기다리는 최대 시간. 넘으면 `RequestNotPermitted` 예외가 난다.",
            "외부 API의 호출 한도(예: 초당 10회)를 넘겨 429를 받거나 차단되는 것을 막기 위해 클라이언트 쪽에서 미리 속도를 맞출 때 쓴다.",
            "인스턴스(JVM)마다 따로 세므로, 여러 인스턴스 합계를 제한하려면 인스턴스 수로 나누거나 Redis 같은 분산 제한을 쓴다."
          ],
          use: [
            "초당 10회 제한이 있는 지도 API 호출에 `limitForPeriod: 10`, `limitRefreshPeriod: 1s`를 걸어 429 응답을 막는다.",
            "배치에서 외부 API를 대량 호출할 때 RateLimiter로 속도를 일정하게 유지한다."
          ],
          warn: ["`timeoutDuration`을 길게 두면 한도 초과 시 요청 스레드가 그만큼 대기한다. 사용자 요청 경로에서는 짧게 두거나 0으로 즉시 거절한다."],
          answer: "Resilience4j RateLimiter는 주기마다 허용 호출 수를 채워 넣고 그 이상은 기다리게 하거나 RequestNotPermitted로 거절합니다. 주로 외부 API의 호출 한도를 넘지 않도록 클라이언트 쪽에서 속도를 맞출 때 씁니다. 인스턴스마다 따로 세기 때문에 여러 서버의 합계를 맞추려면 인스턴스 수로 나누거나 분산 제한을 씁니다.",
          analogy: "놀이공원 놀이기구가 회차마다 정원만큼만 태우는 것과 같습니다. 정원이 차면 다음 회차를 기다리거나 돌아가야 합니다.",
          followUps: [
            [
              "서버를 보호하는 Rate Limit과 무엇이 다른가요?",
              "Resilience4j RateLimiter는 주로 우리 쪽에서 나가는 호출을 조절하는 클라이언트 측 제한입니다. 우리 API로 들어오는 요청을 막는 서버 측 제한은 보통 게이트웨이나 Redis 기반 분산 제한으로 구현합니다."
            ]
          ],
          related: ["spring/resilience4j-bulkhead", "spring/resilience4j-aeneoteisyeon-sunseo"]
        },
        {
          id: "spring/resilience4j-bulkhead",
          slug: "resilience4j-bulkhead",
          title: "Resilience4j Bulkhead",
          deep: false,
          def: "특정 외부 호출이 동시에 쓸 수 있는 자원(동시 호출 수나 스레드)을 격리해, 한 의존성의 지연이 전체 스레드를 잠식하지 못하게 하는 Resilience4j 모듈이다.",
          why: "느려진 외부 서비스 하나가 스레드를 모두 점유해 관련 없는 기능까지 멈추게 하는 것을 막기 위해서다.",
          how: [
            "- `SemaphoreBulkhead`(기본): `maxConcurrentCalls`(기본 25)로 동시 실행 수를 제한하고, `maxWaitDuration`(기본 0) 동안 자리가 나지 않으면 `BulkheadFullException`이 난다. 호출 스레드에서 그대로 실행된다.",
            "- `ThreadPoolBulkhead`: `@Bulkhead(type = THREADPOOL)`로 지정하며 별도 스레드 풀(`maxThreadPoolSize`, `coreThreadPoolSize`, `queueCapacity`)에서 실행한다. 반환 타입이 `CompletableFuture`여야 한다.",
            "느린 추천 API 때문에 톰캣 스레드 200개가 모두 묶이는 대신, 그 API에는 최대 20개만 쓰게 해 결제·주문 같은 다른 기능을 지킨다."
          ],
          use: [
            "추천 API에 `maxConcurrentCalls: 20`을 걸어 지연이 생겨도 나머지 180개 톰캣 스레드는 다른 요청을 처리하게 한다.",
            "가상 스레드 환경에서 외부 API 동시 호출 수를 세마포어 Bulkhead로 제한해 상대 서버와 커넥션 풀을 보호한다."
          ],
          warn: ["가상 스레드 환경에서는 스레드 수가 아니라 외부 자원(커넥션 풀, 상대 서버 처리량)이 병목이 되므로 세마포어 방식 동시 호출 제한이 더 중요해진다."],
          myth: [
            [
              "Bulkhead와 RateLimiter는 같은 것이다.",
              "RateLimiter는 시간당 호출 수를, Bulkhead는 같은 순간의 동시 실행 수를 제한한다. 호출이 느려질 때 자원을 지키는 것은 Bulkhead다."
            ]
          ],
          answer: "Resilience4j Bulkhead는 특정 외부 호출이 동시에 쓸 수 있는 자원을 제한해, 한 의존성이 느려져도 전체 스레드가 잠식되지 않게 합니다. 기본인 세마포어 방식은 동시 호출 수만 제한하고, 스레드 풀 방식은 별도 풀에서 비동기로 실행합니다. 느린 추천 API가 톰캣 스레드를 모두 묶어 결제까지 멈추는 상황을 막는 데 씁니다.",
          analogy: "배의 격벽과 같습니다. 한 칸에 물이 차도 격벽이 막아 배 전체가 가라앉지 않습니다.",
          followUps: [
            [
              "세마포어 Bulkhead와 스레드 풀 Bulkhead는 언제 각각 쓰나요?",
              "동기 코드에서 동시 실행 수만 제한하면 되면 오버헤드가 적은 세마포어 방식을 씁니다. 호출 스레드와 실행 스레드를 완전히 분리하고 비동기 결과(CompletableFuture)가 필요하면 스레드 풀 방식을 씁니다."
            ]
          ],
          related: [
            "spring/http-keoneksyeon-pul",
            "spring/resilience4j-ratelimiter",
            "spring/thread-per-request",
            "spring/gasang-seuredeu"
          ]
        },
        {
          id: "spring/resilience4j-timelimiter",
          slug: "resilience4j-timelimiter",
          title: "Resilience4j TimeLimiter",
          deep: false,
          def: "비동기 호출(`CompletableFuture`, `Mono` 등)에 최대 실행 시간을 두고, 넘으면 `TimeoutException`으로 실패시키는 Resilience4j 모듈이다.",
          why: "비동기 호출이 끝없이 늘어져 자원을 붙잡고 호출자가 무한정 기다리는 것을 막기 위해서다.",
          how: [
            "- `timeoutDuration`(기본 1초): 허용 시간.",
            "- `cancelRunningFuture`(기본 true): 시간 초과 시 실행 중인 Future 취소를 시도한다.",
            "`@TimeLimiter`는 반환 타입이 `CompletableFuture`나 리액티브 타입일 때만 동작한다. 동기 메서드에는 적용되지 않는다.",
            "동기 HTTP 호출은 TimeLimiter 대신 HTTP 클라이언트의 연결·읽기 타임아웃으로 제한하는 것이 정석이다. 그래야 소켓까지 실제로 정리된다."
          ],
          use: [
            "여러 외부 조회를 CompletableFuture로 병렬 실행하면서 각각 `@TimeLimiter`로 1초 상한을 둔다.",
            "리액티브 체인에서 TimeLimiterOperator로 느린 하위 호출을 끊고 fallback 값을 낸다."
          ],
          warn: ["TimeLimiter가 시간 초과를 알려도 내부 블로킹 작업이 인터럽트에 반응하지 않으면 스레드는 계속 일한다. HTTP 클라이언트 타임아웃을 함께 설정한다."],
          myth: [
            [
              "@TimeLimiter를 붙이면 동기 메서드에도 타임아웃이 걸린다.",
              "반환 타입이 CompletableFuture나 리액티브 타입일 때만 동작한다. 동기 메서드는 HTTP 클라이언트 타임아웃으로 제한한다."
            ]
          ],
          answer: "Resilience4j TimeLimiter는 CompletableFuture나 리액티브 타입 같은 비동기 호출에 최대 실행 시간을 두는 모듈입니다. 시간이 넘으면 TimeoutException으로 실패시키고 Future 취소를 시도합니다. 동기 HTTP 호출은 TimeLimiter가 아니라 HTTP 클라이언트의 연결·읽기 타임아웃으로 제한합니다.",
          followUps: [
            [
              "TimeLimiter로 타임아웃이 나면 실제 HTTP 요청도 끊기나요?",
              "반드시 그렇지는 않습니다. Future 취소를 시도할 뿐 블로킹 I/O가 인터럽트에 반응하지 않으면 요청은 계속 진행됩니다. 그래서 HTTP 클라이언트 자체 타임아웃을 함께 설정합니다."
            ]
          ],
          related: ["spring/oebu-hochul-taimaut", "spring/resilience4j-aeneoteisyeon-sunseo"]
        },
        {
          id: "spring/resilience4j-aeneoteisyeon-sunseo",
          slug: "resilience4j-aeneoteisyeon-sunseo",
          title: "Resilience4j 애너테이션 순서",
          deep: false,
          def: "한 메서드에 Resilience4j 애너테이션을 여러 개 붙였을 때 각 애스펙트가 감싸는 순서로, 기본은 Retry가 가장 바깥이다.",
          why: "적용 순서에 따라 재시도가 서킷 브레이커의 실패 집계에 포함되는지 등 동작이 달라지기 때문이다.",
          how: [
            "기본 적용 순서(바깥 → 안): `Retry ( CircuitBreaker ( RateLimiter ( TimeLimiter ( Bulkhead ( 메서드 ) ) ) ) )`.",
            "각 애스펙트의 `Ordered` 값이 정해져 있어 Retry가 가장 먼저(가장 바깥) 실행되고 Bulkhead가 가장 안쪽이다.",
            "- 의미: 재시도 한 번 한 번이 서킷 브레이커에 각각 기록된다. 서킷이 열리면 재시도도 `CallNotPermittedException`을 받는다.",
            "- 순서 변경: `resilience4j.retry.retry-aspect-order`, `resilience4j.circuitbreaker.circuit-breaker-aspect-order` 등에 값을 주며, 값이 클수록 우선순위가 높아(바깥) 먼저 실행된다.",
            "`CallNotPermittedException`은 Retry의 `ignoreExceptions`에 넣어, 서킷이 열렸을 때 쓸데없이 재시도하지 않게 한다."
          ],
          flow: ["Retry", "CircuitBreaker", "RateLimiter", "TimeLimiter", "Bulkhead", "실제 메서드"],
          code: "@Retry(name = \"payment\")\n@CircuitBreaker(name = \"payment\", fallbackMethod = \"payFallback\")\n@Bulkhead(name = \"payment\")\npublic PayResult pay(PayCommand cmd) {\n    return paymentApi.pay(cmd);\n}\n// 실행: Retry -> CircuitBreaker -> Bulkhead -> pay()",
          codeLang: "java",
          use: [
            "결제 호출에 Retry, CircuitBreaker, Bulkhead를 함께 걸고 fallback은 CircuitBreaker에만 두어 최종 실패 시 한 번만 실행되게 한다.",
            "서킷이 열려도 재시도가 대기 시간만큼 지연시키던 문제를 `CallNotPermittedException` 무시 설정으로 해결한다."
          ],
          warn: ["애너테이션을 적는 순서는 실행 순서와 무관하다. 순서를 바꾸려면 aspect-order 프로퍼티를 바꿔야 한다."],
          myth: [["애너테이션을 위에 적은 것이 먼저 실행된다.", "자바 애너테이션 선언 순서는 의미가 없다. 각 애스펙트의 order 값이 실행 순서를 결정한다."]],
          answer: "Resilience4j 애너테이션을 함께 쓰면 기본적으로 Retry가 가장 바깥에서 CircuitBreaker, RateLimiter, TimeLimiter, Bulkhead 순으로 감쌉니다. 애너테이션을 적는 순서가 아니라 각 애스펙트의 order 값으로 결정되며, 프로퍼티로 바꿀 수 있습니다. 이 구조에서는 각 재시도가 서킷에 실패로 집계되므로 CallNotPermittedException은 재시도 대상에서 빼 둡니다.",
          analogy: "양파 껍질처럼 바깥 층부터 벗겨 들어갑니다. 가장 바깥의 Retry가 안쪽 전체를 여러 번 다시 실행합니다.",
          qa: [
            "Retry와 CircuitBreaker를 함께 쓰면 어떤 순서로 동작하나요?",
            "기본적으로 Retry가 CircuitBreaker를 감쌉니다. 그래서 각 재시도 시도가 서킷 브레이커에 실패로 집계되고, 서킷이 열리면 이후 시도는 CallNotPermittedException으로 즉시 실패합니다. 이 예외는 재시도 대상에서 제외해 두어야 열린 서킷에 불필요한 대기가 생기지 않습니다."
          ],
          followUps: [
            [
              "안쪽 애너테이션에 fallback을 지정하면 어떤 문제가 생기나요?",
              "안쪽 애스펙트에서 fallback이 정상 값을 반환하면 바깥 Retry는 성공으로 보고 재시도하지 않고, 서킷도 실패를 집계하지 못할 수 있습니다. 그래서 fallback은 보통 가장 바깥에서 최종 실패를 처리하는 곳 하나에만 둡니다."
            ]
          ],
          related: [
            "spring/aspect-silhaeng-sunseo",
            "spring/resilience4j-retry",
            "spring/resilience4j-circuitbreaker",
            "spring/resilience4j-fallback"
          ]
        }
      ]
    },
    {
      name: "Spring Retry",
      compare: {
        cols: ["기준", "@Retryable", "Resilience4j Retry"],
        rows: [
          ["라이브러리", "spring-retry", "resilience4j-spring-boot3"],
          ["설정 위치", "주로 애너테이션 속성", "application.yml 인스턴스별 설정"],
          ["복구 메서드", "@Recover", "fallbackMethod"],
          ["함께 쓰는 기능", "재시도 중심", "CircuitBreaker, RateLimiter, Bulkhead와 조합"],
          ["메트릭", "직접 구성", "Micrometer 메트릭 자동 제공"]
        ]
      },
      concepts: [
        {
          id: "spring/retryable",
          slug: "retryable",
          title: "@Retryable",
          deep: false,
          def: "Spring Retry 라이브러리에서 메서드에 붙여 예외 발생 시 선언적으로 재시도하게 하는 애너테이션이다.",
          why: "일시적인 네트워크 오류로 실패한 호출을 재시도 코드를 직접 반복해 쓰지 않고 선언적으로 다시 시도하기 위해서다.",
          how: [
            "`spring-retry`와 AOP 의존성을 추가하고 설정 클래스에 `@EnableRetry`를 붙인다.",
            "- `retryFor`: 재시도할 예외(2.0부터 `value`, `include` 대신 권장). `noRetryFor`: 제외할 예외.",
            "- `maxAttempts`(기본 3): 첫 호출을 포함한 총 시도 횟수.",
            "- `backoff = @Backoff(delay = 500, multiplier = 2, maxDelay = 5000, random = true)`: 지수 백오프와 지터.",
            "코드로 제어하려면 `RetryTemplate`을 쓴다.",
            "Spring Retry는 현재 유지보수 단계이며, 스프링 7에는 같은 이름의 `@Retryable`(`org.springframework.resilience.annotation`)과 `@EnableResilientMethods`가 프레임워크 핵심 기능으로 들어왔다. 부트 3.x에서는 Spring Retry 또는 Resilience4j를 쓴다."
          ],
          code: "@Retryable(retryFor = ExternalUnavailableException.class,\n           maxAttempts = 3,\n           backoff = @Backoff(delay = 500, multiplier = 2))\npublic Stock getStock(long productId) {\n    return inventoryApi.getStock(productId);\n}",
          codeLang: "java",
          use: [
            "낙관적 락 충돌(`ObjectOptimisticLockingFailureException`) 시 트랜잭션 바깥 메서드에서 `@Retryable`로 다시 시도한다.",
            "외부 API 일시 장애에 `@Backoff(delay = 500, multiplier = 2)`로 지수 백오프 재시도를 건다."
          ],
          warn: ["`@Transactional` 메서드 안에서 재시도하면 이미 롤백 표시된 같은 트랜잭션에서 다시 시도하게 된다. 재시도는 트랜잭션 바깥(호출하는 쪽)에 둔다."],
          myth: [
            [
              "@Transactional 메서드에 @Retryable을 같이 붙이면 매번 새 트랜잭션으로 재시도된다.",
              "애스펙트 순서에 따라 같은 트랜잭션 안에서 재시도될 수 있고, 이미 롤백 표시된 트랜잭션이면 결국 실패한다. 재시도 메서드를 트랜잭션 메서드의 호출자 쪽에 둔다."
            ]
          ],
          answer: "@Retryable은 Spring Retry에서 메서드에 붙여 지정한 예외가 나면 선언적으로 재시도하게 하는 애너테이션입니다. @EnableRetry로 켜고 retryFor, maxAttempts, @Backoff로 대상 예외와 횟수, 백오프를 지정합니다. AOP 프록시 기반이라 셀프 호출에는 적용되지 않고, 트랜잭션 안쪽이 아니라 바깥에 두어야 새 트랜잭션으로 다시 시도됩니다.",
          followUps: [
            [
              "Spring Retry와 Resilience4j Retry 중 무엇을 쓰나요?",
              "재시도만 필요하면 Spring Retry가 간단하지만, 서킷 브레이커나 Bulkhead와 함께 쓰고 설정을 yml로 관리하며 메트릭까지 보려면 Resilience4j가 낫습니다. 스프링 7부터는 프레임워크 자체 @Retryable도 있어 버전에 맞게 선택합니다."
            ]
          ],
          related: ["spring/recover", "spring/resilience4j-retry", "spring/spring-aop", "spring/selpeu-hochul-munje"]
        },
        {
          id: "spring/recover",
          slug: "recover",
          title: "@Recover",
          deep: false,
          def: "`@Retryable` 재시도를 모두 소진했을 때 호출되는 복구 메서드를 지정하는 Spring Retry 애너테이션이다.",
          why: "재시도를 모두 소진한 뒤에도 예외를 그대로 터뜨리지 않고 대체 처리나 실패 기록으로 마무리하기 위해서다.",
          how: [
            "같은 클래스에 두고, 첫 파라미터는 처리할 예외 타입, 나머지는 원래 메서드의 파라미터와 같은 순서·타입으로 선언한다. 반환 타입도 같아야 한다.",
            "조건에 맞는 `@Recover`가 여러 개면 예외 타입이 가장 가까운 것이 선택되며, `@Retryable(recover = \"메서드명\")`으로 명시할 수도 있다.",
            "맞는 복구 메서드가 없으면 마지막 예외가 그대로 호출자에게 던져진다."
          ],
          code: "@Recover\npublic Stock recover(ExternalUnavailableException e, long productId) {\n    log.warn(\"재고 조회 실패, 캐시 값 사용 productId={}\", productId);\n    return stockCache.getOrUnknown(productId);\n}",
          codeLang: "java",
          use: [
            "환율 API 재시도가 모두 실패하면 `@Recover`에서 마지막으로 저장된 환율을 반환한다.",
            "알림 발송 재시도 실패 시 실패 테이블에 저장해 운영자가 재처리하게 한다."
          ],
          warn: ["반환 타입이나 파라미터가 조금만 달라도 복구 메서드로 인식되지 않아, 조용히 무시되고 예외가 던져진다."],
          answer: "@Recover는 @Retryable의 재시도를 모두 소진했을 때 호출되는 복구 메서드를 지정합니다. 첫 파라미터는 처리할 예외, 나머지는 원래 메서드 파라미터와 같게 두고 반환 타입도 맞춰야 합니다. 시그니처가 맞지 않으면 조용히 무시되고 예외가 던져지므로 테스트로 확인합니다.",
          followUps: [
            [
              "@Recover 메서드가 여러 개면 어떤 것이 호출되나요?",
              "발생한 예외 타입에 가장 가깝게 맞는 메서드가 선택됩니다. 헷갈리면 @Retryable의 recover 속성에 메서드 이름을 명시합니다."
            ]
          ],
          related: ["spring/retryable", "spring/resilience4j-fallback"]
        },
        {
          id: "spring/jaesido-baekopeu-jiteo",
          slug: "jaesido-baekopeu-jiteo",
          title: "재시도 백오프 · 지터",
          deep: false,
          def: "재시도 사이 대기 시간을 점점 늘리고(백오프) 무작위 값을 섞어(지터), 여러 클라이언트의 재시도가 한순간에 몰리지 않게 하는 방법이다.",
          why: "모든 클라이언트가 같은 간격으로 동시에 재시도해 회복 중인 서버를 다시 쓰러뜨리는 것을 막기 위해서다.",
          how: [
            "고정 간격 재시도는 장애 직후 모든 클라이언트가 같은 박자로 다시 몰려 상대 서버를 또 쓰러뜨린다(thundering herd).",
            "- 지수 백오프: 300ms → 600ms → 1.2s처럼 배수로 늘리고 `maxDelay`로 상한을 둔다.",
            "- 지터: 계산된 대기 시간에 무작위 범위를 섞어 재시도 시점을 흩뜨린다.",
            "- Spring Retry: `@Backoff(delay, multiplier, maxDelay, random = true)`.",
            "- Resilience4j: `enableExponentialBackoff`, `enableRandomizedWait` 또는 `IntervalFunction.ofExponentialRandomBackoff(...)`.",
            "전체 재시도 시간이 사용자 요청 타임아웃보다 길어지지 않도록 횟수와 상한을 함께 계산한다."
          ],
          use: [
            "수백 대 인스턴스가 같은 외부 API를 호출하는 환경에서 지터를 넣어 장애 복구 직후의 재시도 폭주를 막는다.",
            "429 응답의 Retry-After 헤더 값을 읽어 그 시간 이후에 재시도한다."
          ],
          warn: ["외부 API가 429·503과 함께 `Retry-After` 헤더를 주면 임의 백오프보다 그 값을 우선한다."],
          answer: "백오프는 재시도 간격을 점점 늘리는 것이고, 지터는 그 간격에 무작위 값을 섞는 것입니다. 고정 간격으로 재시도하면 장애 직후 모든 클라이언트가 같은 박자로 몰려 회복 중인 서버를 다시 쓰러뜨립니다. 그래서 지수 백오프에 상한과 지터를 함께 두고, 서버가 Retry-After를 주면 그 값을 따릅니다.",
          analogy: "정전 후 모든 집이 동시에 에어컨을 켜면 다시 정전이 납니다. 집마다 조금씩 시간을 두고 켜는 것이 지터입니다.",
          followUps: [
            [
              "지수 백오프만으로는 왜 부족한가요?",
              "모든 클라이언트가 같은 시점에 실패했다면 지수 백오프를 해도 재시도 시점이 계속 같아 몰림이 반복됩니다. 무작위 지터를 섞어야 재시도가 시간축에 퍼집니다."
            ]
          ],
          related: ["spring/resilience4j-retry", "spring/retryable", "spring/oebu-hochul-taimaut"]
        }
      ]
    },
    {
      name: "재시도 안전성",
      compare: {
        cols: ["기준", "재시도와 멱등성", "Idempotency-Key"],
        rows: [
          ["성격", "설계 원칙", "구현 패턴"],
          ["해결하는 문제", "재시도 시 중복 처리", "비멱등 POST의 중복 실행"],
          ["핵심 방법", "멱등한 연산만 재시도", "키별 처리 결과 저장·재사용"],
          ["적용 대상", "GET·PUT·DELETE (멱등)", "결제·주문 생성 API"],
          ["주의점", "타임아웃이 실제론 성공일 수 있음", "동시 요청 시 키 선점 락 필요"]
        ]
      },
      concepts: [
        {
          id: "spring/jaesidowa-myeokdeungseong",
          slug: "jaesidowa-myeokdeungseong",
          title: "재시도와 멱등성",
          deep: true,
          def: "같은 요청이 여러 번 처리되어도 결과가 한 번 처리한 것과 같아야(멱등) 재시도를 안전하게 할 수 있다는 원칙이다.",
          why: "읽기 타임아웃은 \"요청이 실패했다\"가 아니라 \"결과를 모른다\"는 뜻이다. 상대는 이미 처리했을 수 있으므로, 멱등하지 않은 요청을 재시도하면 이중 결제·중복 주문이 생긴다.",
          how: [
            "HTTP 의미상 GET, PUT, DELETE는 멱등하고 POST, PATCH는 멱등하지 않다. 하지만 실제 구현이 명세를 지키는지는 상대 API 문서로 확인한다.",
            "1) 요청이 상대에 도달하지 않은 것이 확실한 실패(연결 실패, 풀 대기 시간 초과)는 어떤 메서드든 재시도할 수 있다.",
            "2) 도달했을 수 있는 실패(읽기 타임아웃, 연결 끊김, 502·504)는 멱등한 요청만 재시도한다.",
            "3) 멱등하지 않은 요청을 재시도해야 하면 `Idempotency-Key`처럼 요청 고유 키를 보내 상대가 중복을 걸러 내게 한다.",
            "4) 키 지원이 없으면 재시도 대신 상태 조회 API로 처리 여부를 먼저 확인한다.",
            "- 재시도 계층 중복 주의: HTTP 클라이언트, Feign, Resilience4j, 메시지 컨슈머가 각각 재시도하면 시도 횟수가 곱으로 늘어난다. 재시도는 한 계층에만 둔다."
          ],
          flow: ["호출 실패", "요청이 상대에 도달했는지 판단", "도달 안 함 → 재시도", "도달했을 수 있음 → 멱등성 확인", "멱등 키 있으면 재시도", "없으면 상태 조회 후 처리"],
          code: "// 결제 요청: 재시도해도 같은 키를 보내 상대가 중복 처리하지 않게 한다\nString idempotencyKey = \"order-\" + orderId; // 주문 단위로 고정된 키\n\n@Retry(name = \"payment\")\npublic PayResult pay(long orderId, Money amount, String idempotencyKey) {\n    return paymentClient.post()\n            .uri(\"/payments\")\n            .header(\"Idempotency-Key\", idempotencyKey)\n            .body(new PayRequest(orderId, amount))\n            .retrieve()\n            .body(PayResult.class);\n}",
          codeLang: "java",
          use: [
            "결제 요청에 주문 번호 기반 Idempotency-Key를 넣어 타임아웃 후 재시도해도 결제가 한 번만 되게 한다.",
            "HTTP 클라이언트, Feign, Resilience4j 세 곳에 재시도가 걸려 실제로 27번 호출되던 문제를 Resilience4j 한 곳으로 정리한다."
          ],
          warn: ["재시도할 때마다 `UUID.randomUUID()`로 새 키를 만들면 멱등 키의 의미가 없다. 키는 비즈니스 요청 단위로 한 번 만들고 재시도 내내 같은 값을 쓴다."],
          myth: [
            ["타임아웃이 났으면 요청은 실패한 것이다.", "타임아웃은 응답을 못 받았다는 뜻일 뿐, 상대 서버는 이미 처리를 끝냈을 수 있다."],
            [
              "PUT은 멱등하니 항상 안전하게 재시도할 수 있다.",
              "HTTP 명세상 멱등이어도 상대 구현이 버전 증가나 이력 생성처럼 부수 효과를 낼 수 있어 API 문서로 확인해야 한다."
            ]
          ],
          answer: "재시도는 같은 요청을 여러 번 처리해도 결과가 같은 멱등한 요청에만 안전합니다. 읽기 타임아웃은 상대가 이미 처리했을 수 있다는 뜻이라, 결제 같은 POST를 그대로 재시도하면 이중 결제가 납니다. 그래서 연결 실패처럼 도달하지 않은 것이 확실한 경우만 바로 재시도하고, 그 외에는 멱등 키를 보내거나 상태 조회로 확인한 뒤 처리합니다.",
          analogy: "엘리베이터 버튼을 여러 번 눌러도 한 번 부른 것과 같지만(멱등), 자판기 결제 버튼을 여러 번 누르면 여러 번 결제됩니다(비멱등).",
          qa: [
            "결제 API 호출이 타임아웃 났을 때 어떻게 처리하나요?",
            "타임아웃은 상대가 처리했는지 모르는 상태라 그냥 재시도하면 이중 결제가 날 수 있습니다. 그래서 주문 단위로 고정한 멱등 키를 헤더에 담아 재시도하거나, 키를 지원하지 않으면 결제 상태 조회 API로 처리 여부를 먼저 확인합니다. 확인이 안 되면 주문을 결제 확인 중 상태로 두고 비동기로 대사해 정리합니다."
          ],
          followUps: [
            [
              "재시도 계층이 여러 개면 왜 문제가 되나요?",
              "각 계층의 시도 횟수가 곱으로 늘어 3회씩 세 계층이면 최대 27번 호출됩니다. 장애 중인 상대에게 부하를 폭증시키므로 재시도는 한 계층에만 둡니다."
            ],
            [
              "메시지 컨슈머에서 외부 API를 호출할 때도 멱등성이 필요한가요?",
              "네. 메시지 브로커는 보통 최소 한 번 전달이라 같은 메시지가 다시 올 수 있으므로, 처리 이력 테이블이나 멱등 키로 중복 처리를 막아야 합니다."
            ]
          ],
          related: [
            "spring/idempotency-key",
            "spring/resilience4j-retry",
            "spring/retryable",
            "spring/oebu-hochul-taimaut"
          ]
        },
        {
          id: "spring/idempotency-key",
          slug: "idempotency-key",
          title: "Idempotency-Key",
          deep: false,
          def: "클라이언트가 요청마다 고유 키를 헤더로 보내고 서버가 키별 처리 결과를 저장해, 같은 키의 재요청에는 저장된 결과를 돌려주는 멱등성 구현 패턴이다.",
          why: "타임아웃 후 클라이언트가 재요청했을 때 결제나 주문이 두 번 처리되는 것을 막기 위해서다.",
          how: [
            "Stripe 같은 결제 API가 쓰는 방식이며 IETF에서 `Idempotency-Key` 헤더 표준화가 진행 중이다.",
            "- 첫 요청: 키를 \"처리 중\"으로 저장(유니크 제약)한 뒤 처리하고, 결과를 키와 함께 저장한다.",
            "- 같은 키 재요청: 저장된 응답을 그대로 돌려준다. 처리 중이면 409 등으로 응답한다.",
            "- 같은 키에 다른 본문: 잘못된 사용이므로 422 등으로 거절한다.",
            "- 보관 기간: 키는 일정 시간(예: 24시간) 후 만료시킨다.",
            "우리 API가 이 패턴을 제공하면 클라이언트가 안심하고 재시도할 수 있고, 외부 API가 지원하면 우리 쪽 재시도를 안전하게 만든다."
          ],
          flow: ["클라이언트가 키 생성", "헤더에 담아 요청", "서버가 키 선점 (유니크)", "처리 후 결과 저장", "같은 키 재요청 시 저장 결과 반환"],
          use: [
            "우리 주문 API에 Idempotency-Key를 받아, 모바일 앱이 네트워크 불안정으로 재전송해도 주문이 한 번만 생성되게 한다.",
            "Stripe 결제 API 호출 시 주문 ID 기반 키를 보내 우리 쪽 재시도를 안전하게 만든다."
          ],
          warn: ["\"조회 후 없으면 저장\"을 따로 하면 동시 요청이 둘 다 통과한다. DB 유니크 제약이나 Redis `SET NX`처럼 원자적인 선점으로 구현한다."],
          myth: [["재시도할 때마다 새 UUID를 키로 보내면 된다.", "키가 바뀌면 서버는 다른 요청으로 보고 다시 처리한다. 키는 원래 요청 하나에 고정해야 한다."]],
          answer: "Idempotency-Key는 클라이언트가 요청마다 고유 키를 헤더로 보내고, 서버가 키별 처리 결과를 저장해 같은 키의 재요청에는 저장된 결과를 돌려주는 패턴입니다. 키를 원자적으로 선점해야 동시 중복 요청을 막을 수 있어 DB 유니크 제약이나 Redis SET NX로 구현합니다. 키는 비즈니스 요청 단위로 한 번 만들고 재시도 내내 같은 값을 써야 합니다.",
          analogy: "택배 송장 번호와 같습니다. 같은 송장 번호로 접수가 두 번 들어와도 택배사는 이미 접수된 건이라고 알려 줍니다.",
          followUps: [
            [
              "같은 키로 처리 중에 두 번째 요청이 오면 어떻게 하나요?",
              "첫 요청이 키를 \"처리 중\"으로 선점했으므로 두 번째 요청은 409 Conflict 등으로 응답하고, 클라이언트는 잠시 후 다시 조회하게 합니다. 처리 완료 후에는 저장된 응답을 그대로 돌려줍니다."
            ]
          ],
          related: ["spring/jaesidowa-myeokdeungseong", "spring/restcontrolleradvice"]
        }
      ]
    }
  ]
};

export default topic;
