import type { Topic } from '../types';

const topic: Topic = {
  key: "net-3",
  name: "소켓 · I/O 모델",
  must: [
    "블로킹·논블로킹은 \"제어권을 언제 돌려받나\", 동기·비동기는 \"완료를 누가 확인하나\"다. epoll 기반 I/O는 동기·논블로킹이다.",
    "epoll은 감시 목록을 커널에 한 번 등록하고 준비된 소켓만 돌려받아, select·poll의 O(n) 비용과 fd 개수 제한을 없앴다.",
    "톰캣(MVC)은 요청당 스레드, 네티(WebFlux)는 이벤트 루프다. 이벤트 루프에서는 절대 블로킹하지 않는다.",
    "가상 스레드는 블로킹 코드 그대로 높은 동시성을 주지만, DB 커넥션 같은 뒤쪽 자원 한도는 따로 지켜야 한다."
  ],
  groups: [
    {
      name: "소켓 프로그래밍",
      compare: {
        cols: ["기준", "TCP keepalive", "Nagle 알고리즘", "listen 백로그"],
        rows: [
          ["다루는 문제", "죽은 연결 감지", "작은 패킷 남발", "연결 수락 대기"],
          ["설정", "`SO_KEEPALIVE`", "`TCP_NODELAY`로 끔", "`listen(backlog)`, `somaxconn`"],
          ["스프링·네티 설정", "커넥션 풀 keepaliveTime", "`ChannelOption.TCP_NODELAY`", "`accept-count`, `SO_BACKLOG`"],
          ["잘못 두면", "유휴 연결이 조용히 끊김", "수십~수백 ms 지연", "연결 거절·타임아웃"]
        ]
      },
      concepts: [
        {
          id: "net/soket-api-heureum",
          slug: "soket-api-heureum",
          title: "소켓 API 흐름",
          deep: false,
          def: "서버와 클라이언트가 TCP 연결을 맺고 데이터를 주고받기 위해 운영체제의 소켓 시스템 콜을 호출하는 순서다.",
          why: "프레임워크가 감춘 연결 수락과 읽기·쓰기 과정을 알아야 백로그 초과, 포트 충돌, 연결 누수 같은 장애를 이해할 수 있다.",
          how: [
            "서버: `socket()` → `bind()` → `listen()` → `accept()` → `read()`/`write()` → `close()`",
            "클라이언트: `socket()` → `connect()` → `write()`/`read()` → `close()`",
            "- socket: 통신 끝점을 만들고 파일 디스크립터(fd)를 돌려받는다.",
            "- bind: 소켓에 IP와 포트를 붙인다. 포트가 이미 쓰이면 `Address already in use`가 난다.",
            "- listen: 연결 요청을 받을 수 있는 수동 소켓으로 바꾸고 대기 큐(백로그) 크기를 정한다.",
            "- connect: 클라이언트가 호출하면 커널이 3-way handshake를 수행한다.",
            "- accept: handshake가 끝난 연결을 큐에서 꺼내 그 연결 전용의 새 소켓을 돌려준다. 듣기 소켓은 그대로 남아 다음 연결을 받는다.",
            "handshake 자체는 커널이 처리한다. 애플리케이션은 이미 수립된 연결을 `accept()`로 받아 갈 뿐이다."
          ],
          flow: ["socket", "bind", "listen", "accept", "read / write", "close"],
          code: "try (ServerSocket server = new ServerSocket(8080)) {   // socket + bind + listen\n    while (true) {\n        Socket client = server.accept();                // 연결이 올 때까지 블로킹\n        new Thread(() -> handle(client)).start();       // 연결마다 스레드 하나\n    }\n}\n\nvoid handle(Socket s) {\n    try (s; var in = s.getInputStream(); var out = s.getOutputStream()) {\n        byte[] buf = new byte[1024];\n        int n = in.read(buf);                           // 데이터가 올 때까지 블로킹\n        out.write(buf, 0, n);                           // 받은 그대로 돌려준다(에코)\n    } catch (IOException e) { /* 로그 */ }\n}",
          codeLang: "java",
          use: [
            "서버를 재시작할 때 `Address already in use`가 나면 이전 프로세스가 포트를 잡고 있거나 TIME_WAIT 소켓이 남은 것이다. `SO_REUSEADDR`로 재바인딩을 허용한다."
          ],
          warn: ["TCP는 바이트 스트림이라 `read()` 한 번이 보낸 메시지 하나와 같지 않다. 길이 헤더나 구분자로 메시지를 나눠야 한다."],
          answer: "서버는 socket으로 소켓을 만들고 bind로 IP와 포트를 붙인 뒤 listen으로 연결 대기 상태가 되고, accept로 handshake가 끝난 연결을 꺼내 그 연결 전용 소켓으로 read와 write를 합니다. 클라이언트는 socket을 만든 뒤 connect를 호출하면 커널이 3-way handshake를 수행합니다. 끝나면 양쪽 모두 close로 연결을 닫습니다.",
          analogy: "가게 문을 여는 것과 같습니다. 간판을 달고(bind) 문을 열어 두면(listen) 손님이 줄을 서고, 직원이 한 명씩 맞이해(accept) 전담 테이블로 안내합니다.",
          followUps: [
            [
              "accept가 돌려주는 소켓은 듣기 소켓과 무엇이 다른가요?",
              "듣기 소켓은 연결 요청만 받는 용도로 계속 남아 있고, accept는 연결마다 새 소켓(새 fd)을 만들어 돌려줍니다. 새 소켓은 출발지·목적지 IP와 포트 네 값으로 구분되므로 같은 서버 포트로 수많은 연결을 동시에 다룰 수 있습니다."
            ]
          ],
          related: [
            "net/listen-baekrogeu",
            "net/poteuwa-soket",
            "net/3-way-handshake",
            "net/yocheongdang-seuredeu-model"
          ]
        },
        {
          id: "net/listen-baekrogeu",
          slug: "listen-baekrogeu",
          title: "listen 백로그",
          deep: false,
          def: "`listen()`으로 정하는, handshake가 끝났지만 아직 애플리케이션이 `accept()`하지 않은 연결이 기다리는 큐의 크기다.",
          how: [
            "리눅스는 큐를 두 개 둔다.",
            "- SYN 큐: SYN을 받고 SYN+ACK를 보낸 반쯤 열린 연결. `tcp_max_syn_backlog`로 크기를 정한다.",
            "- accept 큐: handshake가 끝나 `accept()`를 기다리는 연결. `min(backlog, somaxconn)`이 크기다.",
            "accept 큐가 가득 차면 새로 온 연결의 마지막 ACK를 버리거나 RST를 보내, 클라이언트는 연결 타임아웃이나 거절을 겪는다.",
            "톰캣은 `server.tomcat.accept-count`(기본 100), 네티는 `SO_BACKLOG` 옵션으로 이 값을 정한다."
          ],
          use: [
            "트래픽 급증 시 클라이언트에서 연결 타임아웃이 나는데 서버 로그에는 요청이 없다면 accept 큐 초과를 의심하고 `ss -lnt`의 Recv-Q(대기 중)와 Send-Q(백로그 크기)를 확인한다."
          ],
          warn: ["애플리케이션 스레드가 모두 바쁘면 `accept()`가 늦어져 accept 큐가 넘친다. 백로그만 키우면 대기 시간이 늘 뿐 처리량은 늘지 않는다."],
          myth: [["백로그를 크게 잡으면 서버가 더 많은 요청을 처리한다.", "백로그는 대기열일 뿐이다. 처리 속도가 그대로면 대기 시간만 늘어나 결국 클라이언트 타임아웃이 난다."]],
          answer: "listen 백로그는 3-way handshake가 끝났지만 애플리케이션이 아직 accept하지 않은 연결이 기다리는 큐의 크기입니다. 리눅스는 반쯤 열린 연결의 SYN 큐와 완료된 연결의 accept 큐를 따로 두며, accept 큐가 넘치면 새 연결이 버려져 클라이언트가 타임아웃을 겪습니다. 톰캣은 accept-count, 네티는 SO_BACKLOG로 설정합니다.",
          followUps: [
            [
              "SYN Flood 공격은 어느 큐를 노리나요?",
              "응답하지 않는 SYN을 대량으로 보내 반쯤 열린 연결을 담는 SYN 큐를 가득 채웁니다. 리눅스는 SYN 쿠키로 큐에 상태를 저장하지 않고도 정상 연결을 받아 방어합니다."
            ]
          ],
          related: ["net/soket-api-heureum", "net/3-way-handshake", "net/yocheongdang-seuredeu-model"]
        },
        {
          id: "net/tcp-keepalive",
          slug: "tcp-keepalive",
          title: "TCP keepalive",
          deep: false,
          def: "오랫동안 데이터가 오가지 않는 TCP 연결에 커널이 주기적으로 빈 탐색 패킷을 보내 상대가 살아 있는지 확인하는 기능이다.",
          why: "상대가 FIN 없이 사라진 연결은 겉보기에 살아 있어 자원을 계속 차지하고, 그 연결로 보낸 요청은 한참 뒤에야 실패한다.",
          how: [
            "`SO_KEEPALIVE`를 켜면 유휴 시간(리눅스 기본 2시간)이 지난 뒤 탐색 패킷을 보내고, 응답이 없으면 몇 번 재시도한 뒤 연결을 끊는다.",
            "상대 서버가 전원이 꺼지거나 네트워크가 끊겨 FIN을 보내지 못한 \"죽은 연결\"을 찾아낸다.",
            "HTTP의 keep-alive(연결 재사용)와 이름만 비슷한 다른 기능이다. TCP keepalive는 생존 확인, HTTP keep-alive는 요청 여러 개에 연결 하나를 쓰는 것이다.",
            "방화벽이나 NAT, 로드 밸런서는 유휴 연결을 몇 분 만에 조용히 끊는다. 그래서 커넥션 풀이나 WebSocket은 애플리케이션 수준 핑(ping)을 더 짧은 주기로 보낸다."
          ],
          use: ["DB 앞의 방화벽이 유휴 연결을 10분에 끊는 환경에서 HikariCP `keepaliveTime`을 5분으로 두어 죽은 커넥션을 꺼내 쓰는 오류를 막는다."],
          warn: ["기본 2시간은 실무에 너무 길다. DB 커넥션 풀의 `keepaliveTime`, `maxLifetime`을 중간 장비의 유휴 타임아웃보다 짧게 잡는다."],
          myth: [
            [
              "HTTP keep-alive를 켜면 TCP keepalive도 켜진다.",
              "둘은 별개다. HTTP keep-alive는 요청 여러 개에 연결 하나를 재사용하는 것이고, TCP keepalive는 커널이 연결 생존을 확인하는 것이다."
            ]
          ],
          answer: "TCP keepalive는 일정 시간 데이터가 오가지 않은 연결에 커널이 탐색 패킷을 보내 상대가 살아 있는지 확인하고, 응답이 없으면 연결을 끊는 기능입니다. HTTP keep-alive가 연결 재사용을 뜻하는 것과는 다릅니다. 리눅스 기본 유휴 시간이 2시간이라, 실무에서는 커넥션 풀이나 WebSocket이 더 짧은 주기의 애플리케이션 핑을 함께 씁니다.",
          followUps: [
            [
              "커넥션 풀에서 \"Connection reset\" 오류가 간헐적으로 나는 원인은?",
              "중간 장비나 DB가 유휴 연결을 먼저 끊었는데 풀은 그 사실을 모른 채 연결을 빌려준 경우가 많습니다. 풀의 maxLifetime과 keepalive 주기를 상대의 유휴 타임아웃보다 짧게 잡아 해결합니다."
            ]
          ],
          related: ["net/tcp", "net/websocket", "net/time-wait"]
        },
        {
          id: "net/nagle-algorijeum",
          slug: "nagle-algorijeum",
          title: "Nagle 알고리즘",
          deep: false,
          def: "작은 데이터를 바로 보내지 않고, 이전에 보낸 데이터의 ACK가 올 때까지 모았다가 한 번에 보내 작은 패킷 수를 줄이는 TCP 기법이다.",
          how: [
            "1바이트를 보내도 TCP·IP 헤더 40바이트가 붙는다. 타이핑처럼 작은 쓰기가 많으면 네트워크가 헤더로 가득 찬다.",
            "- 보낼 데이터가 MSS만큼 쌓이면 바로 보낸다.",
            "- 아직 ACK를 못 받은 데이터가 없으면 바로 보낸다.",
            "- 그 외에는 ACK가 올 때까지 모은다.",
            "수신 측의 지연 ACK(delayed ACK)와 겹치면 수십~수백 ms의 지연이 생긴다. 그래서 지연에 민감한 서버는 `TCP_NODELAY`로 끈다."
          ],
          code: "socket.setTcpNoDelay(true);   // Nagle 끄기\n\n// Netty\nbootstrap.childOption(ChannelOption.TCP_NODELAY, true);",
          codeLang: "java",
          use: ["Netty, gRPC, Redis 클라이언트 등 대부분의 저지연 프레임워크는 기본으로 `TCP_NODELAY`를 켠다."],
          warn: ["Nagle을 끄면 작은 쓰기마다 패킷이 나간다. 애플리케이션에서 버퍼에 모아 한 번에 `write()`하는 습관이 함께 필요하다."],
          answer: "Nagle 알고리즘은 작은 데이터를 바로 보내지 않고 이전 데이터의 ACK가 올 때까지 모아 한 번에 보내 작은 패킷 수를 줄이는 TCP 기법입니다. 대역폭은 아끼지만 수신 측의 지연 ACK와 겹치면 수백 ms 지연이 생길 수 있어, 게임이나 RPC처럼 지연에 민감한 서버는 TCP_NODELAY로 끕니다.",
          followUps: [
            [
              "Nagle과 지연 ACK가 함께 있으면 왜 느려지나요?",
              "송신 측은 ACK를 받아야 다음 작은 데이터를 보내고, 수신 측은 보낼 데이터가 생기거나 타이머(최대 수백 ms)가 지날 때까지 ACK를 미룹니다. 서로 기다리는 상황이 되어 요청마다 지연이 붙습니다."
            ]
          ],
          related: ["net/tcp", "net/heureum-jeeo"]
        }
      ]
    },
    {
      name: "I/O 모델",
      compare: {
        cols: ["기준", "select", "poll", "epoll"],
        rows: [
          ["감시 목록 전달", "호출마다 전체 복사", "호출마다 전체 복사", "커널에 한 번 등록"],
          ["준비된 fd 찾기", "전체 순회 O(n)", "전체 순회 O(n)", "준비된 것만 O(k)"],
          ["fd 개수 제한", "보통 1024", "없음", "없음"],
          ["트리거", "레벨", "레벨", "레벨·엣지 선택"],
          ["이식성", "거의 모든 OS", "유닉스 계열", "리눅스 전용(맥은 kqueue)"]
        ]
      },
      concepts: [
        {
          id: "net/beulroking-nonbeulroking",
          slug: "beulroking-nonbeulroking",
          title: "블로킹 · 논블로킹",
          deep: true,
          def: "호출한 함수가 작업이 끝날 때까지 제어권을 붙잡고 있으면 블로킹, 할 수 있는 만큼만 하고 즉시 돌려주면 논블로킹이다.",
          why: "네트워크 I/O는 CPU 연산보다 수천 배 느리다. 블로킹 호출 중에는 스레드가 아무 일도 못 하고 기다리므로, 연결이 많아지면 스레드 수가 곧 서버 한계가 된다.",
          how: [
            "관점은 \"제어권을 언제 돌려받는가\"다.",
            "- 블로킹 `read()`: 소켓 수신 버퍼에 데이터가 없으면 스레드가 잠든다. 데이터가 오면 커널이 깨운다.",
            "- 논블로킹 `read()`: 데이터가 없으면 바로 `EAGAIN`(자바 NIO는 0바이트)을 돌려준다. 스레드는 다른 일을 하다가 나중에 다시 시도한다.",
            "논블로킹만 쓰면 \"데이터 왔나?\"를 계속 묻는 바쁜 대기(busy polling)가 된다. 그래서 I/O 멀티플렉싱으로 \"준비된 소켓만 알려 달라\"고 커널에 맡긴다.",
            "블로킹·논블로킹은 동기·비동기와 다른 축이다. 동기·비동기는 \"결과를 누가 확인하는가\"를 본다."
          ],
          code: "SocketChannel ch = SocketChannel.open(addr);\nch.configureBlocking(false);          // 논블로킹 모드\nByteBuffer buf = ByteBuffer.allocate(1024);\nint n = ch.read(buf);                 // 데이터가 없으면 바로 0 반환\nif (n == 0) { /* 다른 일을 하고 나중에 다시 */ }",
          codeLang: "java",
          use: [
            "Spring AI의 스트리밍 응답(`Flux<String>`)을 WebFlux로 내보낼 때, 중간에 JPA 같은 블로킹 호출이 있으면 `boundedElastic` 스케줄러로 격리해 이벤트 루프를 막지 않는다."
          ],
          warn: ["WebFlux 같은 이벤트 루프 위에서 블로킹 호출(JDBC, `Thread.sleep`, `block()`)을 하면 그 루프가 맡은 모든 연결이 멈춘다."],
          myth: [
            [
              "논블로킹이면 무조건 빠르다.",
              "요청 하나의 응답 시간은 비슷하거나 오히려 느릴 수 있다. 논블로킹의 이점은 같은 스레드로 더 많은 동시 연결을 처리하는 처리량과 자원 효율이다."
            ]
          ],
          answer: "블로킹은 호출한 작업이 끝날 때까지 함수가 돌아오지 않아 스레드가 기다리는 방식이고, 논블로킹은 지금 가능한 만큼만 처리하고 바로 돌아오는 방식입니다. 블로킹은 코드가 단순하지만 연결마다 스레드가 필요하고, 논블로킹은 적은 스레드로 많은 연결을 다룰 수 있어 보통 epoll 같은 멀티플렉싱과 함께 씁니다.",
          analogy: "블로킹은 식당 카운터 앞에서 음식이 나올 때까지 서서 기다리는 것이고, 논블로킹은 \"아직이에요\"라는 답을 듣고 자리로 돌아가 다른 일을 하다가 다시 물어보는 것입니다.",
          qa: [
            "블로킹과 논블로킹의 차이를 설명해 주세요.",
            "블로킹은 호출한 작업이 끝날 때까지 함수가 돌아오지 않아 호출한 스레드가 기다리는 방식이고, 논블로킹은 작업이 끝나지 않았어도 지금 가능한 만큼만 처리하고 바로 돌아오는 방식입니다. 블로킹은 코드가 단순하지만 연결마다 스레드가 필요하고, 논블로킹은 적은 스레드로 많은 연결을 다룰 수 있지만 준비 여부를 다시 확인해야 해서 보통 epoll 같은 멀티플렉싱과 함께 씁니다."
          ],
          followUps: [
            [
              "논블로킹만 쓰고 멀티플렉싱을 안 쓰면 어떤 문제가 있나요?",
              "데이터가 왔는지 계속 다시 물어보는 바쁜 대기가 되어 CPU를 낭비합니다. 그래서 커널에 준비된 소켓만 알려 달라고 맡기는 epoll 같은 멀티플렉싱과 함께 씁니다."
            ]
          ],
          related: ["net/donggi-bidonggi-i-o", "net/i-o-meoltipeulreksing", "net/java-nio"]
        },
        {
          id: "net/donggi-bidonggi-i-o",
          slug: "donggi-bidonggi-i-o",
          title: "동기 · 비동기 I/O",
          deep: true,
          def: "호출한 쪽이 작업 완료를 직접 기다리거나 확인하면 동기, 작업을 맡기고 완료되면 콜백·이벤트로 통보받으면 비동기다.",
          why: "블로킹 여부만으로는 I/O 모델을 다 설명할 수 없다. 결과를 누가 언제 챙기는지까지 구분해야 epoll, io_uring, CompletableFuture, Reactor가 각각 어디에 속하는지 정확히 말할 수 있다.",
          how: [
            "두 축을 조합하면 네 가지가 나온다.",
            "- 동기 + 블로킹: 일반 `InputStream.read()`. 끝날 때까지 기다린다.",
            "- 동기 + 논블로킹: 논블로킹 `read()`를 반복 호출하며 완료를 직접 확인한다. epoll로 준비 알림을 받아도 실제 `read()`는 애플리케이션이 하므로 동기 I/O로 분류한다.",
            "- 비동기 + 논블로킹: 요청만 하고 바로 돌아오며, 커널이 데이터 복사까지 끝낸 뒤 알려 준다. 리눅스 io_uring, 윈도 IOCP, 자바 `AsynchronousSocketChannel`.",
            "- 비동기 + 블로킹: 비동기로 맡겨 놓고 결과를 `future.get()`으로 기다리는 경우. 장점을 모두 잃는 안티 패턴이다.",
            "애플리케이션 수준에서 Spring WebFlux의 `Mono`/`Flux`는 결과를 구독자에게 밀어 주는 비동기 모델이다. 그 아래에서 네티는 epoll(동기·논블로킹 I/O)을 쓴다."
          ],
          code: "// 동기: 결과가 나올 때까지 기다린다\nString body = restClient.get().uri(\"/faq\").retrieve().body(String.class);\n\n// 비동기: 결과가 오면 이어서 처리하도록 등록만 한다\nwebClient.get().uri(\"/faq\").retrieve()\n    .bodyToMono(String.class)\n    .subscribe(b -> log.info(\"받음: {}\", b));",
          codeLang: "java",
          use: [
            "WebClient로 외부 API 여러 개를 `Mono.zip`으로 동시에 호출하면 가장 느린 호출 시간만큼만 걸린다. 동기 클라이언트로 순서대로 부르면 모든 호출 시간의 합이 된다."
          ],
          warn: [
            "리액티브 체인 중간에 `.block()`을 호출하면 비동기 + 블로킹이 되어 이벤트 루프 스레드가 멈춘다. 리액터는 네티 스레드에서 `block()`을 감지하면 예외를 던진다."
          ],
          myth: [
            [
              "epoll을 쓰면 비동기 I/O다.",
              "epoll은 준비됐다는 알림만 주고 실제 read는 애플리케이션이 하므로 동기·논블로킹 I/O다. 커널이 복사까지 끝내고 알려 주는 io_uring, IOCP가 비동기 I/O다."
            ]
          ],
          answer: "동기는 호출한 쪽이 작업 완료를 직접 기다리거나 확인하는 방식이고, 비동기는 작업을 맡겨 두고 완료되면 콜백이나 이벤트로 통보받는 방식입니다. 블로킹·논블로킹이 제어권을 바로 돌려받는지를 보는 기준이라면, 동기·비동기는 완료를 누가 챙기는지를 보는 기준이라 둘을 조합해 네 가지 모델이 나옵니다.",
          analogy: "동기는 택배가 왔는지 직접 현관에 나가 확인하는 것이고, 비동기는 택배 기사가 도착하면 문자를 보내 주는 것입니다.",
          qa: [
            "동기·비동기와 블로킹·논블로킹은 어떻게 다른가요?",
            "블로킹·논블로킹은 호출된 함수가 제어권을 바로 돌려주는지를 보는 기준이고, 동기·비동기는 작업 완료를 호출한 쪽이 직접 확인하는지 아니면 완료 통보를 받는지를 보는 기준입니다. 그래서 epoll 기반 논블로킹 I/O는 준비 알림을 받은 뒤 직접 read를 하므로 동기·논블로킹이고, io_uring이나 IOCP처럼 커널이 복사까지 끝내고 알려 주는 방식이 비동기·논블로킹입니다."
          ],
          followUps: [
            [
              "비동기 + 블로킹 조합은 언제 생기나요?",
              "비동기로 작업을 맡겨 놓고 바로 `future.get()`이나 `mono.block()`으로 결과를 기다릴 때 생깁니다. 비동기의 이점을 잃고 스레드만 묶이므로 리액티브 코드에서는 피해야 합니다."
            ]
          ],
          related: ["net/beulroking-nonbeulroking", "net/i-o-meoltipeulreksing", "net/reactor-paeteon"]
        },
        {
          id: "net/i-o-meoltipeulreksing",
          slug: "i-o-meoltipeulreksing",
          title: "I/O 멀티플렉싱",
          deep: true,
          def: "스레드 하나가 여러 소켓을 한꺼번에 지켜보다가, 읽거나 쓸 준비가 된 소켓만 골라 처리하는 기법이다.",
          why: "연결마다 스레드를 두면 연결 수만큼 메모리와 컨텍스트 스위칭 비용이 든다. 대부분의 연결은 대부분의 시간 동안 아무 데이터도 보내지 않으므로, 준비된 것만 골라 처리하면 적은 스레드로 많은 연결을 감당할 수 있다.",
          how: [
            "1) 감시할 소켓(fd)과 관심 이벤트(읽기·쓰기·연결 수락)를 등록한다.",
            "2) `select`/`poll`/`epoll_wait`를 호출해 하나라도 준비될 때까지 기다린다. 기다리는 동안은 블로킹이지만 소켓 수천 개를 한 번에 기다린다.",
            "3) 준비된 소켓 목록을 받아 논블로킹으로 읽고 쓴다.",
            "4) 다시 2로 돌아간다(이벤트 루프).",
            "- select: fd 집합을 비트맵으로 매번 커널에 복사하고 전체를 훑는다. 개수 제한(보통 1024)이 있고 O(n)이다.",
            "- poll: 개수 제한을 없앴지만 여전히 매번 전체를 복사하고 훑는다.",
            "- epoll(리눅스)·kqueue(BSD/맥): 감시 목록을 커널에 한 번만 등록하고, 준비된 것만 돌려준다. 연결이 많아도 O(준비된 수)다."
          ],
          flow: ["소켓 등록", "epoll_wait 대기", "준비된 목록 수신", "논블로킹 read/write", "다시 대기"],
          use: ["Redis가 단일 스레드로 초당 수십만 요청을 처리할 수 있는 이유가 epoll 기반 멀티플렉싱이다."],
          answer: "I/O 멀티플렉싱은 하나의 스레드가 select, poll, epoll 같은 시스템 콜로 여러 소켓을 동시에 감시하다가 준비된 소켓만 처리하는 방식입니다. 연결마다 스레드를 두면 수만 연결에서 메모리와 컨텍스트 스위칭 비용이 커지는데, 멀티플렉싱은 적은 스레드로 많은 연결을 처리할 수 있어 Nginx, Redis, Netty의 기반이 됩니다.",
          analogy: "식당 직원 한 명이 테이블마다 서 있지 않고, 호출 벨이 울린 테이블에만 가서 주문을 받는 것과 같습니다.",
          qa: [
            "I/O 멀티플렉싱이 무엇이고 왜 쓰나요?",
            "I/O 멀티플렉싱은 하나의 스레드가 select, poll, epoll 같은 시스템 콜로 여러 소켓을 동시에 감시하다가 준비된 소켓만 처리하는 방식입니다. 연결마다 스레드를 두는 방식은 동시 연결이 수만 개가 되면 메모리와 컨텍스트 스위칭 비용이 커지는데, 멀티플렉싱은 적은 스레드로 많은 연결을 처리할 수 있어 Nginx, Redis, Netty 같은 고성능 서버의 기반이 됩니다."
          ],
          followUps: [
            [
              "멀티플렉싱 루프에서 오래 걸리는 작업을 하면 어떻게 되나요?",
              "루프가 그 작업을 끝낼 때까지 다른 소켓의 이벤트를 처리하지 못해 모든 연결의 응답이 늦어집니다. 그래서 무거운 작업은 워커 스레드 풀로 넘기는 구조를 씁니다."
            ]
          ],
          related: ["net/epoll", "net/reactor-paeteon", "net/java-nio", "net/c10k-munje"]
        },
        {
          id: "net/epoll",
          slug: "epoll",
          title: "epoll",
          deep: true,
          def: "리눅스에서 많은 소켓의 준비 상태를 효율적으로 감시하는 I/O 이벤트 통지 시스템 콜 묶음이다.",
          how: [
            "- `epoll_create`: 커널 안에 감시 목록(관심 목록)을 담을 epoll 인스턴스를 만든다.",
            "- `epoll_ctl`: 소켓을 목록에 추가·수정·삭제한다. 한 번 등록하면 매번 다시 넘길 필요가 없다.",
            "- `epoll_wait`: 준비된 소켓만 담긴 목록(ready list)을 돌려받는다.",
            "커널은 소켓에 데이터가 들어오는 순간 콜백으로 그 소켓을 ready list에 넣는다. 그래서 select처럼 매번 전체를 훑지 않고, 감시하는 연결이 10만 개여도 준비된 몇 개만 처리한다.",
            "- 레벨 트리거(LT, 기본): 읽을 데이터가 남아 있는 한 매번 알려 준다. 다루기 쉽다.",
            "- 엣지 트리거(ET): 상태가 바뀌는 순간 한 번만 알려 준다. 알림을 받으면 `EAGAIN`이 날 때까지 다 읽어야 한다. 호출 수가 줄어 빠르지만 실수하면 데이터가 남은 채 멈춘다.",
            "자바 NIO `Selector`는 리눅스에서 epoll을 쓰고, 네티는 JNI로 epoll을 직접 쓰는 `EpollEventLoopGroup`도 제공한다."
          ],
          use: [
            "네티는 리눅스에서 `EpollEventLoopGroup`(네이티브 전송)을 쓰면 JDK Selector보다 가비지와 지연이 적다. Reactor Netty는 클래스패스에 있으면 자동으로 쓴다."
          ],
          warn: ["epoll은 소켓 같은 네트워크 fd에 효과가 있다. 일반 파일 디스크 I/O는 항상 \"준비됨\"으로 나와 멀티플렉싱 이점이 없다."],
          myth: [
            [
              "epoll은 파일 디스크 I/O도 빠르게 해 준다.",
              "일반 파일은 항상 준비된 상태로 보고되어 효과가 없다. 디스크 I/O는 io_uring이나 별도 스레드 풀을 쓴다."
            ]
          ],
          answer: "epoll은 리눅스의 I/O 이벤트 통지 시스템 콜로, 감시할 소켓을 epoll_ctl로 커널에 한 번만 등록하고 epoll_wait로 준비된 소켓만 돌려받습니다. select처럼 매번 전체 목록을 복사하고 훑지 않아 연결이 많아도 비용이 준비된 수에만 비례하고, 레벨 트리거와 엣지 트리거를 고를 수 있습니다.",
          qa: [
            "epoll이 select보다 빠른 이유는 무엇인가요?",
            "select는 호출할 때마다 감시할 fd 집합 전체를 커널로 복사하고, 커널과 애플리케이션이 모두 전체를 훑어 준비된 것을 찾아야 해서 O(n)입니다. epoll은 감시 목록을 커널에 한 번만 등록하고, 데이터가 들어오면 커널이 해당 fd를 준비 목록에 넣어 두므로 epoll_wait는 준비된 것만 돌려줍니다. 그래서 연결 수가 많아도 비용이 준비된 연결 수에만 비례하고, fd 개수 제한도 없습니다."
          ],
          followUps: [
            [
              "엣지 트리거를 쓸 때 주의할 점은?",
              "상태가 바뀌는 순간 한 번만 알림이 오므로, 알림을 받으면 EAGAIN이 날 때까지 버퍼를 끝까지 읽어야 합니다. 일부만 읽고 멈추면 새 데이터가 오기 전까지 다시 알림이 오지 않아 연결이 멈춘 것처럼 됩니다. 반드시 논블로킹 소켓과 함께 써야 합니다."
            ]
          ],
          related: ["net/i-o-meoltipeulreksing", "net/java-nio", "net/ibenteu-rupeu-seobeo-netty"]
        }
      ]
    },
    {
      name: "서버 아키텍처",
      compare: {
        cols: ["기준", "요청당 스레드 모델", "이벤트 루프 서버 (Netty)"],
        rows: [
          ["대표", "Spring MVC + Tomcat", "Spring WebFlux + Reactor Netty"],
          ["스레드 수", "요청 수만큼(풀 기본 200)", "CPU 코어 × 2 정도"],
          ["I/O 대기 중 스레드", "묶여서 기다림", "반납하고 다른 연결 처리"],
          ["코드 스타일", "순차·명령형", "리액티브(Mono/Flux)"],
          ["유리한 경우", "일반 CRUD, 블로킹 라이브러리", "스트리밍, 긴 연결, 대기 많은 I/O"],
          ["주의", "느린 호출이 풀 고갈", "루프에서 블로킹 금지"]
        ]
      },
      concepts: [
        {
          id: "net/c10k-munje",
          slug: "c10k-munje",
          title: "C10K 문제",
          deep: false,
          def: "서버 한 대가 동시 연결 1만 개를 처리하지 못하는 한계를 가리키는 말로, 1999년 댄 케겔이 정리한 문제다.",
          how: [
            "당시 서버는 연결마다 프로세스나 스레드를 만들었다. 1만 개면 스레드 스택 메모리만 수 GB, 컨텍스트 스위칭과 select의 O(n) 비용이 감당할 수 없을 만큼 커졌다.",
            "- 해결 1: 논블로킹 소켓 + epoll/kqueue 같은 효율적인 멀티플렉싱.",
            "- 해결 2: 스레드 몇 개가 이벤트 루프로 모든 연결을 처리하는 이벤트 기반 서버(Nginx, Node.js, Netty).",
            "- 해결 3: 최근에는 가상 스레드처럼 아주 가벼운 스레드로 연결마다 스레드를 두는 방식이 다시 가능해졌다.",
            "지금은 수십만~수백만 동시 연결을 다루는 C10M이 논의된다. 채팅, 알림, SSE 스트리밍처럼 오래 열린 연결이 많은 서비스에서 특히 중요하다."
          ],
          use: ["AI 챗봇처럼 응답을 수 초~수십 초 동안 SSE로 흘려보내는 서비스는 동시 접속자만큼 연결이 오래 열려 있어, 요청당 스레드 모델에서는 스레드 풀이 금방 고갈된다."],
          answer: "C10K 문제는 서버 한 대가 동시 연결 1만 개를 처리하지 못하던 한계로, 연결마다 스레드를 두는 구조의 메모리와 컨텍스트 스위칭 비용, select의 O(n) 비용 때문이었습니다. epoll 같은 효율적인 멀티플렉싱과 이벤트 루프 기반 서버로 해결했고, 최근에는 가상 스레드처럼 가벼운 스레드도 대안이 되었습니다.",
          followUps: [
            [
              "스레드 1만 개를 만들면 왜 문제가 되나요?",
              "OS 스레드는 스택만 기본 1MB 정도를 예약해 1만 개면 수 GB가 들고, 스케줄러가 스레드를 바꿀 때마다 컨텍스트 스위칭 비용이 쌓입니다. 대부분이 I/O를 기다리며 놀고 있는데도 자원을 차지한다는 점이 핵심입니다."
            ]
          ],
          related: [
            "net/i-o-meoltipeulreksing",
            "net/ibenteu-rupeu-seobeo-netty",
            "net/gasang-seuredeuwa-neteuwokeu-i-o"
          ]
        },
        {
          id: "net/yocheongdang-seuredeu-model",
          slug: "yocheongdang-seuredeu-model",
          title: "요청당 스레드 모델",
          deep: false,
          def: "들어온 요청(또는 연결) 하나를 스레드 하나가 처음부터 끝까지 맡아 블로킹 방식으로 처리하는 서버 구조다.",
          how: [
            "스프링 MVC + 톰캣이 대표적이다. 톰캣 커넥터가 연결을 받아 스레드 풀(`server.tomcat.threads.max`, 기본 200)의 스레드에 요청을 넘긴다.",
            "- 장점: 코드가 위에서 아래로 읽히는 순차 흐름이라 이해·디버깅이 쉽다. `ThreadLocal`, 트랜잭션, 시큐리티 컨텍스트가 자연스럽게 동작한다.",
            "- 단점: DB나 외부 API를 기다리는 동안 스레드가 묶인다. 동시에 처리할 수 있는 요청 수가 스레드 수로 제한된다.",
            "스레드가 모두 바쁘면 새 요청은 accept 큐에서 기다리고, 큐도 넘치면 거절된다.",
            "최근 톰캣은 연결 수락과 읽기 대기에는 NIO를 쓰고, 요청 처리만 워커 스레드에 넘긴다. 그래서 유휴 keep-alive 연결이 스레드를 잡아먹지는 않는다."
          ],
          code: "# application.yml (Spring MVC + Tomcat)\nserver:\n  tomcat:\n    threads:\n      max: 200          # 동시에 처리할 요청 수의 상한\n      min-spare: 10\n    accept-count: 100   # 스레드가 모두 바쁠 때 대기할 연결 수\n    max-connections: 8192",
          codeLang: "java",
          use: ["외부 결제 API가 느려져 톰캣 스레드 200개가 모두 대기하면 헬스 체크까지 응답하지 못한다. 외부 호출에 타임아웃을 걸고 별도 스레드 풀(벌크헤드)로 분리한다."],
          warn: ["느린 외부 API 하나 때문에 200개 스레드가 모두 기다리면 서버 전체가 멈춘 것처럼 보인다. 타임아웃과 벌크헤드로 스레드를 보호한다."],
          answer: "요청당 스레드 모델은 요청 하나를 스레드 하나가 처음부터 끝까지 블로킹 방식으로 처리하는 구조로, Spring MVC와 톰캣이 대표입니다. 코드가 순차적이라 이해와 디버깅이 쉽고 ThreadLocal 기반 기능이 자연스럽게 동작하지만, I/O를 기다리는 동안 스레드가 묶여 동시 처리량이 스레드 풀 크기로 제한됩니다.",
          analogy: "은행 창구 직원이 손님 한 명의 업무를 끝까지 맡는 방식입니다. 서류를 기다리는 동안에도 직원은 그 손님 앞에 묶여 있습니다.",
          followUps: [
            [
              "스레드 풀을 크게 늘리면 해결되지 않나요?",
              "스레드마다 메모리와 컨텍스트 스위칭 비용이 들고, 늘어난 스레드가 DB 커넥션 풀 같은 뒤쪽 자원을 기다리며 다시 막힐 뿐입니다. 근본적으로는 느린 의존성을 타임아웃으로 끊거나, 가상 스레드·논블로킹으로 대기 비용을 줄여야 합니다."
            ]
          ],
          related: [
            "net/listen-baekrogeu",
            "net/c10k-munje",
            "net/gasang-seuredeuwa-neteuwokeu-i-o",
            "net/ibenteu-rupeu-seobeo-netty"
          ]
        },
        {
          id: "net/reactor-paeteon",
          slug: "reactor-paeteon",
          title: "Reactor 패턴",
          deep: true,
          def: "이벤트 디멀티플렉서(epoll 등)로 준비된 I/O 이벤트를 받아, 이벤트 종류에 맞는 핸들러로 나눠 주는(dispatch) 이벤트 기반 서버 설계 패턴이다.",
          why: "멀티플렉싱 루프를 그대로 짜면 연결 수락, 읽기, 쓰기, 비즈니스 로직이 한 루프에 뒤엉킨다. 이벤트를 받는 부분과 처리하는 부분을 나누면 구조가 정리되고 스레드 배치를 바꿔 가며 확장할 수 있다.",
          how: [
            "- Reactor: `select()`를 돌며 이벤트를 기다리고 알맞은 핸들러에 넘긴다.",
            "- Acceptor: 연결 수락 이벤트를 받아 새 연결을 등록하고 핸들러를 붙인다.",
            "- Handler: 읽기·쓰기 이벤트를 처리한다. 블로킹하지 않고 짧게 끝나야 한다.",
            "변형은 세 가지다.",
            "- 단일 Reactor 단일 스레드: Redis(명령 처리부). 단순하지만 CPU 코어 하나만 쓴다.",
            "- 단일 Reactor + 워커 스레드 풀: I/O는 루프가, 무거운 처리는 워커가 맡는다.",
            "- 멀티 Reactor(메인-서브): 메인 Reactor는 accept만, 서브 Reactor 여러 개가 연결을 나눠 읽기·쓰기를 맡는다. Netty(boss/worker 그룹), Nginx가 이 구조다.",
            "반대 개념인 Proactor 패턴은 비동기 I/O(IOCP, io_uring)를 써서 \"완료\" 이벤트를 받는다."
          ],
          flow: ["Reactor가 select 대기", "이벤트 발생", "종류 판별", "Acceptor 또는 Handler로 dispatch", "다시 대기"],
          code: "Selector selector = Selector.open();\nServerSocketChannel server = ServerSocketChannel.open();\nserver.bind(new InetSocketAddress(8080)).configureBlocking(false);\nserver.register(selector, SelectionKey.OP_ACCEPT);       // Acceptor 등록\n\nwhile (true) {\n    selector.select();                                   // 준비될 때까지 대기 (epoll_wait)\n    for (var it = selector.selectedKeys().iterator(); it.hasNext(); ) {\n        SelectionKey key = it.next(); it.remove();\n        if (key.isAcceptable()) {                        // 연결 수락\n            SocketChannel ch = server.accept();\n            ch.configureBlocking(false);\n            ch.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));\n        } else if (key.isReadable()) {                   // 읽기 핸들러로 dispatch\n            handleRead(key);\n        }\n    }\n}",
          codeLang: "sql",
          use: ["Redis 6부터는 명령 실행은 단일 스레드로 두고 네트워크 읽기·쓰기만 여러 I/O 스레드에 나눠 Reactor 구조를 확장했다."],
          answer: "Reactor 패턴은 epoll 같은 이벤트 디멀티플렉서로 여러 연결의 I/O 준비 이벤트를 한 곳에서 기다리다가, 연결 수락은 Acceptor에, 읽기와 쓰기는 각 핸들러에 나눠 주는 이벤트 기반 설계입니다. Netty와 Nginx는 연결 수락용 메인 루프와 읽기·쓰기용 서브 루프를 나눈 멀티 Reactor 구조를 씁니다.",
          analogy: "콜센터의 교환원과 같습니다. 교환원 한 명이 모든 전화벨을 듣고, 울린 전화를 담당 부서로 바로 연결해 줍니다.",
          qa: [
            "Reactor 패턴을 설명해 주세요.",
            "Reactor 패턴은 epoll 같은 이벤트 디멀티플렉서로 여러 연결의 I/O 준비 이벤트를 한 곳에서 기다리다가, 이벤트가 오면 연결 수락은 Acceptor에, 읽기와 쓰기는 각 핸들러에 나눠 주는 이벤트 기반 설계입니다. 적은 스레드로 많은 연결을 처리할 수 있고, Netty처럼 연결 수락용 boss 루프와 읽기·쓰기용 worker 루프를 나누는 멀티 Reactor 구조로 확장합니다. 핸들러가 블로킹하면 루프 전체가 멈추므로 핸들러는 짧고 논블로킹이어야 합니다."
          ],
          followUps: [
            [
              "Reactor와 Proactor의 차이는?",
              "Reactor는 읽을 준비가 됐다는 이벤트를 받아 애플리케이션이 직접 read하고, Proactor는 비동기 I/O로 커널이 읽기를 끝낸 뒤 완료 이벤트를 줍니다. 리눅스는 epoll 기반 Reactor가 주류이고, 윈도의 IOCP가 Proactor의 대표입니다."
            ]
          ],
          related: ["net/i-o-meoltipeulreksing", "net/ibenteu-rupeu-seobeo-netty", "net/java-nio"]
        },
        {
          id: "net/ibenteu-rupeu-seobeo-netty",
          slug: "ibenteu-rupeu-seobeo-netty",
          title: "이벤트 루프 서버 (Netty)",
          deep: true,
          def: "적은 수의 이벤트 루프 스레드가 각자 맡은 연결들의 I/O 이벤트를 논블로킹으로 처리하는 서버로, 자바에서는 Netty가 대표이고 Spring WebFlux의 기본 서버다.",
          why: "오래 열린 연결(SSE, WebSocket, 스트리밍 응답)이나 외부 호출 대기가 많은 서비스에서는 연결마다 스레드를 묶어 두면 낭비가 크다. 이벤트 루프는 기다리는 동안 스레드를 쓰지 않으므로 같은 자원으로 훨씬 많은 동시 연결을 감당한다.",
          how: [
            "- EventLoopGroup: boss 그룹은 연결 수락, worker 그룹은 읽기·쓰기를 맡는다. worker 수는 기본 CPU 코어 수 × 2다.",
            "- EventLoop: 스레드 하나 + Selector 하나. 연결(Channel)은 생성될 때 루프 하나에 배정되고, 그 연결의 모든 이벤트는 평생 같은 스레드에서 처리된다. 그래서 채널 단위로는 락이 필요 없다.",
            "- ChannelPipeline: 디코더 → 비즈니스 핸들러 → 인코더처럼 핸들러를 사슬로 이어 이벤트를 흘려보낸다.",
            "WebFlux는 Reactor Netty 위에서 동작한다. 컨트롤러가 `Flux<String>`을 돌려주면, 데이터가 생길 때마다 같은 이벤트 루프가 응답 스트림에 써 준다. 기다리는 동안 스레드는 다른 연결을 처리한다.",
            "핵심 규칙: 이벤트 루프 스레드에서는 절대 블로킹하지 않는다. 블로킹 작업은 `Schedulers.boundedElastic()` 같은 별도 스레드 풀로 넘긴다."
          ],
          flow: ["boss 루프 accept", "worker 루프에 채널 배정", "epoll 이벤트", "ChannelPipeline 핸들러", "응답 write"],
          code: "@GetMapping(value = \"/chat\", produces = MediaType.TEXT_EVENT_STREAM_VALUE)\npublic Flux<String> chat(@RequestParam String message) {\n    return chatClient.prompt().user(message).stream().content(); // 논블로킹 스트리밍\n}\n\n// JPA(블로킹) 호출이 섞일 때는 이벤트 루프 밖으로 넘긴다\nMono<List<Faq>> faqs = Mono.fromCallable(() -> faqRepository.searchByKeyword(kw))\n        .subscribeOn(Schedulers.boundedElastic());",
          codeLang: "java",
          use: [
            "Spring AI 챗봇의 `/chat` 엔드포인트처럼 LLM 토큰을 `Flux<String>`으로 흘려보내는 API는 WebFlux + Netty에서 연결이 수천 개 열려 있어도 스레드는 몇 개만 쓴다.",
            "Spring Cloud Gateway, Reactor Netty 기반 WebClient, gRPC-java, Elasticsearch 클라이언트 등 많은 인프라 라이브러리가 Netty 위에서 동작한다."
          ],
          warn: [
            "이벤트 루프에서 JDBC, `Thread.sleep`, 동기 HTTP 클라이언트를 호출하면 그 루프의 모든 연결이 함께 멈춘다. BlockHound로 테스트 중에 찾아낼 수 있다.",
            "WebFlux를 쓰면서 DB가 JPA(블로킹)라면 이점이 줄어든다. R2DBC를 쓰거나 블로킹 호출을 별도 스케줄러로 격리한다."
          ],
          myth: [
            [
              "WebFlux로 바꾸면 무조건 빨라진다.",
              "요청 하나의 지연은 크게 줄지 않는다. 대기 시간이 긴 I/O가 많을 때 처리량과 자원 효율이 좋아지며, DB 드라이버가 블로킹이면 효과가 거의 없다."
            ]
          ],
          answer: "이벤트 루프 서버는 CPU 코어 수 정도의 적은 스레드가 각자 맡은 연결들의 I/O 이벤트를 논블로킹으로 처리하는 구조로, 자바에서는 Netty가 대표이고 Spring WebFlux의 기본 서버입니다. 연결은 한 이벤트 루프에 고정되어 같은 스레드에서만 처리되므로 락이 필요 없고, I/O를 기다리는 동안 스레드를 반납해 적은 자원으로 많은 동시 연결을 처리합니다. 대신 루프에서 블로킹하면 그 루프의 모든 연결이 멈춥니다.",
          analogy: "요리사 몇 명이 여러 냄비를 동시에 올려 두고, 끓는 냄비만 돌아가며 손보는 주방과 같습니다. 한 요리사가 한 냄비 앞에서 멍하니 기다리면 나머지 냄비가 다 탑니다.",
          qa: [
            "Spring MVC(톰캣)와 WebFlux(네티)의 스레드 모델 차이를 설명해 주세요.",
            "Spring MVC는 톰캣의 스레드 풀에서 요청 하나를 스레드 하나가 끝까지 블로킹으로 처리하므로, 동시에 처리할 수 있는 요청 수가 스레드 수에 묶입니다. WebFlux는 네티의 적은 수의 이벤트 루프 스레드가 논블로킹 I/O로 여러 연결을 번갈아 처리해, 외부 응답을 기다리는 동안 스레드를 반납합니다. 그래서 스트리밍이나 대기 시간이 긴 I/O가 많은 서비스에 유리하지만, 루프에서 블로킹 호출을 하면 전체가 멈추므로 드라이버까지 논블로킹이어야 효과가 있습니다."
          ],
          followUps: [
            [
              "이벤트 루프에서 블로킹 호출을 했는지 어떻게 찾나요?",
              "BlockHound를 테스트에 넣으면 논블로킹 스레드에서 블로킹 호출이 일어날 때 예외를 던져 알려 줍니다. 운영에서는 이벤트 루프 스레드의 스레드 덤프에 JDBC나 sleep이 보이는지, 지연이 특정 루프에 몰리는지 확인합니다."
            ],
            [
              "가상 스레드가 나왔는데 WebFlux가 여전히 필요한가요?",
              "단순히 블로킹 I/O 때문에 스레드가 부족한 문제라면 가상 스레드 + Spring MVC가 더 쉬운 해법입니다. 하지만 스트리밍 데이터의 backpressure 제어나 여러 비동기 흐름을 조합하는 연산자가 필요하면 리액티브 모델이 여전히 유리합니다."
            ]
          ],
          related: ["net/reactor-paeteon", "net/yocheongdang-seuredeu-model", "net/epoll", "net/sse", "net/websocket"]
        }
      ]
    },
    {
      name: "자바 네트워크 I/O",
      compare: {
        cols: ["기준", "java.io", "Java NIO", "가상 스레드와 네트워크 I/O"],
        rows: [
          ["방식", "스트림·블로킹", "버퍼·채널·논블로킹", "블로킹 코드, 내부는 논블로킹"],
          ["동시 연결", "연결당 OS 스레드", "Selector로 소수 스레드", "연결당 가상 스레드"],
          ["코드 난도", "쉬움", "어려움(flip, 상태 관리)", "쉬움"],
          ["도입", "자바 1.0", "자바 1.4 (NIO.2는 7)", "자바 21"]
        ]
      },
      concepts: [
        {
          id: "net/java-nio",
          slug: "java-nio",
          title: "Java NIO",
          deep: false,
          def: "자바 1.4에 추가된 논블로킹 I/O API로, Channel · Buffer · Selector 세 요소로 멀티플렉싱 서버를 만들 수 있게 한다.",
          how: [
            "- Channel: 양방향 연결 통로. `SocketChannel`, `ServerSocketChannel`. `configureBlocking(false)`로 논블로킹이 된다.",
            "- Buffer: 채널과 데이터를 주고받는 고정 크기 버퍼. `position`, `limit`, `capacity`로 상태를 관리하며, 쓰기 후 읽기 전에 `flip()`을 호출한다.",
            "- Selector: 여러 채널을 등록하고 준비된 것만 골라 준다. 리눅스에서는 epoll, 맥에서는 kqueue로 구현된다.",
            "- Direct Buffer: `ByteBuffer.allocateDirect()`는 힙 밖 메모리를 써서 커널과 복사를 줄인다. 할당 비용이 커서 풀로 재사용한다.",
            "기존 `java.io`는 스트림 기반·블로킹, NIO는 버퍼 기반·논블로킹 가능이다. 자바 7의 NIO.2는 `AsynchronousSocketChannel`(비동기 I/O)과 새 파일 API(`Path`, `Files`)를 더했다.",
            "API가 저수준이라 실무에서는 직접 쓰기보다 Netty, Tomcat NIO 커넥터처럼 그 위에 만든 프레임워크를 쓴다."
          ],
          code: "ByteBuffer buf = ByteBuffer.allocate(1024);\nint n = channel.read(buf);   // 채널 → 버퍼 (쓰기 모드)\nbuf.flip();                  // 읽기 모드로 전환: limit = position, position = 0\nwhile (buf.hasRemaining()) channel.write(buf);\nbuf.clear();                 // 다시 쓰기 모드로",
          codeLang: "java",
          use: [
            "톰캣 8.5부터 기본 커넥터가 NIO(`Http11NioProtocol`)라, 유휴 keep-alive 연결은 Poller 스레드가 Selector로 감시하고 요청이 오면 워커 스레드에 넘긴다."
          ],
          warn: ["`flip()`을 빼먹으면 아무것도 쓰지 않거나 엉뚱한 범위를 쓴다. NIO 버그의 단골 원인이다."],
          myth: [["NIO의 N은 Non-blocking이다.", "공식 명칭은 New I/O다. 논블로킹 모드를 지원하지만 기본은 블로킹 모드다."]],
          answer: "Java NIO는 자바 1.4에 추가된 논블로킹 I/O API로, 양방향 통로인 Channel, 데이터를 담는 Buffer, 여러 채널의 준비 상태를 감시하는 Selector로 이루어집니다. Selector는 리눅스에서 epoll로 구현되어 적은 스레드로 많은 연결을 처리할 수 있으며, 실무에서는 이를 감싼 Netty나 톰캣 NIO 커넥터를 주로 씁니다.",
          followUps: [
            [
              "Direct Buffer는 언제 쓰나요?",
              "힙 밖 메모리라 소켓 I/O 시 JVM 힙과 네이티브 메모리 사이의 복사를 줄여 줍니다. 대신 할당·해제 비용이 크고 GC로 바로 회수되지 않아, Netty처럼 풀로 만들어 재사용할 때 효과적입니다."
            ]
          ],
          related: ["net/i-o-meoltipeulreksing", "net/epoll", "net/reactor-paeteon", "net/beulroking-nonbeulroking"]
        },
        {
          id: "net/gasang-seuredeuwa-neteuwokeu-i-o",
          slug: "gasang-seuredeuwa-neteuwokeu-i-o",
          title: "가상 스레드와 네트워크 I/O",
          deep: false,
          def: "자바 21의 가상 스레드는 JVM이 관리하는 아주 가벼운 스레드로, 블로킹 I/O를 만나면 OS 스레드를 내려놓아 블로킹 코드 그대로 높은 동시성을 얻게 한다.",
          why: "요청당 스레드의 쉬운 코드와 이벤트 루프의 높은 동시성을 함께 얻기 위해서다. 리액티브로 다시 짜지 않고도 대기 시간이 긴 I/O 서비스의 처리량을 올릴 수 있다.",
          how: [
            "가상 스레드는 소수의 캐리어(OS) 스레드 위에 올라탄다. 소켓 `read()`처럼 블로킹 지점에 닿으면 JVM이 가상 스레드를 캐리어에서 떼어 내고(unmount), 내부적으로 논블로킹 I/O + 폴러(epoll)에 등록한다. 데이터가 오면 다시 캐리어에 올려 이어서 실행한다.",
            "- 결과: 코드는 요청당 스레드 모델처럼 순차적으로 쓰고, 실행은 이벤트 루프처럼 스레드를 아낀다.",
            "- 스레드 하나의 메모리가 수 KB라 수십만 개를 만들 수 있다. 그래서 풀로 재사용하지 않고 작업마다 새로 만든다.",
            "스프링 부트 3.2 이상에서 `spring.threads.virtual.enabled=true`를 켜면 톰캣 요청 처리와 `@Async`가 가상 스레드로 바뀐다."
          ],
          code: "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    for (int i = 0; i < 10_000; i++) {\n        executor.submit(() -> {\n            // 블로킹 HTTP 호출이어도 OS 스레드는 묶이지 않는다\n            return restClient.get().uri(\"/faq\").retrieve().body(String.class);\n        });\n    }\n}",
          codeLang: "java",
          use: [
            "Spring Boot 3.2+에서 `spring.threads.virtual.enabled=true` 한 줄로 Spring MVC 서버의 외부 API 대기 처리량을 크게 늘린다."
          ],
          warn: [
            "`synchronized` 블록 안이나 네이티브 호출 중에 블로킹하면 캐리어 스레드에 고정(pinning)된다(자바 24부터 synchronized 고정은 해소). 오래 걸리는 구간은 `ReentrantLock`으로 바꾼다.",
            "가상 스레드는 동시성을 늘릴 뿐 뒤쪽 자원(DB 커넥션 풀)은 그대로다. 수만 개가 동시에 DB를 두드리지 않게 세마포어 등으로 제한한다.",
            "CPU 연산이 많은 작업에는 이점이 없다. 기다리는 시간이 긴 I/O 작업에 효과적이다."
          ],
          myth: [["가상 스레드는 풀로 재사용해야 한다.", "생성 비용이 매우 작아 작업마다 새로 만드는 것이 권장 방식이다. 동시 실행 수를 제한하려면 풀 대신 세마포어를 쓴다."]],
          answer: "가상 스레드는 JVM이 관리하는 가벼운 스레드로, 소켓 read 같은 블로킹 지점에서 캐리어 OS 스레드를 내려놓고 내부적으로 epoll에 등록했다가 데이터가 오면 다시 실행됩니다. 그래서 블로킹 코드 그대로 수십만 개의 동시 작업을 처리할 수 있지만, synchronized 내부 블로킹에 의한 고정이나 DB 커넥션 같은 뒤쪽 자원 한도는 따로 관리해야 합니다.",
          analogy: "직원(OS 스레드) 몇 명이 수많은 업무 서류(가상 스레드)를 들고 다니다가, 결재를 기다려야 하는 서류는 잠시 내려놓고 다른 서류를 집어 드는 것과 같습니다.",
          followUps: [
            [
              "피닝(pinning)이 무엇이고 왜 문제인가요?",
              "가상 스레드가 블로킹되어도 캐리어 OS 스레드에서 떨어지지 못하고 붙잡아 두는 현상입니다. synchronized 블록 안이나 네이티브 호출 중 블로킹할 때 생기며, 캐리어 수가 적어 몇 개만 고정돼도 전체 처리량이 떨어집니다. 자바 24부터 synchronized에 의한 피닝은 해소되었고, 그 전 버전에서는 ReentrantLock으로 바꿉니다."
            ]
          ],
          related: ["net/yocheongdang-seuredeu-model", "net/ibenteu-rupeu-seobeo-netty", "net/c10k-munje", "net/epoll"]
        }
      ]
    }
  ]
};

export default topic;
