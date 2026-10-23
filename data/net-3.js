(window.MINDMAP = window.MINDMAP || {})['net-3'] = {
  name: '소켓 · I/O 모델',
  groups: [
    { name: '소켓 프로그래밍', items: [
      { t: '소켓 API 흐름', deep: false,
        d: '서버와 클라이언트가 TCP 연결을 맺고 데이터를 주고받기 위해 운영체제의 소켓 시스템 콜을 호출하는 순서다.',
        how: [
          '서버: `socket()` → `bind()` → `listen()` → `accept()` → `read()`/`write()` → `close()`',
          '클라이언트: `socket()` → `connect()` → `write()`/`read()` → `close()`',
          '- socket: 통신 끝점을 만들고 파일 디스크립터(fd)를 돌려받는다.',
          '- bind: 소켓에 IP와 포트를 붙인다. 포트가 이미 쓰이면 `Address already in use`가 난다.',
          '- listen: 연결 요청을 받을 수 있는 수동 소켓으로 바꾸고 대기 큐(백로그) 크기를 정한다.',
          '- connect: 클라이언트가 호출하면 커널이 3-way handshake를 수행한다.',
          '- accept: handshake가 끝난 연결을 큐에서 꺼내 그 연결 전용의 새 소켓을 돌려준다. 듣기 소켓은 그대로 남아 다음 연결을 받는다.',
          'handshake 자체는 커널이 처리한다. 애플리케이션은 이미 수립된 연결을 `accept()`로 받아 갈 뿐이다.'
        ],
        code: `try (ServerSocket server = new ServerSocket(8080)) {   // socket + bind + listen
    while (true) {
        Socket client = server.accept();                // 연결이 올 때까지 블로킹
        new Thread(() -> handle(client)).start();       // 연결마다 스레드 하나
    }
}

void handle(Socket s) {
    try (s; var in = s.getInputStream(); var out = s.getOutputStream()) {
        byte[] buf = new byte[1024];
        int n = in.read(buf);                           // 데이터가 올 때까지 블로킹
        out.write(buf, 0, n);                           // 받은 그대로 돌려준다(에코)
    } catch (IOException e) { /* 로그 */ }
}`,
        warn: ['TCP는 바이트 스트림이라 `read()` 한 번이 보낸 메시지 하나와 같지 않다. 길이 헤더나 구분자로 메시지를 나눠야 한다.'],
        rel: ['listen 백로그', '포트와 소켓', '3-way handshake', '요청당 스레드 모델'] },
      { t: 'listen 백로그', deep: false,
        d: '`listen()`으로 정하는, handshake가 끝났지만 아직 애플리케이션이 `accept()`하지 않은 연결이 기다리는 큐의 크기다.',
        how: [
          '리눅스는 큐를 두 개 둔다.',
          '- SYN 큐: SYN을 받고 SYN+ACK를 보낸 반쯤 열린 연결. `tcp_max_syn_backlog`로 크기를 정한다.',
          '- accept 큐: handshake가 끝나 `accept()`를 기다리는 연결. `min(backlog, somaxconn)`이 크기다.',
          'accept 큐가 가득 차면 새로 온 연결의 마지막 ACK를 버리거나 RST를 보내, 클라이언트는 연결 타임아웃이나 거절을 겪는다.',
          '톰캣은 `server.tomcat.accept-count`(기본 100), 네티는 `SO_BACKLOG` 옵션으로 이 값을 정한다.'
        ],
        warn: ['애플리케이션 스레드가 모두 바쁘면 `accept()`가 늦어져 accept 큐가 넘친다. 백로그만 키우면 대기 시간이 늘 뿐 처리량은 늘지 않는다.'],
        rel: ['소켓 API 흐름', '3-way handshake', '요청당 스레드 모델'] },
      { t: 'TCP keepalive', deep: false,
        d: '오랫동안 데이터가 오가지 않는 TCP 연결에 커널이 주기적으로 빈 탐색 패킷을 보내 상대가 살아 있는지 확인하는 기능이다.',
        how: [
          '`SO_KEEPALIVE`를 켜면 유휴 시간(리눅스 기본 2시간)이 지난 뒤 탐색 패킷을 보내고, 응답이 없으면 몇 번 재시도한 뒤 연결을 끊는다.',
          '상대 서버가 전원이 꺼지거나 네트워크가 끊겨 FIN을 보내지 못한 "죽은 연결"을 찾아낸다.',
          'HTTP의 keep-alive(연결 재사용)와 이름만 비슷한 다른 기능이다. TCP keepalive는 생존 확인, HTTP keep-alive는 요청 여러 개에 연결 하나를 쓰는 것이다.',
          '방화벽이나 NAT, 로드 밸런서는 유휴 연결을 몇 분 만에 조용히 끊는다. 그래서 커넥션 풀이나 WebSocket은 애플리케이션 수준 핑(ping)을 더 짧은 주기로 보낸다.'
        ],
        warn: ['기본 2시간은 실무에 너무 길다. DB 커넥션 풀의 `keepaliveTime`, `maxLifetime`을 중간 장비의 유휴 타임아웃보다 짧게 잡는다.'],
        rel: ['TCP', 'WebSocket', 'TIME_WAIT'] },
      { t: 'Nagle 알고리즘', deep: false,
        d: '작은 데이터를 바로 보내지 않고, 이전에 보낸 데이터의 ACK가 올 때까지 모았다가 한 번에 보내 작은 패킷 수를 줄이는 TCP 기법이다.',
        how: [
          '1바이트를 보내도 TCP·IP 헤더 40바이트가 붙는다. 타이핑처럼 작은 쓰기가 많으면 네트워크가 헤더로 가득 찬다.',
          '- 보낼 데이터가 MSS만큼 쌓이면 바로 보낸다.',
          '- 아직 ACK를 못 받은 데이터가 없으면 바로 보낸다.',
          '- 그 외에는 ACK가 올 때까지 모은다.',
          '수신 측의 지연 ACK(delayed ACK)와 겹치면 수십~수백 ms의 지연이 생긴다. 그래서 지연에 민감한 서버는 `TCP_NODELAY`로 끈다.'
        ],
        code: `socket.setTcpNoDelay(true);   // Nagle 끄기

// Netty
bootstrap.childOption(ChannelOption.TCP_NODELAY, true);`,
        warn: ['Nagle을 끄면 작은 쓰기마다 패킷이 나간다. 애플리케이션에서 버퍼에 모아 한 번에 `write()`하는 습관이 함께 필요하다.'],
        rel: ['TCP', '흐름 제어'] }
    ]},
    { name: 'I/O 모델', items: [
      { t: '블로킹 · 논블로킹', deep: true,
        d: '호출한 함수가 작업이 끝날 때까지 제어권을 붙잡고 있으면 블로킹, 할 수 있는 만큼만 하고 즉시 돌려주면 논블로킹이다.',
        why: '네트워크 I/O는 CPU 연산보다 수천 배 느리다. 블로킹 호출 중에는 스레드가 아무 일도 못 하고 기다리므로, 연결이 많아지면 스레드 수가 곧 서버 한계가 된다.',
        how: [
          '관점은 "제어권을 언제 돌려받는가"다.',
          '- 블로킹 `read()`: 소켓 수신 버퍼에 데이터가 없으면 스레드가 잠든다. 데이터가 오면 커널이 깨운다.',
          '- 논블로킹 `read()`: 데이터가 없으면 바로 `EAGAIN`(자바 NIO는 0바이트)을 돌려준다. 스레드는 다른 일을 하다가 나중에 다시 시도한다.',
          '논블로킹만 쓰면 "데이터 왔나?"를 계속 묻는 바쁜 대기(busy polling)가 된다. 그래서 I/O 멀티플렉싱으로 "준비된 소켓만 알려 달라"고 커널에 맡긴다.',
          '블로킹·논블로킹은 동기·비동기와 다른 축이다. 동기·비동기는 "결과를 누가 확인하는가"를 본다.'
        ],
        code: `SocketChannel ch = SocketChannel.open(addr);
ch.configureBlocking(false);          // 논블로킹 모드
ByteBuffer buf = ByteBuffer.allocate(1024);
int n = ch.read(buf);                 // 데이터가 없으면 바로 0 반환
if (n == 0) { /* 다른 일을 하고 나중에 다시 */ }`,
        warn: ['WebFlux 같은 이벤트 루프 위에서 블로킹 호출(JDBC, `Thread.sleep`, `block()`)을 하면 그 루프가 맡은 모든 연결이 멈춘다.'],
        qa: ['블로킹과 논블로킹의 차이를 설명해 주세요.',
          '블로킹은 호출한 작업이 끝날 때까지 함수가 돌아오지 않아 호출한 스레드가 기다리는 방식이고, 논블로킹은 작업이 끝나지 않았어도 지금 가능한 만큼만 처리하고 바로 돌아오는 방식입니다. 블로킹은 코드가 단순하지만 연결마다 스레드가 필요하고, 논블로킹은 적은 스레드로 많은 연결을 다룰 수 있지만 준비 여부를 다시 확인해야 해서 보통 epoll 같은 멀티플렉싱과 함께 씁니다.'],
        rel: ['동기 · 비동기 I/O', 'I/O 멀티플렉싱', 'Java NIO'] },
      { t: '동기 · 비동기 I/O', deep: true,
        d: '호출한 쪽이 작업 완료를 직접 기다리거나 확인하면 동기, 작업을 맡기고 완료되면 콜백·이벤트로 통보받으면 비동기다.',
        why: '블로킹 여부만으로는 I/O 모델을 다 설명할 수 없다. 결과를 누가 언제 챙기는지까지 구분해야 epoll, io_uring, CompletableFuture, Reactor가 각각 어디에 속하는지 정확히 말할 수 있다.',
        how: [
          '두 축을 조합하면 네 가지가 나온다.',
          '- 동기 + 블로킹: 일반 `InputStream.read()`. 끝날 때까지 기다린다.',
          '- 동기 + 논블로킹: 논블로킹 `read()`를 반복 호출하며 완료를 직접 확인한다. epoll로 준비 알림을 받아도 실제 `read()`는 애플리케이션이 하므로 동기 I/O로 분류한다.',
          '- 비동기 + 논블로킹: 요청만 하고 바로 돌아오며, 커널이 데이터 복사까지 끝낸 뒤 알려 준다. 리눅스 io_uring, 윈도 IOCP, 자바 `AsynchronousSocketChannel`.',
          '- 비동기 + 블로킹: 비동기로 맡겨 놓고 결과를 `future.get()`으로 기다리는 경우. 장점을 모두 잃는 안티 패턴이다.',
          '애플리케이션 수준에서 Spring WebFlux의 `Mono`/`Flux`는 결과를 구독자에게 밀어 주는 비동기 모델이다. 그 아래에서 네티는 epoll(동기·논블로킹 I/O)을 쓴다.'
        ],
        code: `// 동기: 결과가 나올 때까지 기다린다
String body = restClient.get().uri("/faq").retrieve().body(String.class);

// 비동기: 결과가 오면 이어서 처리하도록 등록만 한다
webClient.get().uri("/faq").retrieve()
    .bodyToMono(String.class)
    .subscribe(b -> log.info("받음: {}", b));`,
        warn: ['리액티브 체인 중간에 `.block()`을 호출하면 비동기 + 블로킹이 되어 이벤트 루프 스레드가 멈춘다. 리액터는 네티 스레드에서 `block()`을 감지하면 예외를 던진다.'],
        qa: ['동기·비동기와 블로킹·논블로킹은 어떻게 다른가요?',
          '블로킹·논블로킹은 호출된 함수가 제어권을 바로 돌려주는지를 보는 기준이고, 동기·비동기는 작업 완료를 호출한 쪽이 직접 확인하는지 아니면 완료 통보를 받는지를 보는 기준입니다. 그래서 epoll 기반 논블로킹 I/O는 준비 알림을 받은 뒤 직접 read를 하므로 동기·논블로킹이고, io_uring이나 IOCP처럼 커널이 복사까지 끝내고 알려 주는 방식이 비동기·논블로킹입니다.'],
        rel: ['블로킹 · 논블로킹', 'I/O 멀티플렉싱', 'Reactor 패턴'] },
      { t: 'I/O 멀티플렉싱', deep: true,
        d: '스레드 하나가 여러 소켓을 한꺼번에 지켜보다가, 읽거나 쓸 준비가 된 소켓만 골라 처리하는 기법이다.',
        why: '연결마다 스레드를 두면 연결 수만큼 메모리와 컨텍스트 스위칭 비용이 든다. 대부분의 연결은 대부분의 시간 동안 아무 데이터도 보내지 않으므로, 준비된 것만 골라 처리하면 적은 스레드로 많은 연결을 감당할 수 있다.',
        how: [
          '1) 감시할 소켓(fd)과 관심 이벤트(읽기·쓰기·연결 수락)를 등록한다.',
          '2) `select`/`poll`/`epoll_wait`를 호출해 하나라도 준비될 때까지 기다린다. 기다리는 동안은 블로킹이지만 소켓 수천 개를 한 번에 기다린다.',
          '3) 준비된 소켓 목록을 받아 논블로킹으로 읽고 쓴다.',
          '4) 다시 2로 돌아간다(이벤트 루프).',
          '- select: fd 집합을 비트맵으로 매번 커널에 복사하고 전체를 훑는다. 개수 제한(보통 1024)이 있고 O(n)이다.',
          '- poll: 개수 제한을 없앴지만 여전히 매번 전체를 복사하고 훑는다.',
          '- epoll(리눅스)·kqueue(BSD/맥): 감시 목록을 커널에 한 번만 등록하고, 준비된 것만 돌려준다. 연결이 많아도 O(준비된 수)다.'
        ],
        qa: ['I/O 멀티플렉싱이 무엇이고 왜 쓰나요?',
          'I/O 멀티플렉싱은 하나의 스레드가 select, poll, epoll 같은 시스템 콜로 여러 소켓을 동시에 감시하다가 준비된 소켓만 처리하는 방식입니다. 연결마다 스레드를 두는 방식은 동시 연결이 수만 개가 되면 메모리와 컨텍스트 스위칭 비용이 커지는데, 멀티플렉싱은 적은 스레드로 많은 연결을 처리할 수 있어 Nginx, Redis, Netty 같은 고성능 서버의 기반이 됩니다.'],
        rel: ['epoll', 'Reactor 패턴', 'Java NIO', 'C10K 문제'] },
      { t: 'epoll', deep: true,
        d: '리눅스에서 많은 소켓의 준비 상태를 효율적으로 감시하는 I/O 이벤트 통지 시스템 콜 묶음이다.',
        how: [
          '- `epoll_create`: 커널 안에 감시 목록(관심 목록)을 담을 epoll 인스턴스를 만든다.',
          '- `epoll_ctl`: 소켓을 목록에 추가·수정·삭제한다. 한 번 등록하면 매번 다시 넘길 필요가 없다.',
          '- `epoll_wait`: 준비된 소켓만 담긴 목록(ready list)을 돌려받는다.',
          '커널은 소켓에 데이터가 들어오는 순간 콜백으로 그 소켓을 ready list에 넣는다. 그래서 select처럼 매번 전체를 훑지 않고, 감시하는 연결이 10만 개여도 준비된 몇 개만 처리한다.',
          '- 레벨 트리거(LT, 기본): 읽을 데이터가 남아 있는 한 매번 알려 준다. 다루기 쉽다.',
          '- 엣지 트리거(ET): 상태가 바뀌는 순간 한 번만 알려 준다. 알림을 받으면 `EAGAIN`이 날 때까지 다 읽어야 한다. 호출 수가 줄어 빠르지만 실수하면 데이터가 남은 채 멈춘다.',
          '자바 NIO `Selector`는 리눅스에서 epoll을 쓰고, 네티는 JNI로 epoll을 직접 쓰는 `EpollEventLoopGroup`도 제공한다.'
        ],
        warn: ['epoll은 소켓 같은 네트워크 fd에 효과가 있다. 일반 파일 디스크 I/O는 항상 "준비됨"으로 나와 멀티플렉싱 이점이 없다.'],
        qa: ['epoll이 select보다 빠른 이유는 무엇인가요?',
          'select는 호출할 때마다 감시할 fd 집합 전체를 커널로 복사하고, 커널과 애플리케이션이 모두 전체를 훑어 준비된 것을 찾아야 해서 O(n)입니다. epoll은 감시 목록을 커널에 한 번만 등록하고, 데이터가 들어오면 커널이 해당 fd를 준비 목록에 넣어 두므로 epoll_wait는 준비된 것만 돌려줍니다. 그래서 연결 수가 많아도 비용이 준비된 연결 수에만 비례하고, fd 개수 제한도 없습니다.'],
        rel: ['I/O 멀티플렉싱', 'Java NIO', '이벤트 루프 서버 (Netty)'] }
    ]},
    { name: '서버 아키텍처', items: [
      { t: 'C10K 문제', deep: false,
        d: '서버 한 대가 동시 연결 1만 개를 처리하지 못하는 한계를 가리키는 말로, 1999년 댄 케겔이 정리한 문제다.',
        how: [
          '당시 서버는 연결마다 프로세스나 스레드를 만들었다. 1만 개면 스레드 스택 메모리만 수 GB, 컨텍스트 스위칭과 select의 O(n) 비용이 감당할 수 없을 만큼 커졌다.',
          '- 해결 1: 논블로킹 소켓 + epoll/kqueue 같은 효율적인 멀티플렉싱.',
          '- 해결 2: 스레드 몇 개가 이벤트 루프로 모든 연결을 처리하는 이벤트 기반 서버(Nginx, Node.js, Netty).',
          '- 해결 3: 최근에는 가상 스레드처럼 아주 가벼운 스레드로 연결마다 스레드를 두는 방식이 다시 가능해졌다.',
          '지금은 수십만~수백만 동시 연결을 다루는 C10M이 논의된다. 채팅, 알림, SSE 스트리밍처럼 오래 열린 연결이 많은 서비스에서 특히 중요하다.'
        ],
        rel: ['I/O 멀티플렉싱', '이벤트 루프 서버 (Netty)', '가상 스레드와 네트워크 I/O'] },
      { t: '요청당 스레드 모델', deep: false,
        d: '들어온 요청(또는 연결) 하나를 스레드 하나가 처음부터 끝까지 맡아 블로킹 방식으로 처리하는 서버 구조다.',
        how: [
          '스프링 MVC + 톰캣이 대표적이다. 톰캣 커넥터가 연결을 받아 스레드 풀(`server.tomcat.threads.max`, 기본 200)의 스레드에 요청을 넘긴다.',
          '- 장점: 코드가 위에서 아래로 읽히는 순차 흐름이라 이해·디버깅이 쉽다. `ThreadLocal`, 트랜잭션, 시큐리티 컨텍스트가 자연스럽게 동작한다.',
          '- 단점: DB나 외부 API를 기다리는 동안 스레드가 묶인다. 동시에 처리할 수 있는 요청 수가 스레드 수로 제한된다.',
          '스레드가 모두 바쁘면 새 요청은 accept 큐에서 기다리고, 큐도 넘치면 거절된다.',
          '최근 톰캣은 연결 수락과 읽기 대기에는 NIO를 쓰고, 요청 처리만 워커 스레드에 넘긴다. 그래서 유휴 keep-alive 연결이 스레드를 잡아먹지는 않는다.'
        ],
        code: `# application.yml (Spring MVC + Tomcat)
server:
  tomcat:
    threads:
      max: 200          # 동시에 처리할 요청 수의 상한
      min-spare: 10
    accept-count: 100   # 스레드가 모두 바쁠 때 대기할 연결 수
    max-connections: 8192`,
        warn: ['느린 외부 API 하나 때문에 200개 스레드가 모두 기다리면 서버 전체가 멈춘 것처럼 보인다. 타임아웃과 벌크헤드로 스레드를 보호한다.'],
        rel: ['listen 백로그', 'C10K 문제', '가상 스레드와 네트워크 I/O', '이벤트 루프 서버 (Netty)'] },
      { t: 'Reactor 패턴', deep: true,
        d: '이벤트 디멀티플렉서(epoll 등)로 준비된 I/O 이벤트를 받아, 이벤트 종류에 맞는 핸들러로 나눠 주는(dispatch) 이벤트 기반 서버 설계 패턴이다.',
        why: '멀티플렉싱 루프를 그대로 짜면 연결 수락, 읽기, 쓰기, 비즈니스 로직이 한 루프에 뒤엉킨다. 이벤트를 받는 부분과 처리하는 부분을 나누면 구조가 정리되고 스레드 배치를 바꿔 가며 확장할 수 있다.',
        how: [
          '- Reactor: `select()`를 돌며 이벤트를 기다리고 알맞은 핸들러에 넘긴다.',
          '- Acceptor: 연결 수락 이벤트를 받아 새 연결을 등록하고 핸들러를 붙인다.',
          '- Handler: 읽기·쓰기 이벤트를 처리한다. 블로킹하지 않고 짧게 끝나야 한다.',
          '변형은 세 가지다.',
          '- 단일 Reactor 단일 스레드: Redis(명령 처리부). 단순하지만 CPU 코어 하나만 쓴다.',
          '- 단일 Reactor + 워커 스레드 풀: I/O는 루프가, 무거운 처리는 워커가 맡는다.',
          '- 멀티 Reactor(메인-서브): 메인 Reactor는 accept만, 서브 Reactor 여러 개가 연결을 나눠 읽기·쓰기를 맡는다. Netty(boss/worker 그룹), Nginx가 이 구조다.',
          '반대 개념인 Proactor 패턴은 비동기 I/O(IOCP, io_uring)를 써서 "완료" 이벤트를 받는다.'
        ],
        code: `Selector selector = Selector.open();
ServerSocketChannel server = ServerSocketChannel.open();
server.bind(new InetSocketAddress(8080)).configureBlocking(false);
server.register(selector, SelectionKey.OP_ACCEPT);       // Acceptor 등록

while (true) {
    selector.select();                                   // 준비될 때까지 대기 (epoll_wait)
    for (var it = selector.selectedKeys().iterator(); it.hasNext(); ) {
        SelectionKey key = it.next(); it.remove();
        if (key.isAcceptable()) {                        // 연결 수락
            SocketChannel ch = server.accept();
            ch.configureBlocking(false);
            ch.register(selector, SelectionKey.OP_READ, ByteBuffer.allocate(1024));
        } else if (key.isReadable()) {                   // 읽기 핸들러로 dispatch
            handleRead(key);
        }
    }
}`,
        qa: ['Reactor 패턴을 설명해 주세요.',
          'Reactor 패턴은 epoll 같은 이벤트 디멀티플렉서로 여러 연결의 I/O 준비 이벤트를 한 곳에서 기다리다가, 이벤트가 오면 연결 수락은 Acceptor에, 읽기와 쓰기는 각 핸들러에 나눠 주는 이벤트 기반 설계입니다. 적은 스레드로 많은 연결을 처리할 수 있고, Netty처럼 연결 수락용 boss 루프와 읽기·쓰기용 worker 루프를 나누는 멀티 Reactor 구조로 확장합니다. 핸들러가 블로킹하면 루프 전체가 멈추므로 핸들러는 짧고 논블로킹이어야 합니다.'],
        rel: ['I/O 멀티플렉싱', '이벤트 루프 서버 (Netty)', 'Java NIO'] },
      { t: '이벤트 루프 서버 (Netty)', deep: true,
        d: '적은 수의 이벤트 루프 스레드가 각자 맡은 연결들의 I/O 이벤트를 논블로킹으로 처리하는 서버로, 자바에서는 Netty가 대표이고 Spring WebFlux의 기본 서버다.',
        why: '오래 열린 연결(SSE, WebSocket, 스트리밍 응답)이나 외부 호출 대기가 많은 서비스에서는 연결마다 스레드를 묶어 두면 낭비가 크다. 이벤트 루프는 기다리는 동안 스레드를 쓰지 않으므로 같은 자원으로 훨씬 많은 동시 연결을 감당한다.',
        how: [
          '- EventLoopGroup: boss 그룹은 연결 수락, worker 그룹은 읽기·쓰기를 맡는다. worker 수는 기본 CPU 코어 수 × 2다.',
          '- EventLoop: 스레드 하나 + Selector 하나. 연결(Channel)은 생성될 때 루프 하나에 배정되고, 그 연결의 모든 이벤트는 평생 같은 스레드에서 처리된다. 그래서 채널 단위로는 락이 필요 없다.',
          '- ChannelPipeline: 디코더 → 비즈니스 핸들러 → 인코더처럼 핸들러를 사슬로 이어 이벤트를 흘려보낸다.',
          'WebFlux는 Reactor Netty 위에서 동작한다. 컨트롤러가 `Flux<String>`을 돌려주면, 데이터가 생길 때마다 같은 이벤트 루프가 응답 스트림에 써 준다. 기다리는 동안 스레드는 다른 연결을 처리한다.',
          '핵심 규칙: 이벤트 루프 스레드에서는 절대 블로킹하지 않는다. 블로킹 작업은 `Schedulers.boundedElastic()` 같은 별도 스레드 풀로 넘긴다.'
        ],
        code: `@GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> chat(@RequestParam String message) {
    return chatClient.prompt().user(message).stream().content(); // 논블로킹 스트리밍
}

// JPA(블로킹) 호출이 섞일 때는 이벤트 루프 밖으로 넘긴다
Mono<List<Faq>> faqs = Mono.fromCallable(() -> faqRepository.searchByKeyword(kw))
        .subscribeOn(Schedulers.boundedElastic());`,
        warn: [
          '이벤트 루프에서 JDBC, `Thread.sleep`, 동기 HTTP 클라이언트를 호출하면 그 루프의 모든 연결이 함께 멈춘다. BlockHound로 테스트 중에 찾아낼 수 있다.',
          'WebFlux를 쓰면서 DB가 JPA(블로킹)라면 이점이 줄어든다. R2DBC를 쓰거나 블로킹 호출을 별도 스케줄러로 격리한다.'
        ],
        qa: ['Spring MVC(톰캣)와 WebFlux(네티)의 스레드 모델 차이를 설명해 주세요.',
          'Spring MVC는 톰캣의 스레드 풀에서 요청 하나를 스레드 하나가 끝까지 블로킹으로 처리하므로, 동시에 처리할 수 있는 요청 수가 스레드 수에 묶입니다. WebFlux는 네티의 적은 수의 이벤트 루프 스레드가 논블로킹 I/O로 여러 연결을 번갈아 처리해, 외부 응답을 기다리는 동안 스레드를 반납합니다. 그래서 스트리밍이나 대기 시간이 긴 I/O가 많은 서비스에 유리하지만, 루프에서 블로킹 호출을 하면 전체가 멈추므로 드라이버까지 논블로킹이어야 효과가 있습니다.'],
        rel: ['Reactor 패턴', '요청당 스레드 모델', 'epoll', 'SSE', 'WebSocket'] }
    ]},
    { name: '자바 네트워크 I/O', items: [
      { t: 'Java NIO', deep: false,
        d: '자바 1.4에 추가된 논블로킹 I/O API로, Channel · Buffer · Selector 세 요소로 멀티플렉싱 서버를 만들 수 있게 한다.',
        how: [
          '- Channel: 양방향 연결 통로. `SocketChannel`, `ServerSocketChannel`. `configureBlocking(false)`로 논블로킹이 된다.',
          '- Buffer: 채널과 데이터를 주고받는 고정 크기 버퍼. `position`, `limit`, `capacity`로 상태를 관리하며, 쓰기 후 읽기 전에 `flip()`을 호출한다.',
          '- Selector: 여러 채널을 등록하고 준비된 것만 골라 준다. 리눅스에서는 epoll, 맥에서는 kqueue로 구현된다.',
          '- Direct Buffer: `ByteBuffer.allocateDirect()`는 힙 밖 메모리를 써서 커널과 복사를 줄인다. 할당 비용이 커서 풀로 재사용한다.',
          '기존 `java.io`는 스트림 기반·블로킹, NIO는 버퍼 기반·논블로킹 가능이다. 자바 7의 NIO.2는 `AsynchronousSocketChannel`(비동기 I/O)과 새 파일 API(`Path`, `Files`)를 더했다.',
          'API가 저수준이라 실무에서는 직접 쓰기보다 Netty, Tomcat NIO 커넥터처럼 그 위에 만든 프레임워크를 쓴다.'
        ],
        code: `ByteBuffer buf = ByteBuffer.allocate(1024);
int n = channel.read(buf);   // 채널 → 버퍼 (쓰기 모드)
buf.flip();                  // 읽기 모드로 전환: limit = position, position = 0
while (buf.hasRemaining()) channel.write(buf);
buf.clear();                 // 다시 쓰기 모드로`,
        warn: ['`flip()`을 빼먹으면 아무것도 쓰지 않거나 엉뚱한 범위를 쓴다. NIO 버그의 단골 원인이다.'],
        rel: ['I/O 멀티플렉싱', 'epoll', 'Reactor 패턴', '블로킹 · 논블로킹'] },
      { t: '가상 스레드와 네트워크 I/O', deep: false,
        d: '자바 21의 가상 스레드는 JVM이 관리하는 아주 가벼운 스레드로, 블로킹 I/O를 만나면 OS 스레드를 내려놓아 블로킹 코드 그대로 높은 동시성을 얻게 한다.',
        how: [
          '가상 스레드는 소수의 캐리어(OS) 스레드 위에 올라탄다. 소켓 `read()`처럼 블로킹 지점에 닿으면 JVM이 가상 스레드를 캐리어에서 떼어 내고(unmount), 내부적으로 논블로킹 I/O + 폴러(epoll)에 등록한다. 데이터가 오면 다시 캐리어에 올려 이어서 실행한다.',
          '- 결과: 코드는 요청당 스레드 모델처럼 순차적으로 쓰고, 실행은 이벤트 루프처럼 스레드를 아낀다.',
          '- 스레드 하나의 메모리가 수 KB라 수십만 개를 만들 수 있다. 그래서 풀로 재사용하지 않고 작업마다 새로 만든다.',
          '스프링 부트 3.2 이상에서 `spring.threads.virtual.enabled=true`를 켜면 톰캣 요청 처리와 `@Async`가 가상 스레드로 바뀐다.'
        ],
        code: `try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        executor.submit(() -> {
            // 블로킹 HTTP 호출이어도 OS 스레드는 묶이지 않는다
            return restClient.get().uri("/faq").retrieve().body(String.class);
        });
    }
}`,
        warn: [
          '`synchronized` 블록 안이나 네이티브 호출 중에 블로킹하면 캐리어 스레드에 고정(pinning)된다(자바 24부터 synchronized 고정은 해소). 오래 걸리는 구간은 `ReentrantLock`으로 바꾼다.',
          '가상 스레드는 동시성을 늘릴 뿐 뒤쪽 자원(DB 커넥션 풀)은 그대로다. 수만 개가 동시에 DB를 두드리지 않게 세마포어 등으로 제한한다.',
          'CPU 연산이 많은 작업에는 이점이 없다. 기다리는 시간이 긴 I/O 작업에 효과적이다.'
        ],
        rel: ['요청당 스레드 모델', '이벤트 루프 서버 (Netty)', 'C10K 문제', 'epoll'] }
    ]}
  ],
  must: [
    '블로킹·논블로킹은 "제어권을 언제 돌려받나", 동기·비동기는 "완료를 누가 확인하나"다. epoll 기반 I/O는 동기·논블로킹이다.',
    'epoll은 감시 목록을 커널에 한 번 등록하고 준비된 소켓만 돌려받아, select·poll의 O(n) 비용과 fd 개수 제한을 없앴다.',
    '톰캣(MVC)은 요청당 스레드, 네티(WebFlux)는 이벤트 루프다. 이벤트 루프에서는 절대 블로킹하지 않는다.',
    '가상 스레드는 블로킹 코드 그대로 높은 동시성을 주지만, DB 커넥션 같은 뒤쪽 자원 한도는 따로 지켜야 한다.'
  ]
};
