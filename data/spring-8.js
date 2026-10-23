(window.MINDMAP = window.MINDMAP || {})['spring-8'] = {
  name: '서버 · 동시성',
  groups: [
    { name: '서블릿 컨테이너', items: [
      { t: '서블릿 컨테이너(WAS)', deep: false,
        d: '서블릿을 실행하고 HTTP 요청을 서블릿 호출로 바꿔 주는 실행 환경이다. 톰캣이 대표적이다.',
        how: [
          '서블릿 컨테이너는 웹 서버 기능과 서블릿 실행 기능을 함께 가진다. 스프링 부트는 톰캣을 라이브러리로 내장해 `main()` 실행 시 함께 띄운다.',
          '- 소켓 연결을 받고 HTTP 요청 메시지를 파싱해 `HttpServletRequest`, `HttpServletResponse` 객체를 만든다.',
          '- 요청마다 스레드 풀에서 스레드를 꺼내 서블릿(스프링에서는 DispatcherServlet)을 실행한다.',
          '- 필터 체인, 세션, 에러 페이지(`/error`) 처리를 지원한다.',
          '스프링 MVC 입장에서 톰캣은 "요청을 받아 DispatcherServlet까지 전달하는 바깥 껍데기"다.'
        ],
        warn: ['톰캣 설정(스레드 수, 타임아웃)은 애플리케이션 처리량에 직접 영향을 주므로 기본값을 그대로 운영에 쓰기 전에 확인한다.'],
        rel: ['서블릿 생명주기', 'Thread per Request', '웹 서버와 WAS'] },
      { t: '서블릿 생명주기', deep: false,
        d: '서블릿 객체가 생성되어 요청을 처리하고 소멸하기까지의 단계로, 컨테이너가 관리한다.',
        how: [
          '1) `init()`: 서블릿 객체를 처음 만들 때 한 번 호출된다. 서블릿은 컨테이너 안에 하나만 존재하는 싱글톤이다.',
          '2) `service()`: 요청이 올 때마다 호출되어 HTTP 메서드에 따라 `doGet()`, `doPost()` 등으로 나뉜다. 여러 스레드가 같은 서블릿 객체의 `service()`를 동시에 실행한다.',
          '3) `destroy()`: 컨테이너가 종료될 때 한 번 호출된다.',
          'DispatcherServlet도 서블릿이므로 같은 생명주기를 따르며, `init` 시점에 스프링 MVC 구성 요소(HandlerMapping 등)를 준비한다.'
        ],
        warn: ['서블릿과 스프링 빈은 싱글톤이고 여러 스레드가 동시에 실행하므로 인스턴스 필드에 요청별 상태를 두면 안 된다.'],
        rel: ['서블릿 컨테이너(WAS)'] },
      { t: '웹 서버와 WAS', deep: false,
        d: '웹 서버(Nginx)는 정적 리소스와 프록시를, WAS(톰캣)는 애플리케이션 로직 실행을 맡는다.',
        how: [
          '- 웹 서버: HTML, 이미지 같은 정적 파일 제공, 리버스 프록시, SSL 종료, 로드 밸런싱, 요청 버퍼링을 담당한다. 가볍고 동시 연결 처리에 강하다.',
          '- WAS: 자바 코드를 실행해 동적 응답을 만든다. 웹 서버 기능도 있지만 정적 파일 제공은 웹 서버보다 비효율적이다.',
          '실무에서는 클라이언트 → Nginx(또는 로드 밸런서) → 톰캣 구조를 많이 쓴다. 웹 서버가 느린 클라이언트와의 연결을 대신 버텨 주어 WAS 스레드가 오래 묶이지 않는다.'
        ],
        rel: ['서블릿 컨테이너(WAS)'] }
    ]},
    { name: '요청 처리 모델', items: [
      { t: 'Thread per Request', deep: true,
        d: '요청 하나에 스레드 하나를 할당해 응답이 끝날 때까지 그 스레드가 전담하는 처리 모델이다. 스프링 MVC와 톰캣의 기본 방식이다.',
        why: '코드를 위에서 아래로 읽히는 동기·블로킹 방식으로 쉽게 작성할 수 있고, 요청마다 스레드가 분리되어 디버깅과 트랜잭션·보안 컨텍스트 관리(ThreadLocal)가 단순해진다.',
        how: [
          '1) 클라이언트 연결이 들어오면 톰캣 커넥터가 받아 요청을 읽는다.',
          '2) 작업 스레드 풀에서 놀고 있는 스레드 하나를 꺼내 요청을 맡긴다.',
          '3) 그 스레드가 필터 → DispatcherServlet → 컨트롤러 → 서비스 → DB 호출까지 모두 실행한다. DB나 외부 API 응답을 기다리는 동안 스레드는 블로킹된 채 대기한다.',
          '4) 응답을 쓰고 나면 스레드를 풀에 반납한다.',
          '5) 모든 스레드가 바쁘면 새 연결은 대기 큐(accept-count)에서 기다리고, 큐마저 차면 연결이 거절된다.',
          '동시에 처리할 수 있는 요청 수는 최대 스레드 수(기본 200)로 제한된다. 요청 대부분이 I/O를 기다리는 시간이라면 CPU는 놀고 있는데 스레드가 부족해지는 상황이 생긴다.'
        ],
        code: `# application.yml
server:
  tomcat:
    threads:
      max: 200        # 최대 작업 스레드
      min-spare: 10   # 항상 유지하는 스레드
    accept-count: 100 # 스레드가 모두 바쁠 때 대기 큐
    max-connections: 8192
    connection-timeout: 5s`,
        warn: [
          '느린 외부 API 하나 때문에 모든 스레드가 대기하면 서버 전체가 응답하지 못한다. 외부 호출에는 반드시 타임아웃을 건다.',
          '스레드 수만 늘리면 DB 커넥션 풀(HikariCP 기본 10개)에서 병목이 옮겨 갈 뿐이다. 두 값을 함께 본다.',
          '스레드를 너무 많이 두면 메모리(스레드당 약 1MB 스택)와 컨텍스트 스위칭 비용이 커진다.'
        ],
        qa: ['동시 요청이 톰캣 스레드 풀보다 많으면 어떻게 되나요?', '최대 스레드 수만큼은 동시에 처리하고, 나머지 연결은 accept-count 크기의 대기 큐에서 스레드가 반납되기를 기다립니다. 대기 큐까지 가득 차면 새 연결은 거절됩니다. 그래서 외부 호출에 타임아웃을 걸어 스레드가 오래 묶이지 않게 하고, 스레드 수와 DB 커넥션 풀 크기를 함께 조정합니다. I/O 대기가 많다면 가상 스레드나 WebFlux도 대안이 됩니다.'],
        rel: ['톰캣 스레드 풀 설정', '외부 호출 타임아웃', '가상 스레드', 'WebFlux'] },
      { t: '톰캣 스레드 풀 설정', deep: false,
        d: '톰캣이 동시에 처리할 요청 수와 대기 방식을 정하는 설정 값들이다.',
        how: [
          '- `server.tomcat.threads.max`(기본 200): 동시에 요청을 처리하는 최대 작업 스레드 수.',
          '- `server.tomcat.threads.min-spare`(기본 10): 요청이 없어도 유지하는 최소 스레드 수.',
          '- `server.tomcat.accept-count`(기본 100): 모든 스레드가 바쁠 때 OS 수준에서 대기시키는 연결 큐 크기.',
          '- `server.tomcat.max-connections`(기본 8192): NIO 커넥터가 동시에 유지할 수 있는 연결 수. 연결은 유지하되 처리 스레드는 요청이 있을 때만 쓴다.',
          '적정 값은 부하 테스트로 정한다. 응답 시간이 대부분 I/O 대기면 스레드를 늘리는 효과가 있고, CPU 연산이 많으면 코어 수 이상으로 늘려도 이득이 적다.'
        ],
        warn: ['스레드를 늘리기 전에 DB 커넥션 풀 크기와 외부 API 처리 한도를 확인한다. 뒤쪽 자원이 감당하지 못하면 대기만 늘어난다.'],
        rel: ['Thread per Request'] },
      { t: '외부 호출 타임아웃', deep: false,
        d: '외부 API·DB 호출이 응답하지 않을 때 요청 스레드가 무한정 기다리지 않도록 최대 대기 시간을 정하는 설정이다.',
        how: [
          '- 연결 타임아웃: 상대 서버와 TCP 연결을 맺는 데 걸리는 최대 시간.',
          '- 읽기(응답) 타임아웃: 연결 후 응답 데이터를 기다리는 최대 시간.',
          '스프링 6.1+의 `RestClient`, `WebClient`, `RestTemplate`은 기본적으로 타임아웃이 무제한이거나 매우 길 수 있으므로 `ClientHttpRequestFactory`나 HTTP 클라이언트 설정으로 명시한다. DB는 HikariCP `connectionTimeout`, 쿼리 타임아웃으로 제한한다.',
          'Thread per Request 모델에서 타임아웃이 없으면 느린 외부 서비스 하나가 톰캣 스레드를 모두 묶어 장애를 전파한다.'
        ],
        code: `@Bean
RestClient paymentClient(RestClient.Builder builder) {
    var factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(Duration.ofSeconds(2));
    factory.setReadTimeout(Duration.ofSeconds(3));
    return builder.baseUrl("https://pay.example.com")
                  .requestFactory(factory)
                  .build();
}`,
        warn: ['타임아웃 값은 상대 서비스의 평소 응답 시간(p99)보다 약간 크게 잡는다. 너무 짧으면 정상 요청까지 실패한다.'],
        rel: ['Thread per Request'] }
    ]},
    { name: 'WebFlux · 리액티브', items: [
      { t: 'WebFlux', deep: false,
        d: '스프링 5에서 추가된 논블로킹 리액티브 웹 스택으로, 적은 스레드로 많은 동시 연결을 처리한다.',
        how: [
          '기본 서버는 Netty이며, 요청마다 스레드를 붙잡지 않고 I/O가 준비되면 이어서 처리하는 이벤트 기반으로 동작한다.',
          '- 적합: 동시 연결이 매우 많은 서비스, 외부 API를 많이 호출하는 게이트웨이(Spring Cloud Gateway), 스트리밍, SSE.',
          '- 부적합: JPA·JDBC 같은 블로킹 라이브러리를 써야 할 때. DB도 R2DBC 같은 리액티브 드라이버가 필요하다.',
          '- 단점: 학습 곡선이 가파르고 스택 트레이스를 읽기 어렵다.',
          'Java 21 가상 스레드 이후로는 일반 API 서버라면 MVC + 가상 스레드를 택하는 경우가 늘었다.'
        ],
        warn: ['WebFlux에서 블로킹 호출을 하면 이벤트 루프가 멈춰 전체 처리량이 급락한다.'],
        qa: ['MVC와 WebFlux는 언제 각각 선택하나요?', '블로킹 라이브러리(JPA 등)를 쓰는 일반적인 API 서버는 MVC가 단순하고 생태계가 넓습니다. 동시 연결이 매우 많고 외부 I/O 비중이 높으며 전 구간을 논블로킹으로 구성할 수 있을 때 WebFlux가 유리합니다. 최근에는 가상 스레드로 MVC에서도 높은 동시성을 얻을 수 있어 선택 기준이 더 명확해졌습니다.'],
        rel: ['이벤트 루프', 'Mono', 'Flux', '가상 스레드'] },
      { t: '이벤트 루프', deep: false,
        d: '소수의 스레드가 I/O 이벤트를 감시하다가 준비된 작업을 차례로 실행하는 방식이다. WebFlux(Netty)의 처리 기반이다.',
        how: [
          '보통 CPU 코어 수 정도의 이벤트 루프 스레드가 수많은 연결을 맡는다.',
          '어떤 요청이 DB 응답을 기다려야 하면 스레드는 기다리지 않고 다른 요청의 일을 처리하고, 응답이 도착하면 콜백으로 이어서 처리한다.',
          '스레드 수가 적어 메모리와 컨텍스트 스위칭 비용이 작다.'
        ],
        warn: ['이벤트 루프 스레드에서 `Thread.sleep`, JDBC 호출 같은 블로킹 작업을 하면 그 스레드가 맡은 모든 요청이 멈춘다. 꼭 필요하면 `Schedulers.boundedElastic()`으로 넘긴다.'],
        rel: ['WebFlux'] },
      { t: 'Mono', deep: false,
        d: 'Reactor에서 0개 또는 1개의 값을 비동기로 전달하는 타입이다.',
        how: [
          '단건 조회, 저장 결과처럼 결과가 하나인 작업을 표현한다. `Mono<User>`는 "나중에 User 하나가 오거나, 비어 있거나, 에러가 온다"는 뜻이다.',
          '`map`, `flatMap`, `onErrorResume` 같은 연산자로 처리 단계를 이어 붙이며, 구독(subscribe)하기 전에는 아무 일도 일어나지 않는다(지연 실행).',
          'WebFlux 컨트롤러는 `Mono`를 반환하면 프레임워크가 구독해 결과를 응답으로 쓴다.'
        ],
        code: `@GetMapping("/users/{id}")
Mono<UserResponse> get(@PathVariable Long id) {
    return userRepository.findById(id)      // Mono<User>
            .map(UserResponse::from)
            .switchIfEmpty(Mono.error(new NotFoundException()));
}`,
        rel: ['Flux', 'WebFlux'] },
      { t: 'Flux', deep: false,
        d: 'Reactor에서 0개부터 N개까지의 값을 순서대로 비동기 전달하는 스트림 타입이다.',
        how: [
          '목록 조회, 메시지 스트림, SSE처럼 여러 값이 시간에 걸쳐 도착하는 데이터를 표현한다.',
          '값이 준비되는 대로 하나씩 흘려보내므로 전체를 메모리에 모으지 않고도 처리할 수 있다.',
          '`filter`, `map`, `buffer`, `take` 같은 연산자로 스트림을 가공하며, 백프레셔로 소비 속도를 조절한다.'
        ],
        rel: ['Mono', '백프레셔'] },
      { t: '백프레셔', deep: false,
        d: '소비자가 처리할 수 있는 만큼만 데이터를 요청해 생산자가 너무 빨리 보내지 않게 하는 흐름 제어 방식이다.',
        how: [
          'Reactive Streams 표준에서 구독자는 `request(n)`으로 받을 개수를 알린다. 생산자는 그 개수만큼만 보낸다.',
          '느린 소비자가 빠른 생산자에게 압도되어 메모리가 넘치는 것을 막는다.',
          '`onBackpressureBuffer`, `onBackpressureDrop` 같은 연산자로 초과분을 버퍼에 쌓을지, 버릴지 정할 수 있다.'
        ],
        rel: ['Flux'] }
    ]},
    { name: '가상 스레드', items: [
      { t: '가상 스레드', deep: true,
        d: 'JVM이 관리하는 매우 가벼운 스레드로, 소수의 OS 스레드 위에서 수십만~수백만 개를 실행할 수 있다(Java 21 정식).',
        why: '블로킹 코드를 그대로 유지하면서 Thread per Request 모델의 한계(스레드 수 제한)를 없애, WebFlux처럼 코드를 바꾸지 않고도 I/O 대기가 많은 서버의 처리량을 높일 수 있다.',
        how: [
          '기존 플랫폼 스레드는 OS 스레드와 1:1로 대응해 하나에 약 1MB 스택을 쓰고 생성·전환 비용이 커서 수천 개가 현실적인 한계다.',
          '가상 스레드는 힙에 작은 스택만 두고, 실제 실행은 캐리어라고 부르는 소수의 플랫폼 스레드(ForkJoinPool) 위에서 이뤄진다.',
          '1) 가상 스레드가 캐리어 위에 올라가(mount) 코드를 실행한다.',
          '2) 소켓 읽기, DB 응답 대기 같은 블로킹 지점에 도달하면 JVM이 그 가상 스레드의 상태를 저장하고 캐리어에서 내린다(unmount).',
          '3) 비어 있는 캐리어는 곧바로 다른 가상 스레드를 실행한다.',
          '4) I/O가 끝나면 가상 스레드가 다시 아무 캐리어에 올라가 이어서 실행된다.',
          '스프링 부트 3.2+에서 `spring.threads.virtual.enabled=true`로 켜면 톰캣 요청 처리, `@Async`, 스케줄러가 가상 스레드를 쓴다.'
        ],
        code: `# application.yml
spring:
  threads:
    virtual:
      enabled: true

// 직접 만들 때: 작업마다 새 가상 스레드
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> paymentClient.pay(order));
}`,
        warn: [
          '스레드 풀에 넣어 재사용하지 않는다. 작업마다 새로 만드는 것이 원칙이다.',
          'CPU 연산 위주 작업에는 이득이 없다. 효과는 I/O 대기 시간이 길 때 나온다.',
          '동시 실행 수가 크게 늘어 DB 커넥션 풀 같은 한정 자원이 새 병목이 된다. 필요하면 세마포어로 동시 실행 수를 제한한다.',
          'ThreadLocal에 큰 객체를 두면 가상 스레드 수만큼 메모리를 쓴다.',
          'JDK 21~23에서는 `synchronized` 안의 블로킹이 피닝을 일으킨다(JDK 24에서 대부분 해결).'
        ],
        qa: ['가상 스레드는 어떻게 적은 OS 스레드로 많은 요청을 처리하나요?', '가상 스레드는 블로킹 I/O를 만나면 JVM이 상태를 힙에 저장하고 캐리어 스레드에서 내려놓습니다. 캐리어는 그동안 다른 가상 스레드를 실행하고, I/O가 끝나면 원래 가상 스레드를 다시 올려 이어서 실행합니다. 그래서 코드는 블로킹 방식 그대로지만 OS 스레드는 대기하지 않아 처리량이 높아집니다. 다만 DB 커넥션 같은 한정 자원이 병목이 될 수 있어 함께 관리해야 합니다.'],
        rel: ['피닝', '플랫폼 스레드', 'Thread per Request', 'WebFlux'] },
      { t: '플랫폼 스레드', deep: false,
        d: 'OS 스레드와 1:1로 대응하는 기존 자바 스레드(`new Thread()`)다.',
        how: [
          '생성할 때 OS 스레드와 큰 스택 메모리(기본 약 1MB)를 확보한다. 생성·전환 비용이 크기 때문에 스레드 풀로 재사용한다.',
          'OS 스케줄러가 직접 스케줄링하므로 CPU 연산이 많은 작업에 적합하다.',
          '가상 스레드의 캐리어도 플랫폼 스레드다.'
        ],
        rel: ['가상 스레드'] },
      { t: '피닝', deep: false,
        d: '가상 스레드가 블로킹되었는데도 캐리어 스레드에서 내려오지 못하고 캐리어를 붙잡고 있는 현상이다.',
        how: [
          'JDK 21~23에서는 `synchronized` 블록·메서드 안에서 블로킹하거나 네이티브 메서드를 실행하는 동안 피닝이 일어났다.',
          '피닝이 많으면 캐리어가 부족해져 가상 스레드의 이점이 사라진다. 그래서 `synchronized` 대신 `ReentrantLock`을 쓰라고 권장했다.',
          'JDK 24(JEP 491)에서 `synchronized`로 인한 피닝은 대부분 해결되었다. `-Djdk.tracePinnedThreads`(21~23)나 JFR 이벤트로 발생 위치를 찾을 수 있다.'
        ],
        rel: ['가상 스레드'] }
    ]},
    { name: '비동기 · 스케줄링', items: [
      { t: '@Async', deep: false,
        d: '메서드를 호출 즉시 반환하고 실제 작업은 별도 스레드 풀에서 실행하게 하는 애너테이션이다.',
        how: [
          '`@EnableAsync`를 켜면 `@Async`가 붙은 빈을 AOP 프록시로 감싸, 호출 시 작업을 TaskExecutor에 넘기고 바로 반환한다.',
          '이메일 발송, 알림처럼 결과를 기다릴 필요가 없는 작업에 쓴다.',
          '- 반환 타입은 `void` 또는 `CompletableFuture<T>`.',
          '- void면 예외가 호출자에게 전달되지 않으므로 `AsyncUncaughtExceptionHandler`를 등록해 로그를 남긴다.'
        ],
        code: `@Async
public CompletableFuture<Void> sendWelcomeMail(String email) {
    mailSender.send(email, "가입을 환영합니다");
    return CompletableFuture.completedFuture(null);
}`,
        warn: [
          '프록시 기반이라 같은 클래스 안에서 호출하면 비동기로 실행되지 않는다.',
          '트랜잭션과 SecurityContext는 새 스레드로 전파되지 않는다.'
        ],
        rel: ['비동기 스레드 풀', '@Scheduled'] },
      { t: '비동기 스레드 풀', deep: false,
        d: '`@Async` 작업을 실행하는 TaskExecutor로, 부트가 `ThreadPoolTaskExecutor`를 자동 설정한다.',
        how: [
          '부트 기본값은 코어 스레드 8개, 큐 용량 무제한이다. 큐가 무제한이면 최대 스레드 수 설정은 사실상 쓰이지 않고 작업이 큐에 계속 쌓인다.',
          '`spring.task.execution.pool.core-size`, `max-size`, `queue-capacity`로 조정하거나 Executor 빈을 직접 등록한다.',
          '가상 스레드를 켜면 `SimpleAsyncTaskExecutor`가 작업마다 가상 스레드를 만든다.'
        ],
        code: `spring:
  task:
    execution:
      pool:
        core-size: 8
        max-size: 32
        queue-capacity: 500
      thread-name-prefix: async-`,
        warn: ['큐 무제한 상태로 작업이 처리 속도보다 빨리 들어오면 메모리가 부족해진다. 큐 용량과 거절 정책을 정한다.'],
        rel: ['@Async'] },
      { t: '@Scheduled', deep: false,
        d: '메서드를 정해진 주기나 cron 표현식에 따라 자동으로 실행하는 애너테이션이다.',
        how: [
          '`@EnableScheduling`을 켜고 메서드에 붙인다.',
          '- `fixedDelay`: 이전 실행이 끝난 뒤 일정 시간 후 다시 실행.',
          '- `fixedRate`: 이전 실행 시작 시점 기준으로 일정 간격마다 실행.',
          '- `cron = "0 0 3 * * *"`: 초 분 시 일 월 요일 형식. 매일 새벽 3시.',
          '기본 스케줄러 스레드는 1개라 작업 하나가 길어지면 다른 작업이 밀린다. `spring.task.scheduling.pool.size`로 늘린다.'
        ],
        warn: ['서버가 여러 대면 모든 서버에서 같은 작업이 동시에 실행된다. 분산 스케줄 락으로 한 대만 실행되게 한다.'],
        rel: ['분산 스케줄 락', '@Async'] },
      { t: '분산 스케줄 락', deep: false,
        d: '여러 서버 중 한 대에서만 스케줄 작업이 실행되도록 DB나 Redis에 락을 거는 방법이다. ShedLock이 대표적이다.',
        how: [
          '작업 시작 전에 공용 저장소(DB 테이블, Redis)에 "이 작업 실행 중" 기록을 원자적으로 남기고, 성공한 서버만 실행한다.',
          'ShedLock은 `@SchedulerLock(name = "settle", lockAtMostFor = "10m")`처럼 선언하며, 서버가 죽어도 `lockAtMostFor` 후 락이 풀린다.',
          '대규모 배치라면 Spring Batch나 별도 스케줄러(Quartz 클러스터, 쿠버네티스 CronJob)를 쓰기도 한다.'
        ],
        rel: ['@Scheduled'] }
    ]},
    { name: '스레드 안전', items: [
      { t: 'ThreadLocal', deep: false,
        d: '스레드마다 독립된 값을 저장하는 저장소다. 같은 변수라도 스레드별로 다른 값을 가진다.',
        how: [
          '스프링은 요청을 처리하는 스레드에 트랜잭션 커넥션(TransactionSynchronizationManager), 인증 정보(SecurityContextHolder), 요청 정보(RequestContextHolder)를 ThreadLocal로 보관한다.',
          '덕분에 파라미터로 넘기지 않아도 같은 스레드 안의 어느 계층에서든 꺼내 쓸 수 있다.',
          '직접 쓸 때는 `set()`, `get()`, `remove()`를 사용하며, 요청이 끝나는 지점(필터나 인터셉터의 finally)에서 반드시 `remove()`한다.'
        ],
        warn: [
          '톰캣은 스레드를 재사용하므로 지우지 않으면 다음 요청이 이전 사용자의 값을 보게 되고, 메모리 누수도 생긴다.',
          '`@Async`나 새 스레드로는 값이 전달되지 않는다. Java 25에서는 ScopedValue가 더 안전한 대안이다.'
        ],
        rel: ['Thread per Request', '@Async'] }
    ]}
  ],
  must: [
    '요청 스레드보다 DB 커넥션 풀(HikariCP 기본 10개)이 먼저 병목이 되는 경우가 많다.',
    'ThreadLocal은 스레드 풀에서 스레드가 재사용되므로 요청이 끝나면 반드시 `remove()`한다.',
    '`@Async` 메서드가 void를 반환하면 예외가 호출자에게 전달되지 않는다. `CompletableFuture`를 반환한다.',
    '`synchronized`는 서버 한 대 안에서만 유효하다. 서버가 여러 대면 DB 락(비관적 락, `@Version` 낙관적 락)이나 분산 락을 쓴다.'
  ]
};
