import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-8",
  name: "서버 · 동시성",
  must: [
    "요청 스레드보다 DB 커넥션 풀(HikariCP 기본 10개)이 먼저 병목이 되는 경우가 많다.",
    "ThreadLocal은 스레드 풀에서 스레드가 재사용되므로 요청이 끝나면 반드시 `remove()`한다.",
    "`@Async` 메서드가 void를 반환하면 예외가 호출자에게 전달되지 않는다. `CompletableFuture`를 반환한다.",
    "`synchronized`는 서버 한 대 안에서만 유효하다. 서버가 여러 대면 DB 락(비관적 락, `@Version` 낙관적 락)이나 분산 락을 쓴다."
  ],
  groups: [
    {
      name: "서블릿 컨테이너",
      compare: {
        cols: ["개념", "핵심 내용", "스프링 부트에서", "면접 포인트"],
        rows: [
          ["서블릿 컨테이너(WAS)", "HTTP 요청을 서블릿 호출로 변환", "내장 톰캣이 기본", "부트 3은 `jakarta.*` 패키지"],
          ["서블릿 생명주기", "`init` → `service` → `destroy`", "DispatcherServlet 하나가 처리", "서블릿은 싱글톤, 상태 공유 주의"],
          ["웹 서버와 WAS", "정적·프록시 vs 동적 로직", "Nginx 뒤에 내장 톰캣 배치", "SSL 종료·정적 캐싱 분담"]
        ]
      },
      concepts: [
        {
          id: "spring/seobeulrit-keonteineo-was",
          slug: "seobeulrit-keonteineo-was",
          title: "서블릿 컨테이너(WAS)",
          deep: false,
          def: "서블릿을 실행하고 HTTP 요청을 서블릿 호출로 바꿔 주는 실행 환경이다. 톰캣이 대표적이다.",
          why: "소켓 연결, HTTP 파싱, 스레드 관리 같은 저수준 작업을 개발자가 직접 구현하지 않고 비즈니스 로직에만 집중하기 위해서다.",
          how: [
            "서블릿 컨테이너는 웹 서버 기능과 서블릿 실행 기능을 함께 가진다. 스프링 부트는 톰캣을 라이브러리로 내장해 `main()` 실행 시 함께 띄운다.",
            "- 소켓 연결을 받고 HTTP 요청 메시지를 파싱해 `HttpServletRequest`, `HttpServletResponse` 객체를 만든다.",
            "- 요청마다 스레드 풀에서 스레드를 꺼내 서블릿(스프링에서는 DispatcherServlet)을 실행한다.",
            "- 필터 체인, 세션, 에러 페이지(`/error`) 처리를 지원한다.",
            "스프링 MVC 입장에서 톰캣은 \"요청을 받아 DispatcherServlet까지 전달하는 바깥 껍데기\"다."
          ],
          flow: ["소켓 연결 수락", "HTTP 메시지 파싱", "요청·응답 객체 생성", "스레드 풀에서 스레드 할당", "필터 체인 실행", "서블릿 service() 호출"],
          use: [
            "스프링 부트 애플리케이션의 `server.port`, `server.tomcat.*` 설정이 바로 이 컨테이너의 설정입니다.",
            "운영 장애 분석 시 톰캣 스레드 덤프로 요청 스레드가 어디서 막혔는지 확인합니다."
          ],
          warn: ["톰캣 설정(스레드 수, 타임아웃)은 애플리케이션 처리량에 직접 영향을 주므로 기본값을 그대로 운영에 쓰기 전에 확인한다."],
          myth: [["스프링이 HTTP 요청을 직접 받는다", "요청은 톰캣이 받고, 스프링 MVC는 톰캣이 호출하는 DispatcherServlet 안에서 동작합니다."]],
          answer: "서블릿 컨테이너는 HTTP 요청을 받아 `HttpServletRequest`와 `HttpServletResponse`로 바꾸고, 스레드 풀의 스레드로 서블릿을 실행해 주는 환경입니다. 스프링 부트는 톰캣을 내장하고 있어 애플리케이션을 실행하면 톰캣이 함께 뜨고 DispatcherServlet이 등록됩니다.",
          analogy: "식당으로 치면 손님을 맞고 주문서를 만들어 주방(DispatcherServlet)에 전달하는 홀 매니저입니다.",
          followUps: [
            [
              "톰캣 대신 다른 서버를 쓸 수 있나요?",
              "네, spring-boot-starter-web에서 톰캣 의존성을 제외하고 Jetty나 Undertow 스타터를 추가하면 됩니다. WebFlux를 쓰면 기본 서버는 Netty입니다."
            ]
          ],
          related: ["spring/seobeulrit-saengmyeongjugi", "spring/thread-per-request", "spring/wep-seobeowa-was"]
        },
        {
          id: "spring/seobeulrit-saengmyeongjugi",
          slug: "seobeulrit-saengmyeongjugi",
          title: "서블릿 생명주기",
          deep: false,
          def: "서블릿 객체가 생성되어 요청을 처리하고 소멸하기까지의 단계로, 컨테이너가 관리한다.",
          why: "서블릿이 싱글톤으로 여러 스레드에서 동시에 실행된다는 점을 알아야 상태를 가진 필드로 인한 동시성 버그를 막을 수 있기 때문이다.",
          how: [
            "1) `init()`: 서블릿 객체를 처음 만들 때 한 번 호출된다. 서블릿은 컨테이너 안에 하나만 존재하는 싱글톤이다.",
            "2) `service()`: 요청이 올 때마다 호출되어 HTTP 메서드에 따라 `doGet()`, `doPost()` 등으로 나뉜다. 여러 스레드가 같은 서블릿 객체의 `service()`를 동시에 실행한다.",
            "3) `destroy()`: 컨테이너가 종료될 때 한 번 호출된다.",
            "DispatcherServlet도 서블릿이므로 같은 생명주기를 따르며, `init` 시점에 스프링 MVC 구성 요소(HandlerMapping 등)를 준비한다."
          ],
          flow: ["서블릿 클래스 로딩", "객체 생성(1개)", "init() 1회 호출", "요청마다 service()", "컨테이너 종료 시 destroy()"],
          use: ["DispatcherServlet은 `init` 시점에 HandlerMapping, HandlerAdapter 같은 MVC 구성 요소를 준비합니다."],
          warn: ["서블릿과 스프링 빈은 싱글톤이고 여러 스레드가 동시에 실행하므로 인스턴스 필드에 요청별 상태를 두면 안 된다."],
          myth: [["요청마다 서블릿 객체가 새로 만들어진다", "서블릿은 싱글톤이고 요청마다 바뀌는 것은 스레드와 요청·응답 객체입니다."]],
          answer: "서블릿은 컨테이너가 처음 만들 때 `init()`을 한 번 호출하고, 요청마다 `service()`를 호출하며, 종료할 때 `destroy()`를 한 번 호출합니다. 서블릿 객체는 하나만 만들어 여러 스레드가 동시에 `service()`를 실행하므로 상태를 가지면 안 됩니다.",
          followUps: [
            [
              "서블릿이 싱글톤이면 동시성 문제는 어떻게 피하나요?",
              "인스턴스 필드에 요청별 상태를 두지 않고 지역 변수와 요청 객체로만 데이터를 다룹니다. 스프링 컨트롤러와 서비스 빈도 같은 원칙을 따릅니다."
            ]
          ],
          related: ["spring/seobeulrit-keonteineo-was"]
        },
        {
          id: "spring/wep-seobeowa-was",
          slug: "wep-seobeowa-was",
          title: "웹 서버와 WAS",
          deep: false,
          def: "웹 서버(Nginx)는 정적 리소스와 프록시를, WAS(톰캣)는 애플리케이션 로직 실행을 맡는다.",
          why: "정적 파일 제공, SSL 종료, 부하 분산을 웹 서버에 맡겨 비싼 WAS 자원을 애플리케이션 로직에만 쓰기 위해서다.",
          how: [
            "- 웹 서버: HTML, 이미지 같은 정적 파일 제공, 리버스 프록시, SSL 종료, 로드 밸런싱, 요청 버퍼링을 담당한다. 가볍고 동시 연결 처리에 강하다.",
            "- WAS: 자바 코드를 실행해 동적 응답을 만든다. 웹 서버 기능도 있지만 정적 파일 제공은 웹 서버보다 비효율적이다.",
            "실무에서는 클라이언트 → Nginx(또는 로드 밸런서) → 톰캣 구조를 많이 쓴다. 웹 서버가 느린 클라이언트와의 연결을 대신 버텨 주어 WAS 스레드가 오래 묶이지 않는다."
          ],
          use: [
            "Nginx에서 HTTPS를 종료하고 내부 톰캣에는 HTTP로 전달하는 구성이 흔합니다.",
            "이미지·JS 파일은 Nginx나 CDN에서 서빙하고, API 요청만 톰캣으로 프록시합니다."
          ],
          answer: "웹 서버는 Nginx처럼 정적 파일 제공, 리버스 프록시, SSL 종료, 로드 밸런싱을 맡고, WAS는 톰캣처럼 자바 코드를 실행해 동적인 응답을 만듭니다. 보통 웹 서버를 앞에 두어 정적 리소스와 느린 클라이언트 연결을 처리하고, WAS는 애플리케이션 로직에만 집중하게 합니다.",
          analogy: "웹 서버는 안내 데스크, WAS는 실제 업무를 처리하는 창구 직원입니다. 간단한 안내는 데스크에서 끝내고 업무만 창구로 보냅니다.",
          followUps: [
            [
              "WAS만 있어도 서비스할 수 있는데 웹 서버를 왜 두나요?",
              "정적 파일 처리와 TLS, 연결 관리를 웹 서버가 가볍게 맡아 WAS 스레드를 아낄 수 있습니다. 또 여러 WAS 앞에서 로드 밸런싱과 무중단 배포 전환을 쉽게 할 수 있습니다."
            ]
          ],
          related: ["spring/seobeulrit-keonteineo-was"]
        }
      ]
    },
    {
      name: "요청 처리 모델",
      compare: {
        cols: ["개념", "핵심", "주요 설정", "장애 시 증상"],
        rows: [
          ["Thread per Request", "요청 1개 = 스레드 1개", "`spring.threads.virtual.enabled`", "블로킹 I/O로 스레드 고갈"],
          ["톰캣 스레드 풀 설정", "동시 처리량·대기열 결정", "`server.tomcat.threads.max` (200)", "초과 요청 대기·거절"],
          ["외부 호출 타임아웃", "스레드 무한 대기 방지", "connect·read 타임아웃", "미설정 시 연쇄 장애"]
        ]
      },
      concepts: [
        {
          id: "spring/thread-per-request",
          slug: "thread-per-request",
          title: "Thread per Request",
          deep: true,
          def: "요청 하나에 스레드 하나를 할당해 응답이 끝날 때까지 그 스레드가 전담하는 처리 모델이다. 스프링 MVC와 톰캣의 기본 방식이다.",
          why: "코드를 위에서 아래로 읽히는 동기·블로킹 방식으로 쉽게 작성할 수 있고, 요청마다 스레드가 분리되어 디버깅과 트랜잭션·보안 컨텍스트 관리(ThreadLocal)가 단순해진다.",
          how: [
            "1) 클라이언트 연결이 들어오면 톰캣 커넥터가 받아 요청을 읽는다.",
            "2) 작업 스레드 풀에서 놀고 있는 스레드 하나를 꺼내 요청을 맡긴다.",
            "3) 그 스레드가 필터 → DispatcherServlet → 컨트롤러 → 서비스 → DB 호출까지 모두 실행한다. DB나 외부 API 응답을 기다리는 동안 스레드는 블로킹된 채 대기한다.",
            "4) 응답을 쓰고 나면 스레드를 풀에 반납한다.",
            "5) 모든 스레드가 바쁘면 새 연결은 대기 큐(accept-count)에서 기다리고, 큐마저 차면 연결이 거절된다.",
            "동시에 처리할 수 있는 요청 수는 최대 스레드 수(기본 200)로 제한된다. 요청 대부분이 I/O를 기다리는 시간이라면 CPU는 놀고 있는데 스레드가 부족해지는 상황이 생긴다."
          ],
          flow: ["커넥터가 연결 수락", "풀에서 작업 스레드 꺼냄", "필터→서블릿→컨트롤러", "DB·외부 호출 동안 대기", "응답 작성 후 스레드 반납", "모두 바쁘면 대기 큐로"],
          code: "# application.yml\nserver:\n  tomcat:\n    threads:\n      max: 200        # 최대 작업 스레드\n      min-spare: 10   # 항상 유지하는 스레드\n    accept-count: 100 # 스레드가 모두 바쁠 때 대기 큐\n    max-connections: 8192\n    connection-timeout: 5s",
          codeLang: "yaml",
          use: [
            "외부 결제 API가 느려졌을 때 톰캣 스레드가 모두 대기 상태가 되어 다른 API까지 응답하지 못하는 장애가 대표 사례입니다.",
            "부하 테스트에서 `threads.max`와 HikariCP `maximum-pool-size`를 함께 조정해 처리량을 맞춥니다."
          ],
          warn: [
            "느린 외부 API 하나 때문에 모든 스레드가 대기하면 서버 전체가 응답하지 못한다. 외부 호출에는 반드시 타임아웃을 건다.",
            "스레드 수만 늘리면 DB 커넥션 풀(HikariCP 기본 10개)에서 병목이 옮겨 갈 뿐이다. 두 값을 함께 본다.",
            "스레드를 너무 많이 두면 메모리(스레드당 약 1MB 스택)와 컨텍스트 스위칭 비용이 커진다."
          ],
          myth: [
            ["스레드 수를 늘리면 처리량이 계속 오른다", "뒤쪽 DB 커넥션이나 CPU가 먼저 한계에 닿으면 대기만 늘고, 메모리와 컨텍스트 스위칭 비용이 커집니다."],
            ["요청이 200개를 넘으면 바로 에러가 난다", "초과 연결은 accept-count 대기 큐에서 기다리고, 큐까지 차야 연결이 거절됩니다."]
          ],
          answer: "Thread per Request는 요청 하나에 스레드 하나를 배정해 응답이 끝날 때까지 그 스레드가 전담하는 모델이고, 스프링 MVC와 톰캣의 기본 방식입니다. 코드를 동기 방식으로 쉽게 쓸 수 있지만, DB나 외부 API를 기다리는 동안에도 스레드가 묶여 있어 동시 처리 수가 스레드 풀 크기(기본 200)로 제한됩니다. 그래서 외부 호출 타임아웃과 커넥션 풀 크기를 함께 관리해야 합니다.",
          analogy: "은행 창구 직원 한 명이 손님 한 명을 끝까지 맡는 방식입니다. 손님이 서류를 찾느라 기다리는 동안에도 직원은 다른 손님을 받지 못합니다.",
          qa: [
            "동시 요청이 톰캣 스레드 풀보다 많으면 어떻게 되나요?",
            "최대 스레드 수만큼은 동시에 처리하고, 나머지 연결은 accept-count 크기의 대기 큐에서 스레드가 반납되기를 기다립니다. 대기 큐까지 가득 차면 새 연결은 거절됩니다. 그래서 외부 호출에 타임아웃을 걸어 스레드가 오래 묶이지 않게 하고, 스레드 수와 DB 커넥션 풀 크기를 함께 조정합니다. I/O 대기가 많다면 가상 스레드나 WebFlux도 대안이 됩니다."
          ],
          followUps: [
            [
              "스레드 200개가 모두 DB 커넥션을 기다리면 무슨 일이 생기나요?",
              "HikariCP 기본 풀이 10개라면 190개 스레드는 커넥션을 기다리다 `connectionTimeout`(기본 30초) 후 예외가 납니다. 그동안 새 요청은 대기 큐에 쌓여 응답 시간이 급격히 늘어납니다. 트랜잭션을 짧게 하고 풀 크기와 타임아웃을 부하 테스트로 맞춥니다."
            ],
            [
              "이 모델의 한계를 어떻게 극복하나요?",
              "I/O 대기가 많다면 Java 21 가상 스레드를 켜서 블로킹 코드를 유지한 채 동시성을 높일 수 있습니다. 전 구간을 논블로킹으로 바꿀 수 있다면 WebFlux도 선택지입니다. 어느 쪽이든 DB 같은 한정 자원 관리는 여전히 필요합니다."
            ],
            [
              "ThreadLocal이 이 모델과 어떤 관계인가요?",
              "요청 하나를 스레드 하나가 끝까지 처리하므로, 트랜잭션 커넥션과 인증 정보를 ThreadLocal에 두면 어느 계층에서든 꺼내 쓸 수 있습니다. 대신 스레드가 재사용되므로 요청이 끝나면 반드시 비워야 합니다."
            ]
          ],
          related: [
            "spring/tomkaet-seuredeu-pul-seoljeong",
            "spring/oebu-hochul-taimaut",
            "spring/gasang-seuredeu",
            "spring/webflux"
          ]
        },
        {
          id: "spring/tomkaet-seuredeu-pul-seoljeong",
          slug: "tomkaet-seuredeu-pul-seoljeong",
          title: "톰캣 스레드 풀 설정",
          deep: false,
          def: "톰캣이 동시에 처리할 요청 수와 대기 방식을 정하는 설정 값들이다.",
          why: "트래픽에 비해 스레드 수나 대기열이 맞지 않으면 요청이 거절되거나 응답이 크게 지연되기 때문이다.",
          how: [
            "- `server.tomcat.threads.max`(기본 200): 동시에 요청을 처리하는 최대 작업 스레드 수.",
            "- `server.tomcat.threads.min-spare`(기본 10): 요청이 없어도 유지하는 최소 스레드 수.",
            "- `server.tomcat.accept-count`(기본 100): 모든 스레드가 바쁠 때 OS 수준에서 대기시키는 연결 큐 크기.",
            "- `server.tomcat.max-connections`(기본 8192): NIO 커넥터가 동시에 유지할 수 있는 연결 수. 연결은 유지하되 처리 스레드는 요청이 있을 때만 쓴다.",
            "적정 값은 부하 테스트로 정한다. 응답 시간이 대부분 I/O 대기면 스레드를 늘리는 효과가 있고, CPU 연산이 많으면 코어 수 이상으로 늘려도 이득이 적다."
          ],
          use: [
            "트래픽이 몰리는 이벤트 전에 부하 테스트로 `threads.max`와 커넥션 풀 크기를 조정합니다.",
            "Actuator 메트릭 `tomcat.threads.busy`를 모니터링해 스레드 고갈 징후를 미리 확인합니다."
          ],
          warn: ["스레드를 늘리기 전에 DB 커넥션 풀 크기와 외부 API 처리 한도를 확인한다. 뒤쪽 자원이 감당하지 못하면 대기만 늘어난다."],
          myth: [
            [
              "max-connections가 동시 처리 요청 수다",
              "max-connections는 유지할 수 있는 연결 수이고, 실제로 동시에 처리하는 요청 수는 threads.max가 결정합니다."
            ]
          ],
          answer: "톰캣의 처리량은 `threads.max`(기본 200), `threads.min-spare`(기본 10), `accept-count`(기본 100), `max-connections`(기본 8192)로 결정됩니다. 스레드가 모두 바쁘면 새 연결은 accept-count 큐에서 기다리고, 그마저 차면 거절됩니다. 적정 값은 DB 커넥션 풀 크기와 함께 부하 테스트로 정합니다.",
          followUps: [
            [
              "스레드 수를 얼마로 잡아야 하나요?",
              "정답은 없고 요청 처리 시간 중 I/O 대기 비율에 따라 다릅니다. CPU 위주라면 코어 수 근처, I/O 대기가 많으면 더 크게 잡되 DB 커넥션 풀과 외부 서비스 한도를 넘지 않게 부하 테스트로 정합니다."
            ]
          ],
          related: ["spring/thread-per-request"]
        },
        {
          id: "spring/oebu-hochul-taimaut",
          slug: "oebu-hochul-taimaut",
          title: "외부 호출 타임아웃",
          deep: false,
          def: "외부 API·DB 호출이 응답하지 않을 때 요청 스레드가 무한정 기다리지 않도록 최대 대기 시간을 정하는 설정이다.",
          why: "외부 시스템이 응답하지 않을 때 요청 스레드가 무한정 묶여 스레드 풀이 고갈되고 전체 서비스가 멈추는 것을 막기 위해서다.",
          how: [
            "- 연결 타임아웃: 상대 서버와 TCP 연결을 맺는 데 걸리는 최대 시간.",
            "- 읽기(응답) 타임아웃: 연결 후 응답 데이터를 기다리는 최대 시간.",
            "스프링 6.1+의 `RestClient`, `WebClient`, `RestTemplate`은 기본적으로 타임아웃이 무제한이거나 매우 길 수 있으므로 `ClientHttpRequestFactory`나 HTTP 클라이언트 설정으로 명시한다. DB는 HikariCP `connectionTimeout`, 쿼리 타임아웃으로 제한한다.",
            "Thread per Request 모델에서 타임아웃이 없으면 느린 외부 서비스 하나가 톰캣 스레드를 모두 묶어 장애를 전파한다."
          ],
          code: "@Bean\nRestClient paymentClient(RestClient.Builder builder) {\n    var factory = new SimpleClientHttpRequestFactory();\n    factory.setConnectTimeout(Duration.ofSeconds(2));\n    factory.setReadTimeout(Duration.ofSeconds(3));\n    return builder.baseUrl(\"https://pay.example.com\")\n                  .requestFactory(factory)\n                  .build();\n}",
          codeLang: "java",
          use: [
            "결제·본인 인증 같은 외부 API 클라이언트를 `RestClient`로 만들 때 연결 2초, 읽기 3초처럼 명시합니다.",
            "HikariCP `connectionTimeout`과 JPA 쿼리 타임아웃으로 DB 대기도 제한합니다."
          ],
          warn: ["타임아웃 값은 상대 서비스의 평소 응답 시간(p99)보다 약간 크게 잡는다. 너무 짧으면 정상 요청까지 실패한다."],
          myth: [["HTTP 클라이언트는 기본 타임아웃이 적당히 잡혀 있다", "많은 클라이언트의 기본값은 무제한이거나 매우 길어서 반드시 직접 설정해야 합니다."]],
          answer: "외부 호출 타임아웃은 외부 API나 DB가 응답하지 않을 때 요청 스레드가 무한정 기다리지 않도록 최대 대기 시간을 정하는 설정입니다. 연결 타임아웃과 읽기 타임아웃을 각각 걸어야 하며, 없으면 느린 서비스 하나가 톰캣 스레드를 모두 묶어 장애를 퍼뜨립니다.",
          analogy: "전화를 걸었는데 상대가 안 받으면 몇 번 울린 뒤 끊는 것과 같습니다. 끊지 않으면 다른 전화를 받을 수 없습니다.",
          followUps: [
            [
              "타임아웃이 나면 그다음은 어떻게 처리하나요?",
              "멱등한 요청이면 지수 백오프로 재시도하고, 실패가 계속되면 서킷 브레이커로 호출을 잠시 끊고 대체 응답을 줍니다. 결제처럼 결과가 불확실한 요청은 재시도 전에 상태 조회 API로 실제 처리 여부를 확인합니다."
            ]
          ],
          related: ["spring/thread-per-request"]
        }
      ]
    },
    {
      name: "WebFlux · 리액티브",
      compare: {
        cols: ["기준", "Mono", "Flux"],
        rows: [
          ["값 개수", "0개 또는 1개", "0개부터 N개"],
          ["대표 용도", "단건 조회, 저장 결과", "목록, 스트림, SSE"],
          ["백프레셔 의미", "거의 없음", "소비 속도 조절에 중요"],
          ["MVC로 치면", "`User` 반환", "`List<User>` 반환"]
        ]
      },
      concepts: [
        {
          id: "spring/webflux",
          slug: "webflux",
          title: "WebFlux",
          deep: false,
          def: "스프링 5에서 추가된 논블로킹 리액티브 웹 스택으로, 적은 스레드로 많은 동시 연결을 처리한다.",
          why: "요청마다 스레드를 붙잡는 블로킹 모델로는 대기 시간이 긴 대량 동시 연결을 적은 자원으로 감당하기 어렵기 때문이다.",
          how: [
            "기본 서버는 Netty이며, 요청마다 스레드를 붙잡지 않고 I/O가 준비되면 이어서 처리하는 이벤트 기반으로 동작한다.",
            "- 적합: 동시 연결이 매우 많은 서비스, 외부 API를 많이 호출하는 게이트웨이(Spring Cloud Gateway), 스트리밍, SSE.",
            "- 부적합: JPA·JDBC 같은 블로킹 라이브러리를 써야 할 때. DB도 R2DBC 같은 리액티브 드라이버가 필요하다.",
            "- 단점: 학습 곡선이 가파르고 스택 트레이스를 읽기 어렵다.",
            "Java 21 가상 스레드 이후로는 일반 API 서버라면 MVC + 가상 스레드를 택하는 경우가 늘었다."
          ],
          use: [
            "Spring Cloud Gateway가 WebFlux 기반으로 여러 백엔드로 요청을 중계합니다.",
            "실시간 알림을 SSE로 많은 클라이언트에 동시에 흘려보내는 서비스에 씁니다."
          ],
          warn: ["WebFlux에서 블로킹 호출을 하면 이벤트 루프가 멈춰 전체 처리량이 급락한다."],
          myth: [["WebFlux로 바꾸면 무조건 빨라진다", "요청 하나의 처리 속도는 비슷하거나 느릴 수 있고, 이점은 적은 자원으로 많은 동시 연결을 처리하는 데 있습니다."]],
          answer: "WebFlux는 스프링 5에서 추가된 논블로킹 리액티브 웹 스택으로, Netty의 적은 이벤트 루프 스레드가 I/O를 기다리지 않고 많은 요청을 번갈아 처리합니다. 동시 연결이 많고 외부 I/O가 많은 게이트웨이나 스트리밍에 유리하지만, 전 구간이 논블로킹이어야 효과가 있고 JPA 같은 블로킹 라이브러리와는 맞지 않습니다.",
          qa: [
            "MVC와 WebFlux는 언제 각각 선택하나요?",
            "블로킹 라이브러리(JPA 등)를 쓰는 일반적인 API 서버는 MVC가 단순하고 생태계가 넓습니다. 동시 연결이 매우 많고 외부 I/O 비중이 높으며 전 구간을 논블로킹으로 구성할 수 있을 때 WebFlux가 유리합니다. 최근에는 가상 스레드로 MVC에서도 높은 동시성을 얻을 수 있어 선택 기준이 더 명확해졌습니다."
          ],
          followUps: [
            [
              "WebFlux에서 JPA를 쓰면 어떻게 되나요?",
              "JPA는 블로킹이라 이벤트 루프 스레드를 막아 전체 처리량이 떨어집니다. 쓰려면 `boundedElastic` 스케줄러로 넘겨야 하는데 그러면 장점이 줄어들어, 보통 R2DBC 같은 리액티브 드라이버를 씁니다."
            ]
          ],
          related: ["spring/ibenteu-rupeu", "spring/mono", "spring/flux", "spring/gasang-seuredeu"]
        },
        {
          id: "spring/ibenteu-rupeu",
          slug: "ibenteu-rupeu",
          title: "이벤트 루프",
          deep: false,
          def: "소수의 스레드가 I/O 이벤트를 감시하다가 준비된 작업을 차례로 실행하는 방식이다. WebFlux(Netty)의 처리 기반이다.",
          why: "I/O를 기다리는 동안 스레드가 놀지 않게 해 적은 스레드로 수많은 연결을 처리하기 위해서다.",
          how: [
            "보통 CPU 코어 수 정도의 이벤트 루프 스레드가 수많은 연결을 맡는다.",
            "어떤 요청이 DB 응답을 기다려야 하면 스레드는 기다리지 않고 다른 요청의 일을 처리하고, 응답이 도착하면 콜백으로 이어서 처리한다.",
            "스레드 수가 적어 메모리와 컨텍스트 스위칭 비용이 작다."
          ],
          flow: ["I/O 이벤트 감시", "준비된 이벤트 꺼냄", "해당 핸들러 실행", "블로킹 없이 즉시 반환", "다음 이벤트로 반복"],
          use: ["Netty, Node.js, Redis가 이벤트 루프 방식으로 적은 스레드로 많은 연결을 처리합니다."],
          warn: [
            "이벤트 루프 스레드에서 `Thread.sleep`, JDBC 호출 같은 블로킹 작업을 하면 그 스레드가 맡은 모든 요청이 멈춘다. 꼭 필요하면 `Schedulers.boundedElastic()`으로 넘긴다."
          ],
          answer: "이벤트 루프는 소수의 스레드가 여러 연결의 I/O 이벤트를 감시하다가 준비된 작업만 차례로 실행하는 방식입니다. 요청이 DB 응답을 기다리면 스레드는 다른 요청을 처리하고, 응답이 오면 콜백으로 이어서 처리합니다. 그래서 이벤트 루프 스레드에서는 절대 블로킹하면 안 됩니다.",
          analogy: "한 명의 바텐더가 여러 손님의 주문을 받아 두고, 준비된 잔부터 차례로 내주는 것과 같습니다. 바텐더가 한 손님 앞에서 멈춰 서면 모든 손님이 기다립니다.",
          followUps: [
            [
              "이벤트 루프에서 오래 걸리는 작업은 어떻게 하나요?",
              "블로킹이나 CPU를 오래 쓰는 작업은 `Schedulers.boundedElastic()` 같은 별도 스레드 풀로 넘겨 이벤트 루프가 계속 돌게 합니다."
            ]
          ],
          related: ["spring/webflux"]
        },
        {
          id: "spring/mono",
          slug: "mono",
          title: "Mono",
          deep: false,
          def: "Reactor에서 0개 또는 1개의 값을 비동기로 전달하는 타입이다.",
          why: "결과가 하나인 비동기 작업을 블로킹 없이 표현하고 연산자로 이어 붙이기 위해서다.",
          how: [
            "단건 조회, 저장 결과처럼 결과가 하나인 작업을 표현한다. `Mono<User>`는 \"나중에 User 하나가 오거나, 비어 있거나, 에러가 온다\"는 뜻이다.",
            "`map`, `flatMap`, `onErrorResume` 같은 연산자로 처리 단계를 이어 붙이며, 구독(subscribe)하기 전에는 아무 일도 일어나지 않는다(지연 실행).",
            "WebFlux 컨트롤러는 `Mono`를 반환하면 프레임워크가 구독해 결과를 응답으로 쓴다."
          ],
          code: "@GetMapping(\"/users/{id}\")\nMono<UserResponse> get(@PathVariable Long id) {\n    return userRepository.findById(id)      // Mono<User>\n            .map(UserResponse::from)\n            .switchIfEmpty(Mono.error(new NotFoundException()));\n}",
          codeLang: "java",
          use: [
            "`userRepository.findById(id)`가 R2DBC에서 `Mono<User>`를 반환합니다.",
            "WebClient로 외부 API를 한 번 호출한 결과를 `Mono<Response>`로 받습니다."
          ],
          myth: [["Mono를 만들면 바로 실행된다", "Mono는 조립된 실행 계획일 뿐이고, 누군가 subscribe해야 실제 작업이 시작됩니다."]],
          answer: "Mono는 Reactor에서 0개 또는 1개의 값을 비동기로 전달하는 타입으로, 단건 조회나 저장 결과를 표현합니다. 구독하기 전에는 실행되지 않는 지연 실행 방식이며, WebFlux 컨트롤러가 Mono를 반환하면 프레임워크가 구독해 응답을 씁니다.",
          analogy: "\"택배가 도착하면 알려 줄게\"라는 배송 예약표와 같습니다. 물건이 하나 오거나, 안 오거나, 문제가 생겼다는 연락이 옵니다.",
          followUps: [
            [
              "map과 flatMap의 차이는?",
              "map은 값을 동기적으로 다른 값으로 바꾸고, flatMap은 값을 받아 또 다른 Mono(비동기 작업)를 이어 붙일 때 씁니다. 예를 들어 사용자를 조회한 뒤 그 사용자의 주문을 비동기로 조회하려면 flatMap을 씁니다."
            ]
          ],
          related: ["spring/flux", "spring/webflux"]
        },
        {
          id: "spring/flux",
          slug: "flux",
          title: "Flux",
          deep: false,
          def: "Reactor에서 0개부터 N개까지의 값을 순서대로 비동기 전달하는 스트림 타입이다.",
          why: "여러 값이 시간에 걸쳐 도착하는 데이터를 전부 메모리에 모으지 않고 도착하는 대로 처리하기 위해서다.",
          how: [
            "목록 조회, 메시지 스트림, SSE처럼 여러 값이 시간에 걸쳐 도착하는 데이터를 표현한다.",
            "값이 준비되는 대로 하나씩 흘려보내므로 전체를 메모리에 모으지 않고도 처리할 수 있다.",
            "`filter`, `map`, `buffer`, `take` 같은 연산자로 스트림을 가공하며, 백프레셔로 소비 속도를 조절한다."
          ],
          use: [
            "주식 시세나 알림을 `Flux<ServerSentEvent>`로 클라이언트에 계속 전송합니다.",
            "대량 데이터를 Flux로 읽으며 `buffer(100)`으로 묶어 배치 저장합니다."
          ],
          answer: "Flux는 0개부터 N개까지의 값을 시간에 걸쳐 순서대로 비동기 전달하는 Reactor 타입입니다. 목록 조회나 메시지 스트림, SSE처럼 여러 값이 오는 데이터를 표현하며, 값이 준비되는 대로 흘려보내 전체를 메모리에 모으지 않고 처리할 수 있습니다.",
          analogy: "한 번에 도착하는 상자가 아니라 컨베이어 벨트로 하나씩 들어오는 물건입니다.",
          followUps: [
            [
              "Flux를 List로 바꿔도 되나요?",
              "`collectList()`로 바꿀 수 있지만 모든 값이 도착할 때까지 기다리고 전부 메모리에 올리므로, 크기가 크거나 끝없는 스트림에는 쓰면 안 됩니다."
            ]
          ],
          related: ["spring/mono", "spring/baekpeuresyeo"]
        },
        {
          id: "spring/baekpeuresyeo",
          slug: "baekpeuresyeo",
          title: "백프레셔",
          deep: false,
          def: "소비자가 처리할 수 있는 만큼만 데이터를 요청해 생산자가 너무 빨리 보내지 않게 하는 흐름 제어 방식이다.",
          why: "생산자가 소비자보다 빠르게 데이터를 밀어내 메모리가 넘치고 시스템이 무너지는 것을 막기 위해서다.",
          how: [
            "Reactive Streams 표준에서 구독자는 `request(n)`으로 받을 개수를 알린다. 생산자는 그 개수만큼만 보낸다.",
            "느린 소비자가 빠른 생산자에게 압도되어 메모리가 넘치는 것을 막는다.",
            "`onBackpressureBuffer`, `onBackpressureDrop` 같은 연산자로 초과분을 버퍼에 쌓을지, 버릴지 정할 수 있다."
          ],
          flow: ["구독자가 subscribe", "구독자가 request(n)", "생산자가 n개만 전달", "처리 후 다시 request", "완료 또는 에러 신호"],
          use: ["DB에서 수백만 건을 스트리밍할 때 소비 속도에 맞춰 읽어 메모리 초과를 막습니다."],
          answer: "백프레셔는 소비자가 처리할 수 있는 만큼만 데이터를 요청해서, 빠른 생산자가 느린 소비자를 압도하지 않게 하는 흐름 제어 방식입니다. Reactive Streams에서는 구독자가 `request(n)`으로 받을 개수를 알리고 생산자는 그만큼만 보냅니다.",
          analogy: "물을 받는 사람이 \"한 컵씩만 따라 주세요\"라고 말하는 것과 같습니다. 그렇지 않으면 물이 넘칩니다.",
          followUps: [
            [
              "소비자가 따라가지 못하면 어떤 전략이 있나요?",
              "`onBackpressureBuffer`로 일정량을 쌓아 두거나, `onBackpressureDrop`으로 넘치는 값을 버리거나, `onBackpressureLatest`로 최신 값만 남길 수 있습니다. 데이터 유실을 허용하는지에 따라 고릅니다."
            ]
          ],
          related: ["spring/flux"]
        }
      ]
    },
    {
      name: "가상 스레드",
      compare: {
        cols: ["기준", "가상 스레드", "플랫폼 스레드"],
        rows: [
          ["관리 주체", "JVM", "OS"],
          ["스택 메모리", "힙에 작게, 필요한 만큼", "약 1MB 고정 예약"],
          ["현실적인 개수", "수십만~수백만", "수천"],
          ["블로킹 시", "캐리어에서 내려가 양보", "OS 스레드가 그대로 대기"],
          ["풀 사용", "작업마다 새로 생성", "스레드 풀로 재사용"]
        ]
      },
      concepts: [
        {
          id: "spring/gasang-seuredeu",
          slug: "gasang-seuredeu",
          title: "가상 스레드",
          deep: true,
          def: "JVM이 관리하는 매우 가벼운 스레드로, 소수의 OS 스레드 위에서 수십만~수백만 개를 실행할 수 있다(Java 21 정식).",
          why: "블로킹 코드를 그대로 유지하면서 Thread per Request 모델의 한계(스레드 수 제한)를 없애, WebFlux처럼 코드를 바꾸지 않고도 I/O 대기가 많은 서버의 처리량을 높일 수 있다.",
          how: [
            "기존 플랫폼 스레드는 OS 스레드와 1:1로 대응해 하나에 약 1MB 스택을 쓰고 생성·전환 비용이 커서 수천 개가 현실적인 한계다.",
            "가상 스레드는 힙에 작은 스택만 두고, 실제 실행은 캐리어라고 부르는 소수의 플랫폼 스레드(ForkJoinPool) 위에서 이뤄진다.",
            "1) 가상 스레드가 캐리어 위에 올라가(mount) 코드를 실행한다.",
            "2) 소켓 읽기, DB 응답 대기 같은 블로킹 지점에 도달하면 JVM이 그 가상 스레드의 상태를 저장하고 캐리어에서 내린다(unmount).",
            "3) 비어 있는 캐리어는 곧바로 다른 가상 스레드를 실행한다.",
            "4) I/O가 끝나면 가상 스레드가 다시 아무 캐리어에 올라가 이어서 실행된다.",
            "스프링 부트 3.2+에서 `spring.threads.virtual.enabled=true`로 켜면 톰캣 요청 처리, `@Async`, 스케줄러가 가상 스레드를 쓴다."
          ],
          flow: [
            "가상 스레드가 캐리어에 mount",
            "코드 실행",
            "블로킹 I/O 지점 도달",
            "상태를 힙에 저장, unmount",
            "캐리어는 다른 작업 실행",
            "I/O 완료 후 다시 mount"
          ],
          code: "# application.yml\nspring:\n  threads:\n    virtual:\n      enabled: true\n\n// 직접 만들 때: 작업마다 새 가상 스레드\ntry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    executor.submit(() -> paymentClient.pay(order));\n}",
          codeLang: "java",
          use: [
            "외부 API 호출이 많은 MVC 서버에서 설정 한 줄로 가상 스레드를 켜 동시 처리 수를 늘립니다.",
            "여러 외부 API를 병렬로 호출할 때 `Executors.newVirtualThreadPerTaskExecutor()`로 작업마다 가상 스레드를 만듭니다."
          ],
          warn: [
            "스레드 풀에 넣어 재사용하지 않는다. 작업마다 새로 만드는 것이 원칙이다.",
            "CPU 연산 위주 작업에는 이득이 없다. 효과는 I/O 대기 시간이 길 때 나온다.",
            "동시 실행 수가 크게 늘어 DB 커넥션 풀 같은 한정 자원이 새 병목이 된다. 필요하면 세마포어로 동시 실행 수를 제한한다.",
            "ThreadLocal에 큰 객체를 두면 가상 스레드 수만큼 메모리를 쓴다.",
            "JDK 21~23에서는 `synchronized` 안의 블로킹이 피닝을 일으킨다(JDK 24에서 대부분 해결)."
          ],
          myth: [
            ["가상 스레드를 쓰면 모든 작업이 빨라진다", "CPU 연산 위주 작업은 빨라지지 않고, 효과는 I/O 대기 시간이 긴 작업에서 나옵니다."],
            ["가상 스레드도 풀로 재사용해야 한다", "생성 비용이 매우 작아 작업마다 새로 만드는 것이 원칙이며, 풀링하면 오히려 이점이 줄어듭니다."]
          ],
          answer: "가상 스레드는 Java 21에서 정식 도입된, JVM이 관리하는 매우 가벼운 스레드입니다. 블로킹 I/O를 만나면 JVM이 상태를 저장하고 캐리어 스레드에서 내려놓아, 그동안 캐리어가 다른 가상 스레드를 실행합니다. 그래서 블로킹 코드를 그대로 두고도 동시 처리량을 크게 높일 수 있고, 스프링 부트 3.2부터 `spring.threads.virtual.enabled=true`로 켤 수 있습니다.",
          analogy: "택시(캐리어)는 몇 대 없지만, 손님(가상 스레드)이 중간에 볼일을 보러 내리면 택시는 그사이 다른 손님을 태웁니다. 볼일이 끝난 손님은 아무 택시나 다시 타고 목적지로 갑니다.",
          qa: [
            "가상 스레드는 어떻게 적은 OS 스레드로 많은 요청을 처리하나요?",
            "가상 스레드는 블로킹 I/O를 만나면 JVM이 상태를 힙에 저장하고 캐리어 스레드에서 내려놓습니다. 캐리어는 그동안 다른 가상 스레드를 실행하고, I/O가 끝나면 원래 가상 스레드를 다시 올려 이어서 실행합니다. 그래서 코드는 블로킹 방식 그대로지만 OS 스레드는 대기하지 않아 처리량이 높아집니다. 다만 DB 커넥션 같은 한정 자원이 병목이 될 수 있어 함께 관리해야 합니다."
          ],
          followUps: [
            [
              "가상 스레드와 WebFlux 중 무엇을 고르나요?",
              "기존 블로킹 코드와 JPA를 그대로 쓰면서 동시성을 높이고 싶다면 가상 스레드가 간단합니다. 스트리밍, 백프레셔 같은 리액티브 기능이 필요하거나 이미 전 구간이 논블로킹이라면 WebFlux가 맞습니다."
            ],
            [
              "가상 스레드를 켰더니 DB 에러가 늘었습니다. 왜일까요?",
              "동시에 실행되는 요청이 크게 늘어 DB 커넥션 풀이 먼저 고갈되었을 가능성이 큽니다. 커넥션 획득 타임아웃이 늘어나므로 풀 크기를 조정하거나 세마포어로 DB 접근 동시성을 제한합니다."
            ],
            [
              "피닝이란 무엇이고 어떻게 피하나요?",
              "가상 스레드가 블로킹되었는데 캐리어에서 내려오지 못하는 현상입니다. JDK 21~23에서는 synchronized 안의 블로킹이 원인이라 ReentrantLock으로 바꾸길 권장했고, JDK 24에서 대부분 해결되었습니다."
            ]
          ],
          related: ["spring/pining", "spring/peulraetpom-seuredeu", "spring/thread-per-request", "spring/webflux"]
        },
        {
          id: "spring/peulraetpom-seuredeu",
          slug: "peulraetpom-seuredeu",
          title: "플랫폼 스레드",
          deep: false,
          def: "OS 스레드와 1:1로 대응하는 기존 자바 스레드(`new Thread()`)다.",
          why: "OS 스레드와 1:1이라 생성 비용과 메모리가 크다는 한계를 알아야 스레드 풀 크기와 가상 스레드 도입을 판단할 수 있기 때문이다.",
          how: [
            "생성할 때 OS 스레드와 큰 스택 메모리(기본 약 1MB)를 확보한다. 생성·전환 비용이 크기 때문에 스레드 풀로 재사용한다.",
            "OS 스케줄러가 직접 스케줄링하므로 CPU 연산이 많은 작업에 적합하다.",
            "가상 스레드의 캐리어도 플랫폼 스레드다."
          ],
          use: ["이미지 변환, 암호화처럼 CPU를 많이 쓰는 작업은 코어 수 크기의 플랫폼 스레드 풀에서 실행합니다."],
          answer: "플랫폼 스레드는 OS 스레드와 1:1로 대응하는 기존 자바 스레드로, 생성할 때 약 1MB의 스택을 예약하고 OS가 스케줄링합니다. 생성과 전환 비용이 커서 스레드 풀로 재사용하며, CPU 연산 위주 작업에 적합합니다. 가상 스레드를 실제로 실행하는 캐리어도 플랫폼 스레드입니다.",
          followUps: [
            [
              "스레드를 수천 개 만들면 어떤 문제가 생기나요?",
              "스택 메모리가 수 GB까지 늘고, OS 컨텍스트 스위칭이 많아져 실제 작업 시간보다 전환에 시간을 쓰게 됩니다. 그래서 풀 크기를 제한하거나 I/O 위주라면 가상 스레드를 씁니다."
            ]
          ],
          related: ["spring/gasang-seuredeu"]
        },
        {
          id: "spring/pining",
          slug: "pining",
          title: "피닝",
          deep: false,
          def: "가상 스레드가 블로킹되었는데도 캐리어 스레드에서 내려오지 못하고 캐리어를 붙잡고 있는 현상이다.",
          why: "가상 스레드를 도입해도 피닝이 잦으면 캐리어 스레드가 묶여 기대한 처리량 향상이 사라지기 때문이다.",
          how: [
            "JDK 21~23에서는 `synchronized` 블록·메서드 안에서 블로킹하거나 네이티브 메서드를 실행하는 동안 피닝이 일어났다.",
            "피닝이 많으면 캐리어가 부족해져 가상 스레드의 이점이 사라진다. 그래서 `synchronized` 대신 `ReentrantLock`을 쓰라고 권장했다.",
            "JDK 24(JEP 491)에서 `synchronized`로 인한 피닝은 대부분 해결되었다. `-Djdk.tracePinnedThreads`(21~23)나 JFR 이벤트로 발생 위치를 찾을 수 있다."
          ],
          use: ["JDK 21 환경에서 가상 스레드를 켠 뒤 처리량이 기대만큼 오르지 않을 때 JFR의 `jdk.VirtualThreadPinned` 이벤트로 원인 코드를 찾습니다."],
          answer: "피닝은 가상 스레드가 블로킹되었는데도 캐리어 스레드에서 내려오지 못하고 캐리어를 붙잡는 현상입니다. JDK 21~23에서는 `synchronized` 블록 안의 블로킹과 네이티브 호출이 원인이었고, JDK 24(JEP 491)에서 synchronized 문제는 대부분 해결되었습니다.",
          analogy: "택시 손님이 내리지 않고 택시 안에서 볼일을 보는 바람에 택시가 다른 손님을 태우지 못하는 상황입니다.",
          followUps: [
            [
              "JDK 21을 쓰는데 피닝을 줄이려면?",
              "블로킹이 일어나는 구간의 `synchronized`를 `ReentrantLock`으로 바꾸고, 사용하는 라이브러리(JDBC 드라이버 등)가 가상 스레드 친화 버전인지 확인합니다."
            ]
          ],
          related: ["spring/gasang-seuredeu"]
        }
      ]
    },
    {
      name: "비동기 · 스케줄링",
      compare: {
        cols: ["기준", "@Async", "@Scheduled"],
        rows: [
          ["실행 계기", "메서드 호출 시", "정해진 시간·주기"],
          ["활성화", "`@EnableAsync`", "`@EnableScheduling`"],
          ["기본 스레드", "풀(코어 8, 큐 무제한)", "스케줄러 스레드 1개"],
          ["반환값", "void 또는 CompletableFuture", "void만 가능"],
          ["다중 서버 주의", "해당 없음", "모든 서버에서 중복 실행"]
        ]
      },
      concepts: [
        {
          id: "spring/async",
          slug: "async",
          title: "@Async",
          deep: false,
          def: "메서드를 호출 즉시 반환하고 실제 작업은 별도 스레드 풀에서 실행하게 하는 애너테이션이다.",
          why: "메일 발송처럼 결과를 기다릴 필요 없는 작업 때문에 사용자 응답이 늦어지는 것을 막기 위해서다.",
          how: [
            "`@EnableAsync`를 켜면 `@Async`가 붙은 빈을 AOP 프록시로 감싸, 호출 시 작업을 TaskExecutor에 넘기고 바로 반환한다.",
            "이메일 발송, 알림처럼 결과를 기다릴 필요가 없는 작업에 쓴다.",
            "- 반환 타입은 `void` 또는 `CompletableFuture<T>`.",
            "- void면 예외가 호출자에게 전달되지 않으므로 `AsyncUncaughtExceptionHandler`를 등록해 로그를 남긴다."
          ],
          flow: ["외부에서 메서드 호출", "프록시가 가로챔", "TaskExecutor에 작업 제출", "호출자에게 즉시 반환", "풀 스레드가 작업 실행"],
          code: "@Async\npublic CompletableFuture<Void> sendWelcomeMail(String email) {\n    mailSender.send(email, \"가입을 환영합니다\");\n    return CompletableFuture.completedFuture(null);\n}",
          codeLang: "java",
          use: [
            "회원 가입 후 환영 메일 발송을 비동기로 처리해 가입 응답 시간을 줄입니다.",
            "여러 외부 API를 `CompletableFuture`로 동시에 호출하고 `allOf`로 결과를 합칩니다."
          ],
          warn: ["프록시 기반이라 같은 클래스 안에서 호출하면 비동기로 실행되지 않는다.", "트랜잭션과 SecurityContext는 새 스레드로 전파되지 않는다."],
          myth: [["@Async 메서드 안에서도 호출한 쪽의 트랜잭션이 이어진다", "새 스레드에서 실행되므로 트랜잭션과 SecurityContext는 전파되지 않습니다."]],
          answer: "`@Async`는 메서드를 호출하면 즉시 반환하고 실제 작업은 별도 스레드 풀에서 실행하게 하는 애너테이션입니다. `@EnableAsync`로 켜며 AOP 프록시 기반이라 같은 클래스 내부 호출에는 적용되지 않습니다. void로 반환하면 예외가 호출자에게 전달되지 않아 `CompletableFuture`를 반환하거나 예외 핸들러를 등록합니다.",
          followUps: [
            [
              "@Async를 붙였는데 비동기로 실행되지 않습니다. 왜일까요?",
              "같은 클래스 안에서 this로 호출했거나, `@EnableAsync`가 없거나, private 메서드인 경우입니다. 프록시를 거치도록 별도 빈으로 분리해 호출합니다."
            ]
          ],
          related: ["spring/bidonggi-seuredeu-pul", "spring/scheduled"]
        },
        {
          id: "spring/bidonggi-seuredeu-pul",
          slug: "bidonggi-seuredeu-pul",
          title: "비동기 스레드 풀",
          deep: false,
          def: "`@Async` 작업을 실행하는 TaskExecutor로, 부트가 `ThreadPoolTaskExecutor`를 자동 설정한다.",
          why: "기본 설정의 무제한 큐에 작업이 계속 쌓여 메모리가 고갈되거나 처리가 한없이 지연되는 것을 막기 위해서다.",
          how: [
            "부트 기본값은 코어 스레드 8개, 큐 용량 무제한이다. 큐가 무제한이면 최대 스레드 수 설정은 사실상 쓰이지 않고 작업이 큐에 계속 쌓인다.",
            "`spring.task.execution.pool.core-size`, `max-size`, `queue-capacity`로 조정하거나 Executor 빈을 직접 등록한다.",
            "가상 스레드를 켜면 `SimpleAsyncTaskExecutor`가 작업마다 가상 스레드를 만든다."
          ],
          code: "spring:\n  task:\n    execution:\n      pool:\n        core-size: 8\n        max-size: 32\n        queue-capacity: 500\n      thread-name-prefix: async-",
          codeLang: "yaml",
          use: [
            "알림 발송용, 리포트 생성용처럼 작업 성격별로 Executor 빈을 나눠 서로 영향을 주지 않게 합니다.",
            "스레드 이름 접두사를 지정해 로그에서 비동기 작업을 쉽게 구분합니다."
          ],
          warn: ["큐 무제한 상태로 작업이 처리 속도보다 빨리 들어오면 메모리가 부족해진다. 큐 용량과 거절 정책을 정한다."],
          myth: [
            [
              "max-size를 늘리면 스레드가 바로 늘어난다",
              "ThreadPoolExecutor는 큐가 가득 찬 뒤에야 max-size까지 스레드를 늘리므로, 큐가 무제한이면 max-size는 사실상 쓰이지 않습니다."
            ]
          ],
          answer: "비동기 스레드 풀은 `@Async` 작업을 실행하는 TaskExecutor로, 스프링 부트가 코어 8개, 큐 무제한인 `ThreadPoolTaskExecutor`를 자동 설정합니다. 큐가 무제한이면 작업이 계속 쌓여 메모리 문제가 생길 수 있어 `spring.task.execution.pool.*`로 코어 수, 최대 수, 큐 용량을 정합니다.",
          followUps: [
            [
              "큐가 가득 차면 어떻게 되나요?",
              "최대 스레드까지 늘린 뒤에도 큐가 가득 차면 거절 정책(RejectedExecutionHandler)이 동작합니다. 기본은 예외(AbortPolicy)이고, 호출 스레드가 직접 실행하는 CallerRunsPolicy로 자연스럽게 속도를 늦출 수도 있습니다."
            ]
          ],
          related: ["spring/async"]
        },
        {
          id: "spring/scheduled",
          slug: "scheduled",
          title: "@Scheduled",
          deep: false,
          def: "메서드를 정해진 주기나 cron 표현식에 따라 자동으로 실행하는 애너테이션이다.",
          why: "정산, 데이터 정리처럼 주기적으로 해야 하는 작업을 외부 도구 없이 애플리케이션 안에서 자동 실행하기 위해서다.",
          how: [
            "`@EnableScheduling`을 켜고 메서드에 붙인다.",
            "- `fixedDelay`: 이전 실행이 끝난 뒤 일정 시간 후 다시 실행.",
            "- `fixedRate`: 이전 실행 시작 시점 기준으로 일정 간격마다 실행.",
            "- `cron = \"0 0 3 * * *\"`: 초 분 시 일 월 요일 형식. 매일 새벽 3시.",
            "기본 스케줄러 스레드는 1개라 작업 하나가 길어지면 다른 작업이 밀린다. `spring.task.scheduling.pool.size`로 늘린다."
          ],
          use: ["매일 새벽 3시에 전날 주문을 정산하는 작업을 `cron = \"0 0 3 * * *\"`으로 등록합니다.", "5분마다 만료된 토큰과 임시 파일을 정리합니다."],
          warn: ["서버가 여러 대면 모든 서버에서 같은 작업이 동시에 실행된다. 분산 스케줄 락으로 한 대만 실행되게 한다."],
          myth: [
            [
              "fixedRate와 fixedDelay는 같다",
              "fixedRate는 이전 실행 시작 기준, fixedDelay는 이전 실행 종료 기준으로 다음 실행 시점을 계산합니다."
            ]
          ],
          answer: "`@Scheduled`는 메서드를 `fixedDelay`, `fixedRate`, `cron` 표현식에 따라 자동 실행하는 애너테이션으로 `@EnableScheduling`으로 켭니다. 기본 스케줄러 스레드가 1개라 작업이 길면 다른 작업이 밀리고, 서버가 여러 대면 모든 서버에서 중복 실행되므로 분산 락이 필요합니다.",
          followUps: [
            [
              "서버 3대에 배포했더니 정산이 3번 실행되었습니다. 어떻게 막나요?",
              "ShedLock처럼 DB나 Redis에 락을 기록해 한 서버만 실행하게 하거나, 스케줄 작업을 전용 인스턴스나 쿠버네티스 CronJob으로 분리합니다."
            ]
          ],
          related: ["spring/bunsan-seukejul-rak", "spring/async"]
        },
        {
          id: "spring/bunsan-seukejul-rak",
          slug: "bunsan-seukejul-rak",
          title: "분산 스케줄 락",
          deep: false,
          def: "여러 서버 중 한 대에서만 스케줄 작업이 실행되도록 DB나 Redis에 락을 거는 방법이다. ShedLock이 대표적이다.",
          why: "서버를 여러 대 띄우면 같은 스케줄 작업이 서버 수만큼 중복 실행되어 데이터가 중복 처리되기 때문이다.",
          how: [
            "작업 시작 전에 공용 저장소(DB 테이블, Redis)에 \"이 작업 실행 중\" 기록을 원자적으로 남기고, 성공한 서버만 실행한다.",
            "ShedLock은 `@SchedulerLock(name = \"settle\", lockAtMostFor = \"10m\")`처럼 선언하며, 서버가 죽어도 `lockAtMostFor` 후 락이 풀린다.",
            "대규모 배치라면 Spring Batch나 별도 스케줄러(Quartz 클러스터, 쿠버네티스 CronJob)를 쓰기도 한다."
          ],
          flow: ["스케줄 시각 도달", "모든 서버가 락 시도", "한 서버만 획득 성공", "해당 서버만 작업 실행", "완료 후 락 해제"],
          use: [
            "ShedLock의 `@SchedulerLock(name = \"dailySettle\", lockAtMostFor = \"10m\")`으로 정산 작업을 한 번만 실행합니다."
          ],
          answer: "분산 스케줄 락은 여러 서버 중 한 대만 스케줄 작업을 실행하도록 공용 저장소(DB, Redis)에 락을 기록하는 방법이고, ShedLock이 대표적입니다. 작업 시작 전 락 획득에 성공한 서버만 실행하며, 서버가 죽어도 `lockAtMostFor` 시간이 지나면 락이 풀립니다.",
          analogy: "회의실 예약판에 먼저 이름을 적은 팀만 회의실을 쓰는 것과 같습니다.",
          followUps: [
            [
              "lockAtMostFor는 왜 필요한가요?",
              "락을 잡은 서버가 작업 중 죽으면 락이 영원히 남아 다음 실행이 막힙니다. 최대 보유 시간을 정해 두면 그 시간이 지난 뒤 다른 서버가 다시 실행할 수 있습니다."
            ]
          ],
          related: ["spring/scheduled"]
        }
      ]
    },
    {
      name: "스레드 안전",
      concepts: [
        {
          id: "spring/threadlocal",
          slug: "threadlocal",
          title: "ThreadLocal",
          deep: false,
          def: "스레드마다 독립된 값을 저장하는 저장소다. 같은 변수라도 스레드별로 다른 값을 가진다.",
          why: "트랜잭션 커넥션이나 인증 정보를 메서드 파라미터로 계속 넘기지 않고 같은 스레드 안에서 공유하기 위해서다.",
          how: [
            "스프링은 요청을 처리하는 스레드에 트랜잭션 커넥션(TransactionSynchronizationManager), 인증 정보(SecurityContextHolder), 요청 정보(RequestContextHolder)를 ThreadLocal로 보관한다.",
            "덕분에 파라미터로 넘기지 않아도 같은 스레드 안의 어느 계층에서든 꺼내 쓸 수 있다.",
            "직접 쓸 때는 `set()`, `get()`, `remove()`를 사용하며, 요청이 끝나는 지점(필터나 인터셉터의 finally)에서 반드시 `remove()`한다."
          ],
          use: [
            "요청마다 생성한 추적 ID를 MDC(내부적으로 ThreadLocal)에 넣어 모든 로그에 함께 찍습니다.",
            "`SecurityContextHolder`로 서비스 계층에서 로그인 사용자를 꺼냅니다."
          ],
          warn: [
            "톰캣은 스레드를 재사용하므로 지우지 않으면 다음 요청이 이전 사용자의 값을 보게 되고, 메모리 누수도 생긴다.",
            "`@Async`나 새 스레드로는 값이 전달되지 않는다. Java 25에서는 ScopedValue가 더 안전한 대안이다."
          ],
          myth: [["요청이 끝나면 ThreadLocal 값은 자동으로 사라진다", "스레드는 풀로 돌아가 재사용되므로 값이 남아 있으며, 직접 remove해야 합니다."]],
          answer: "ThreadLocal은 스레드마다 독립된 값을 저장하는 저장소로, 스프링은 트랜잭션 커넥션, 인증 정보, 요청 정보를 여기에 보관합니다. 톰캣은 스레드를 재사용하므로 요청이 끝날 때 반드시 `remove()`해야 다른 사용자의 정보가 섞이거나 메모리가 새지 않습니다.",
          analogy: "직원마다 지급된 개인 사물함입니다. 퇴근할 때 비우지 않으면 다음 근무자가 그 사물함을 그대로 쓰게 됩니다.",
          followUps: [
            [
              "@Async로 넘긴 작업에서 ThreadLocal 값이 비어 있는 이유는?",
              "ThreadLocal은 스레드별 저장소라 다른 스레드에서는 보이지 않습니다. TaskDecorator로 값을 복사해 넘기거나, Java 25의 ScopedValue처럼 범위가 명확한 대안을 씁니다."
            ]
          ],
          related: ["spring/thread-per-request", "spring/async"]
        }
      ]
    }
  ]
};

export default topic;
