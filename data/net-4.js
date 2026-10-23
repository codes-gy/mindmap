(window.MINDMAP = window.MINDMAP || {})['net-4'] = {
  name: '실시간 통신 · 프로토콜',
  groups: [
    { name: 'HTTP/1.1의 한계', items: [
      { t: 'Keep-Alive 연결', deep: false,
        d: '하나의 TCP 연결을 여러 HTTP 요청·응답에 재사용하는 방식이다. HTTP/1.1에서는 기본으로 켜져 있다.',
        how: [
          'HTTP/1.0은 요청마다 TCP 연결을 새로 맺고 끊었다. 요청마다 3-way handshake와 TLS 핸드셰이크 비용이 들고, 짧은 연결이 많아 TIME_WAIT 소켓이 쌓였다.',
          'HTTP/1.1은 `Connection: keep-alive`를 기본값으로 바꿔, 응답이 끝나도 연결을 닫지 않고 다음 요청에 재사용한다.',
          '- 서버 설정: 유휴 연결을 얼마나 유지할지(`keepAliveTimeout`)와 한 연결로 처리할 최대 요청 수를 정한다.',
          '- 종료: 어느 쪽이든 `Connection: close` 헤더를 보내면 응답 후 연결을 닫는다.',
          '- 한계: 한 연결에서 요청은 여전히 하나씩 순서대로 처리된다. 그래서 브라우저는 도메인당 6개 정도의 연결을 동시에 연다.'
        ],
        warn: [
          '로드 밸런서와 애플리케이션 서버의 keep-alive 타임아웃이 어긋나면, 서버가 먼저 닫은 연결로 요청을 보내 502 오류가 간헐적으로 날 수 있다. 보통 뒤쪽 서버의 타임아웃을 더 길게 둔다.'
        ],
        rel: ['HOL 블로킹', 'HTTP 파이프라이닝', 'TIME_WAIT', 'HTTP/1.1'] },
      { t: 'HTTP 파이프라이닝', deep: false,
        d: '이전 응답을 기다리지 않고 같은 연결로 여러 요청을 연달아 보내는 HTTP/1.1 기능이다. 실제로는 거의 쓰이지 않았다.',
        how: [
          'Keep-Alive만 쓰면 요청 → 응답 → 요청 → 응답 순서로 왕복 지연(RTT)이 요청 수만큼 쌓인다. 파이프라이닝은 요청 1, 2, 3을 한꺼번에 보내 왕복 대기를 줄이려 했다.',
          '- 응답 순서 제약: 서버는 반드시 요청이 온 순서대로 응답해야 한다. 요청 1이 느리면 이미 준비된 응답 2, 3도 기다려야 한다(HOL 블로킹).',
          '- 호환성 문제: 중간 프록시가 파이프라이닝을 제대로 처리하지 못하는 경우가 많았다.',
          '그래서 주요 브라우저는 기본으로 꺼 두었고, 이 문제는 HTTP/2의 멀티플렉싱이 해결했다.'
        ],
        rel: ['Keep-Alive 연결', 'HOL 블로킹', '스트림 멀티플렉싱'] },
      { t: 'HOL 블로킹', deep: true,
        d: 'Head-of-Line 블로킹. 줄의 맨 앞 작업이 막히면 그 뒤의 작업들이 준비되어 있어도 모두 기다려야 하는 현상이다.',
        why: 'HTTP 버전이 1.1 → 2 → 3으로 바뀐 가장 큰 이유가 HOL 블로킹을 단계적으로 없애는 것이었기 때문에, 이 개념을 알면 프로토콜 진화의 흐름이 한 번에 이해된다.',
        how: [
          'HOL 블로킹은 두 계층에서 각각 생긴다.',
          '- HTTP 계층(HTTP/1.1): 한 연결에서 요청을 순서대로 처리하므로 앞 응답이 느리면 뒤 응답이 막힌다. 파이프라이닝을 써도 응답 순서를 지켜야 해서 같은 문제가 남는다.',
          '- TCP 계층(HTTP/2): HTTP/2는 여러 스트림을 한 TCP 연결에 섞어 보내 HTTP 계층의 HOL은 없앴다. 하지만 TCP는 바이트 순서를 보장해야 하므로 패킷 하나가 손실되면 재전송될 때까지 그 뒤의 모든 데이터를 애플리케이션에 넘기지 않는다. 다른 스트림의 데이터까지 함께 멈춘다.',
          '- 해결(HTTP/3): QUIC은 UDP 위에서 스트림마다 독립적으로 순서를 관리한다. 한 스트림의 패킷이 손실되어도 다른 스트림은 계속 진행된다.',
          '그래서 손실률이 높은 모바일 네트워크에서는 HTTP/2가 오히려 여러 연결을 쓰는 HTTP/1.1보다 느려지는 경우도 있었다.'
        ],
        code: `HTTP/1.1  연결 1개:  [요청A 느림.....][요청B][요청C]   B, C는 A가 끝날 때까지 대기
HTTP/2    연결 1개:  A1 B1 C1 A2 B2 C2 ...           스트림이 섞여 흐름 (HTTP 계층 HOL 해결)
          TCP 패킷 하나 손실 → A, B, C 모두 재전송 대기   (TCP 계층 HOL 남음)
HTTP/3    QUIC 스트림별 독립 → A 손실 시 A만 대기, B와 C는 계속 진행`,
        warn: [
          'HTTP/2가 HOL 블로킹을 "완전히" 해결했다고 답하면 틀린다. HTTP 계층만 해결했고 TCP 계층의 HOL은 남아 있다.',
          'HOL 블로킹은 네트워크만의 용어가 아니다. 큐에서 앞 작업이 막혀 뒤 작업이 기다리는 모든 상황(예: 스위치 입력 큐, 단일 소비자 메시지 큐)에 같은 이름을 쓴다.'
        ],
        qa: ['HOL 블로킹이 무엇이고, HTTP/2와 HTTP/3는 이를 어떻게 다루나요?', 'HOL 블로킹은 앞 요청이 막히면 뒤 요청이 준비되어 있어도 기다려야 하는 현상입니다. HTTP/1.1은 한 연결에서 응답을 순서대로 보내야 해서 HTTP 계층의 HOL이 생깁니다. HTTP/2는 스트림 멀티플렉싱으로 이를 없앴지만, TCP가 바이트 순서를 보장하기 때문에 패킷 하나가 손실되면 모든 스트림이 멈추는 TCP 계층의 HOL은 남았습니다. HTTP/3는 UDP 기반 QUIC에서 스트림별로 순서를 따로 관리해 이 문제까지 해결했습니다.'],
        rel: ['스트림 멀티플렉싱', 'QUIC', 'HTTP 파이프라이닝', 'TCP'] }
    ]},
    { name: 'HTTP/2 핵심 기능', items: [
      { t: '바이너리 프레이밍', deep: false,
        d: 'HTTP/2가 메시지를 텍스트가 아닌 작은 바이너리 프레임 단위로 쪼개 전송하는 방식이다.',
        how: [
          'HTTP/1.1은 줄바꿈으로 구분되는 텍스트 형식이라 파싱이 느리고 오류가 생기기 쉬웠다. HTTP/2는 메시지를 프레임이라는 바이너리 조각으로 나눈다.',
          '- 프레임 구조: 길이, 타입, 플래그, 스트림 ID가 담긴 9바이트 헤더 + 페이로드.',
          '- 주요 프레임 타입: HEADERS(헤더), DATA(본문), SETTINGS(연결 설정), WINDOW_UPDATE(흐름 제어), RST_STREAM(스트림 취소), PING, GOAWAY(연결 종료 예고).',
          '- 스트림: 하나의 요청·응답 쌍이 하나의 스트림이고, 같은 스트림 ID를 가진 프레임들이 모여 메시지가 된다.',
          '프레임마다 스트림 ID가 있기 때문에 여러 요청의 프레임을 한 연결에 섞어 보낼 수 있고, 이것이 멀티플렉싱의 기반이다. 메서드, 헤더, 상태 코드 같은 HTTP 의미는 1.1과 똑같다.'
        ],
        warn: ['바이너리라서 텔넷이나 일반 패킷 덤프로 바로 읽을 수 없다. 디버깅할 때는 브라우저 개발자 도구나 Wireshark의 HTTP/2 해석 기능을 쓴다.'],
        rel: ['스트림 멀티플렉싱', 'HPACK 헤더 압축', 'HTTP/2'] },
      { t: '스트림 멀티플렉싱', deep: true,
        d: '하나의 TCP 연결 위에서 여러 요청·응답 스트림을 프레임 단위로 섞어 동시에 주고받는 HTTP/2의 핵심 기능이다.',
        why: 'HTTP/1.1에서는 동시 요청을 위해 도메인당 여러 연결을 열고, 이미지 스프라이트나 도메인 샤딩 같은 우회 기법까지 썼다. 멀티플렉싱으로 연결 하나만으로 수십~수백 개 요청을 동시에 처리할 수 있게 되었다.',
        how: [
          '1) 클라이언트는 요청마다 새 스트림 ID(클라이언트는 홀수)를 붙여 HEADERS, DATA 프레임을 보낸다.',
          '2) 여러 스트림의 프레임이 한 연결에 번갈아(interleave) 실린다.',
          '3) 서버는 스트림 ID를 보고 프레임을 다시 메시지로 조립하고, 준비된 응답부터 순서와 관계없이 보낸다.',
          '4) 느린 응답이 있어도 다른 스트림의 응답은 먼저 도착한다(HTTP 계층 HOL 해결).',
          '5) 흐름 제어는 스트림별과 연결 전체 두 단계로 WINDOW_UPDATE 프레임을 써서 한다.',
          '- 동시 스트림 수는 `SETTINGS_MAX_CONCURRENT_STREAMS`로 제한한다(보통 100 이상).',
          '- 연결이 하나라 TCP 핸드셰이크·TLS 비용이 한 번만 들고, 혼잡 윈도우도 한 연결에서 키워 효율적이다.'
        ],
        code: `# HTTP/1.1: 연결 6개를 열어 병렬 처리 (도메인당 제한)
conn1: GET /a.js ──────▶ 응답
conn2: GET /b.css ─────▶ 응답
...

# HTTP/2: 연결 1개에 스트림을 섞어서 전송
conn1: [HEADERS s1][HEADERS s3][DATA s1][HEADERS s5][DATA s3][DATA s5]...
       s1=/a.js  s3=/b.css  s5=/c.png  -> 준비된 순서대로 응답`,
        warn: [
          'TCP 패킷 손실 시 모든 스트림이 함께 멈추는 TCP 계층 HOL 블로킹은 남아 있다.',
          'HTTP/1.1 시절의 최적화(파일 합치기, 도메인 샤딩)는 HTTP/2에서는 오히려 캐시 효율을 떨어뜨리거나 연결을 쪼개 손해일 수 있다.',
          '연결 하나에 요청이 몰리므로 L4 로드 밸런서는 요청이 아니라 연결 단위로만 분산한다. gRPC처럼 오래 유지되는 HTTP/2 연결은 L7 로드 밸런싱이 필요하다.'
        ],
        qa: ['HTTP/2의 멀티플렉싱은 HTTP/1.1과 무엇이 다른가요?', 'HTTP/1.1은 한 연결에서 요청을 하나씩 처리하기 때문에 병렬 처리를 하려면 여러 연결을 열어야 했습니다. HTTP/2는 메시지를 스트림 ID가 붙은 바이너리 프레임으로 쪼개 한 연결에 섞어 보내므로, 연결 하나로 여러 요청을 동시에 처리하고 준비된 응답부터 받을 수 있습니다. 다만 TCP 위에서 동작하기 때문에 패킷 손실 시 모든 스트림이 멈추는 TCP 계층의 HOL 블로킹은 남아 있고, 이는 HTTP/3에서 해결되었습니다.'],
        rel: ['바이너리 프레이밍', 'HOL 블로킹', 'QUIC', 'L7 로드 밸런서'] },
      { t: 'HPACK 헤더 압축', deep: false,
        d: 'HTTP/2에서 요청마다 반복되는 헤더를 테이블과 허프만 코딩으로 압축하는 방식이다.',
        how: [
          'HTTP/1.1은 매 요청마다 `User-Agent`, `Cookie`, `Accept` 같은 같은 헤더를 텍스트로 반복해서 보내 수백 바이트~수 KB가 낭비되었다.',
          '- 정적 테이블: `:method: GET`, `:status: 200`처럼 자주 쓰는 헤더 61개를 미리 번호로 정의해 두고 번호만 보낸다.',
          '- 동적 테이블: 연결 중에 한 번 보낸 헤더를 양쪽이 테이블에 저장해 두고, 다음부터는 인덱스 번호만 보낸다.',
          '- 허프만 코딩: 테이블에 없는 문자열 값은 허프만 코드로 줄여서 보낸다.',
          'HTTP/1.1 시절 TLS 압축(CRIME 공격)처럼 압축이 비밀값 추측에 악용되지 않도록, HPACK은 일반 압축 알고리즘 대신 이런 구조로 설계되었다. HTTP/3는 비슷한 방식의 QPACK을 쓴다.'
        ],
        rel: ['바이너리 프레이밍', 'HTTP/2'] },
      { t: '서버 푸시', deep: false,
        d: '클라이언트가 요청하기 전에 서버가 필요할 리소스를 미리 보내는 HTTP/2 기능이다. 현재는 사실상 폐기되었다.',
        how: [
          '클라이언트가 `index.html`을 요청하면, 서버가 그 페이지에 필요한 `style.css`를 PUSH_PROMISE 프레임으로 예고한 뒤 미리 보낸다. 왕복 한 번을 줄이려는 의도였다.',
          '- 문제점: 브라우저 캐시에 이미 있는 파일도 다시 보내 대역폭을 낭비했고, 무엇을 푸시할지 정하기 어려워 실제 성능 향상이 작았다.',
          '- 현재: 크롬은 2022년에 서버 푸시 지원을 제거했고, 대신 `103 Early Hints` 응답과 `<link rel=preload>`로 브라우저가 리소스를 미리 요청하게 한다.',
          '이름이 비슷하지만 SSE나 WebSocket 같은 "실시간 서버 푸시"와는 전혀 다른 기능이다.'
        ],
        warn: ['면접에서 "서버가 클라이언트에게 실시간 알림을 보내는 방법"으로 HTTP/2 서버 푸시를 답하면 틀린다. 실시간 알림은 SSE나 WebSocket이다.'],
        rel: ['SSE', 'WebSocket', 'HTTP/2'] }
    ]},
    { name: 'HTTP/3 · QUIC', items: [
      { t: 'QUIC', deep: true,
        d: 'UDP 위에서 신뢰성, 혼잡 제어, 암호화(TLS 1.3), 스트림 멀티플렉싱을 직접 구현한 전송 프로토콜이다. HTTP/3는 QUIC 위에서 동작한다.',
        why: 'TCP는 운영체제 커널에 구현되어 있어 개선이 매우 느리고, 패킷 손실 시 모든 스트림이 멈추는 HOL 블로킹과 TCP·TLS 핸드셰이크를 따로 하는 연결 지연 문제를 구조적으로 풀 수 없었다. 그래서 구글이 UDP 위에서 새 프로토콜을 만들었고 IETF 표준(RFC 9000)이 되었다.',
        how: [
          '- UDP 기반: 커널 수정 없이 사용자 공간 라이브러리로 구현하므로 빠르게 개선하고 배포할 수 있다. UDP라서 방화벽·NAT 장비의 TCP 전용 처리도 피한다.',
          '- 신뢰성 직접 구현: 패킷 번호, ACK, 재전송, 혼잡 제어를 QUIC이 스스로 처리한다. 재전송 패킷에는 새 번호를 붙여 RTT 측정이 정확하다.',
          '- 스트림별 독립 순서: 스트림마다 따로 순서를 관리해, 한 스트림의 손실이 다른 스트림을 막지 않는다(HOL 블로킹 해결).',
          '- 통합 핸드셰이크: 전송 연결 설정과 TLS 1.3 핸드셰이크를 한 번에 해서 첫 연결도 1-RTT, 재연결은 0-RTT로 데이터를 보낸다.',
          '- 항상 암호화: 헤더 대부분까지 암호화되어 중간 장비가 내용을 엿보거나 변조하기 어렵다.',
          '- 연결 ID: IP·포트가 아니라 연결 ID로 연결을 식별해 네트워크가 바뀌어도 연결이 유지된다.'
        ],
        code: `연결 설정 왕복 비교 (데이터를 보내기까지)
TCP + TLS 1.2 : TCP 1-RTT + TLS 2-RTT = 3-RTT
TCP + TLS 1.3 : TCP 1-RTT + TLS 1-RTT = 2-RTT
QUIC (첫 연결)   : 1-RTT  (전송 + TLS 1.3 통합)
QUIC (재연결)    : 0-RTT  (이전 세션 정보로 첫 패킷에 데이터 포함)

서버 측 광고 예시 (HTTP/2 응답 헤더로 HTTP/3 지원 알림)
Alt-Svc: h3=":443"; ma=86400`,
        warn: [
          '일부 기업 방화벽은 UDP 443을 막는다. 그래서 브라우저는 HTTP/3 연결이 실패하면 HTTP/2(TCP)로 자동으로 돌아간다.',
          '사용자 공간에서 암호화와 패킷 처리를 하므로 서버 CPU 사용량이 TCP보다 높을 수 있다.',
          '클라이언트는 처음부터 HTTP/3로 접속하지 않는다. 보통 HTTP/2로 접속한 뒤 `Alt-Svc` 헤더를 보고 다음부터 HTTP/3를 시도한다.'
        ],
        qa: ['HTTP/3는 왜 TCP 대신 UDP를 쓰나요?', 'TCP는 커널에 구현되어 있어 바꾸기 어렵고, 바이트 순서를 보장하기 때문에 패킷 하나가 손실되면 모든 스트림이 멈추는 HOL 블로킹이 생깁니다. HTTP/3는 UDP 위에 QUIC을 올려 신뢰성과 혼잡 제어를 사용자 공간에서 직접 구현하고, 스트림별로 순서를 따로 관리해 HOL 블로킹을 없앴습니다. 또 전송 연결과 TLS 1.3 핸드셰이크를 합쳐 연결 지연을 1-RTT, 재연결은 0-RTT로 줄였고, 연결 ID를 써서 와이파이에서 LTE로 바뀌어도 연결이 유지됩니다.'],
        rel: ['HOL 블로킹', '0-RTT 연결', '연결 마이그레이션', 'UDP', 'HTTP/3', 'TLS 핸드셰이크'] },
      { t: '0-RTT 연결', deep: false,
        d: '예전에 연결한 적 있는 서버에 다시 접속할 때, 핸드셰이크 응답을 기다리지 않고 첫 패킷부터 애플리케이션 데이터를 보내는 기능이다.',
        how: [
          '첫 연결에서 서버가 세션 재개용 티켓(PSK)을 준다. 다음 접속 때 클라이언트는 이 정보로 암호화 키를 미리 만들어, 첫 패킷에 HTTP 요청을 함께 실어 보낸다.',
          '- 효과: 재방문 시 왕복 지연이 0이 되어, 지연이 큰 모바일 환경에서 체감 속도가 크게 좋아진다.',
          '- TLS 1.3도 TCP 위에서 0-RTT를 지원하지만, TCP 핸드셰이크 1-RTT는 여전히 필요하다. QUIC은 이것까지 합쳐 진짜 0-RTT가 된다.'
        ],
        warn: [
          '0-RTT 데이터는 재전송 공격(replay attack)에 취약하다. 공격자가 첫 패킷을 복사해 다시 보내면 서버가 같은 요청을 두 번 처리할 수 있다.',
          '그래서 0-RTT에는 GET 같은 멱등한 요청만 허용하고, 결제·주문 같은 POST는 0-RTT로 처리하지 않는 것이 원칙이다.'
        ],
        rel: ['QUIC', '멱등성', 'TLS 핸드셰이크'] },
      { t: '연결 마이그레이션', deep: false,
        d: '클라이언트의 IP나 포트가 바뀌어도(와이파이 → LTE) 기존 QUIC 연결을 끊지 않고 이어가는 기능이다.',
        how: [
          'TCP 연결은 (출발지 IP, 출발지 포트, 목적지 IP, 목적지 포트) 4개 값으로 식별된다. 휴대폰이 와이파이에서 LTE로 바뀌면 IP가 달라져 연결이 끊기고, 처음부터 다시 연결해야 한다.',
          'QUIC은 IP·포트 대신 연결 ID로 연결을 식별한다. 주소가 바뀌어도 같은 연결 ID로 패킷을 보내면 서버는 같은 연결로 인식하고, 새 경로가 유효한지 검증(path validation)한 뒤 계속 통신한다.',
          '- 다운로드나 영상 스트리밍이 네트워크 전환 중에도 끊기지 않는다.',
          '- 추적 방지를 위해 경로가 바뀔 때 연결 ID를 새 값으로 교체할 수 있다.'
        ],
        warn: ['로드 밸런서가 IP·포트 해시로 서버를 고르면 마이그레이션 후 다른 서버로 보내질 수 있다. QUIC을 지원하는 로드 밸런서는 연결 ID 기반으로 라우팅해야 한다.'],
        rel: ['QUIC', '포트와 소켓', 'L4 로드 밸런서'] }
    ]},
    { name: '서버 → 클라이언트 전달 방식', items: [
      { t: '폴링', deep: false,
        d: '클라이언트가 일정 간격으로 서버에 "새 데이터 있어?"라고 반복해서 묻는 가장 단순한 방식이다.',
        how: [
          'HTTP는 클라이언트가 요청해야만 서버가 응답할 수 있다. 그래서 서버에 새 소식이 생겼는지 알려면 클라이언트가 주기적으로 요청을 보내야 한다.',
          '예: 5초마다 `GET /notifications?since=...`를 호출한다.',
          '- 장점: 구현이 매우 쉽고, 일반 HTTP API와 캐시·로드 밸런서를 그대로 쓴다.',
          '- 단점: 새 데이터가 없어도 요청이 계속 나가 서버와 네트워크 자원을 낭비한다. 실시간성은 폴링 간격만큼 늦어진다(최대 5초 지연).',
          '데이터가 자주 바뀌지 않고 몇 초의 지연이 괜찮은 경우(대시보드 갱신, 배치 작업 상태 확인)에 적합하다.'
        ],
        warn: ['사용자 수 × 호출 빈도만큼 요청이 생긴다. 10만 명이 1초마다 폴링하면 초당 10만 요청이 된다.'],
        rel: ['롱 폴링', 'SSE', 'WebSocket'] },
      { t: '롱 폴링', deep: false,
        d: '클라이언트의 요청을 서버가 바로 응답하지 않고, 새 데이터가 생기거나 타임아웃이 될 때까지 붙잡아 두었다가 응답하는 방식이다.',
        how: [
          '1) 클라이언트가 요청을 보낸다.',
          '2) 서버는 새 데이터가 없으면 응답하지 않고 연결을 열어 둔 채 기다린다(예: 최대 30초).',
          '3) 데이터가 생기면 즉시 응답하고, 타임아웃이면 빈 응답을 보낸다.',
          '4) 클라이언트는 응답을 받자마자 다시 요청을 보낸다.',
          '- 장점: 폴링보다 지연이 짧고 쓸데없는 요청이 적다. 일반 HTTP라서 방화벽·프록시 호환성이 좋다.',
          '- 단점: 대기하는 동안 서버 연결(스레드 기반 서버라면 스레드)을 점유한다. 메시지가 잦으면 결국 요청·응답이 계속 반복되어 폴링과 비슷해진다.',
          '스프링 MVC에서는 `DeferredResult`로 요청 스레드를 반납한 채 대기할 수 있다.'
        ],
        warn: ['로드 밸런서·프록시의 유휴 타임아웃(예: 60초)보다 서버의 대기 시간을 짧게 잡아야 중간에서 연결이 끊기지 않는다.'],
        rel: ['폴링', 'SSE', 'WebSocket'] },
      { t: 'SSE', deep: true,
        d: 'Server-Sent Events. 서버가 하나의 HTTP 응답을 끊지 않고 열어 둔 채, 이벤트가 생길 때마다 텍스트로 계속 흘려보내는 단방향 실시간 통신 방식이다.',
        why: '알림, 주식 시세, 진행률, LLM 응답 스트리밍처럼 서버 → 클라이언트 한 방향이면 충분한 경우가 많다. 이때 WebSocket보다 훨씬 단순하게 일반 HTTP 위에서 실시간 전송을 할 수 있다.',
        how: [
          '1) 클라이언트가 `EventSource`로 요청하면 서버는 `Content-Type: text/event-stream` 응답을 보내고 연결을 닫지 않는다.',
          '2) 서버는 이벤트마다 `data: ...` 줄과 빈 줄을 써서 보낸다. `event:`로 이벤트 이름, `id:`로 이벤트 번호를 붙일 수 있다.',
          '3) 연결이 끊기면 브라우저가 자동으로 재연결하고, 마지막으로 받은 id를 `Last-Event-ID` 헤더로 보내 놓친 이벤트부터 다시 받을 수 있다.',
          '- 단방향: 클라이언트 → 서버 전송은 별도의 일반 HTTP 요청으로 한다.',
          '- 텍스트만 전송한다(바이너리는 Base64 등으로 인코딩).',
          '- HTTP/1.1에서는 브라우저의 도메인당 연결 수 제한(6개)에 걸린다. HTTP/2를 쓰면 한 연결에 여러 SSE 스트림을 실을 수 있다.'
        ],
        code: `// 스프링 MVC: SseEmitter
@GetMapping(value = "/notifications/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter subscribe(@AuthenticationPrincipal User user) {
    SseEmitter emitter = new SseEmitter(60_000L);         // 타임아웃 60초
    emitters.add(user.getId(), emitter);
    emitter.onCompletion(() -> emitters.remove(user.getId(), emitter));
    emitter.onTimeout(emitter::complete);
    return emitter;
}

public void notify(Long userId, Notification n) throws IOException {
    for (SseEmitter e : emitters.get(userId)) {
        e.send(SseEmitter.event().id(n.id().toString()).name("notification").data(n));
    }
}

/* 응답 스트림 모습
id: 42
event: notification
data: {"message":"주문이 출고되었습니다"}
*/`,
        warn: [
          'Nginx 같은 리버스 프록시가 응답을 버퍼링하면 이벤트가 바로 전달되지 않는다. `X-Accel-Buffering: no` 헤더나 `proxy_buffering off`로 버퍼링을 끈다.',
          '서버가 여러 대면 이벤트가 발생한 서버와 사용자가 연결된 서버가 다를 수 있다. Redis Pub/Sub이나 메시지 큐로 모든 서버에 이벤트를 전달해야 한다.',
          '연결 수만큼 Emitter를 메모리에 들고 있으므로, 완료·타임아웃·오류 시 반드시 정리하지 않으면 메모리 누수가 생긴다.'
        ],
        qa: ['실시간 알림을 구현한다면 폴링, SSE, WebSocket 중 무엇을 고르나요?', '알림처럼 서버에서 클라이언트로만 보내면 되는 경우에는 SSE를 고르겠습니다. SSE는 일반 HTTP 위에서 동작해 구현이 단순하고, 끊기면 브라우저가 자동 재연결하며 Last-Event-ID로 놓친 이벤트도 다시 받을 수 있습니다. 채팅이나 게임처럼 양방향으로 자주 주고받아야 하면 WebSocket을, 몇 초 지연이 괜찮고 변경이 드물면 폴링을 씁니다. 서버가 여러 대일 때는 Redis Pub/Sub 등으로 모든 서버에 이벤트를 전파해야 합니다.'],
        rel: ['WebSocket', '롱 폴링', '폴링', 'WebSocket 스케일아웃'] }
    ]},
    { name: 'WebSocket', items: [
      { t: 'WebSocket', deep: true,
        d: '하나의 TCP 연결 위에서 클라이언트와 서버가 언제든 서로 메시지를 보낼 수 있는 양방향(전이중) 통신 프로토콜이다.',
        why: 'HTTP는 클라이언트가 요청해야만 서버가 응답할 수 있는 구조라, 채팅·협업 편집·게임처럼 양쪽이 수시로 데이터를 주고받는 서비스에는 맞지 않는다. 폴링은 낭비가 크고 지연이 있어, 연결을 한 번 맺고 계속 쓰는 양방향 채널이 필요했다.',
        how: [
          '1) 연결 시작은 일반 HTTP 요청이다. 클라이언트가 `Upgrade: websocket` 헤더로 프로토콜 전환을 요청한다.',
          '2) 서버가 `101 Switching Protocols`로 응답하면 그 TCP 연결은 더 이상 HTTP가 아니라 WebSocket 연결이 된다.',
          '3) 이후 양쪽은 요청·응답 구분 없이 프레임 단위로 메시지를 보낸다. 프레임 헤더가 2~14바이트로 작아 HTTP 요청보다 오버헤드가 훨씬 적다.',
          '4) 연결을 유지하는 동안 Ping/Pong 프레임으로 상대가 살아 있는지 확인한다.',
          '5) 어느 쪽이든 Close 프레임을 보내 연결을 정상 종료한다.',
          '- 주소 체계: `ws://`(평문), `wss://`(TLS 암호화). 운영에서는 항상 `wss://`를 쓴다.',
          '- 텍스트와 바이너리 메시지를 모두 보낼 수 있다.'
        ],
        code: `// 스프링: 순수 WebSocket 핸들러
@Configuration
@EnableWebSocket
public class WsConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatHandler(), "/ws/chat")
                .setAllowedOrigins("https://shop.com");   // Origin 검증
    }
}

public class ChatHandler extends TextWebSocketHandler {
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    @Override public void afterConnectionEstablished(WebSocketSession s) { sessions.add(s); }
    @Override protected void handleTextMessage(WebSocketSession s, TextMessage msg) throws IOException {
        for (WebSocketSession other : sessions) other.sendMessage(msg);   // 브로드캐스트
    }
    @Override public void afterConnectionClosed(WebSocketSession s, CloseStatus st) { sessions.remove(s); }
}`,
        warn: [
          '연결이 상태를 가지므로 서버를 여러 대로 늘리면 사용자가 서로 다른 서버에 붙어 메시지가 전달되지 않는다. 메시지 브로커로 서버 간 전파가 필요하다.',
          'WebSocket에는 CORS가 적용되지 않는다. 다른 사이트에서 사용자 쿠키로 연결하는 공격(CSWSH)을 막으려면 핸드셰이크 때 Origin 헤더를 직접 검증한다.',
          '프록시·로드 밸런서의 유휴 타임아웃 때문에 조용한 연결이 끊길 수 있다. 주기적인 Ping으로 연결을 유지하고, 클라이언트에는 재연결 로직을 둔다.',
          '자동 재연결, 메시지 유실 처리는 프로토콜이 해 주지 않는다. 애플리케이션이 직접 구현해야 한다.'
        ],
        qa: ['WebSocket은 HTTP와 무엇이 다르고, 어떻게 연결되나요?', 'HTTP는 클라이언트가 요청해야만 서버가 응답하는 단방향 요청-응답 구조이고, WebSocket은 한 번 연결하면 양쪽이 언제든 메시지를 보낼 수 있는 전이중 통신입니다. 연결은 일반 HTTP 요청에 Upgrade: websocket 헤더를 붙여 시작하고, 서버가 101 Switching Protocols로 응답하면 같은 TCP 연결이 WebSocket으로 바뀝니다. 이후에는 헤더가 작은 프레임으로 통신해 오버헤드가 적지만, 연결이 상태를 가지므로 서버 확장 시 메시지 브로커로 서버 간 전파가 필요합니다.'],
        rel: ['WebSocket 핸드셰이크', 'WebSocket 스케일아웃', 'STOMP', 'SSE'] },
      { t: 'WebSocket 핸드셰이크', deep: false,
        d: 'HTTP 요청을 WebSocket 연결로 전환하는 첫 과정으로, Upgrade 요청과 101 응답을 주고받는다.',
        how: [
          '클라이언트는 다음 헤더를 담아 GET 요청을 보낸다.',
          '- `Upgrade: websocket`, `Connection: Upgrade`: 프로토콜 전환 요청',
          '- `Sec-WebSocket-Key`: 무작위 값(Base64)',
          '- `Sec-WebSocket-Version: 13`',
          '- `Origin`: 요청한 페이지의 출처',
          '서버는 Sec-WebSocket-Key에 정해진 GUID를 붙여 SHA-1 해시 후 Base64로 만든 값을 `Sec-WebSocket-Accept`에 담아 `101 Switching Protocols`로 응답한다. 클라이언트는 이 값을 검증해 상대가 진짜 WebSocket 서버인지(캐시된 HTTP 응답이 아닌지) 확인한다.',
          '이 Accept 값은 보안 인증이 아니라 프로토콜 확인용이다. 사용자 인증은 핸드셰이크 요청의 쿠키나 토큰으로 따로 한다.'
        ],
        code: `GET /ws/chat HTTP/1.1
Host: api.shop.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://shop.com

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`,
        warn: ['브라우저 WebSocket API는 커스텀 헤더(Authorization)를 붙일 수 없다. 토큰은 쿠키, 쿼리 파라미터, 또는 연결 직후 첫 메시지로 전달하며, 쿼리 파라미터는 로그에 남을 수 있어 주의한다.'],
        rel: ['WebSocket', '동일 출처 정책'] },
      { t: 'WebSocket 프레임과 핑퐁', deep: false,
        d: 'WebSocket 메시지를 담는 작은 전송 단위인 프레임과, 연결 상태를 확인하는 Ping/Pong 제어 프레임이다.',
        how: [
          '- 프레임 헤더: FIN 비트(메시지의 마지막 조각인지), opcode(종류), 마스크 여부, 페이로드 길이. 최소 2바이트다.',
          '- opcode 종류: 텍스트(0x1), 바이너리(0x2), 이어지는 조각(0x0), Close(0x8), Ping(0x9), Pong(0xA).',
          '- 마스킹: 클라이언트 → 서버 프레임은 반드시 4바이트 키로 마스킹한다. 중간 프록시 캐시를 오염시키는 공격을 막기 위한 규칙이다.',
          '- 조각화: 큰 메시지는 여러 프레임으로 나눠 보낼 수 있다.',
          'Ping을 받은 쪽은 같은 내용의 Pong으로 답해야 한다. 서버가 주기적으로 Ping을 보내 응답이 없으면 죽은 연결로 보고 정리하며, 이 트래픽이 중간 장비의 유휴 타임아웃도 막아 준다.'
        ],
        warn: ['TCP 연결은 상대가 비정상 종료(전원 차단, 네트워크 단절)하면 한동안 살아 있는 것처럼 보인다. 애플리케이션 수준의 Ping/Pong 없이는 죽은 연결이 계속 쌓인다.'],
        rel: ['WebSocket', 'TCP'] },
      { t: 'WebSocket 스케일아웃', deep: true,
        d: 'WebSocket 서버를 여러 대로 늘릴 때, 서로 다른 서버에 연결된 사용자끼리 메시지를 주고받게 하는 문제와 그 해결 방법이다.',
        why: 'HTTP API는 무상태라 아무 서버로 보내도 되지만, WebSocket 연결은 특정 서버의 메모리에 붙어 있다. 사용자 A가 서버 1, 사용자 B가 서버 2에 연결되어 있으면 서버 1은 B에게 메시지를 직접 보낼 수 없다.',
        how: [
          '1) 메시지 브로커 도입: 모든 서버가 Redis Pub/Sub, Kafka, RabbitMQ 같은 브로커의 채널을 구독한다.',
          '2) 서버 1이 A의 메시지를 받으면 로컬 사용자에게 보내는 대신 브로커에 발행한다.',
          '3) 모든 서버가 그 메시지를 받아, 자기에게 연결된 수신자(B가 있는 서버 2)가 있으면 전달한다.',
          '4) 특정 사용자에게만 보내려면 "사용자 → 연결된 서버" 매핑을 Redis에 저장해 해당 서버로만 라우팅할 수도 있다.',
          '- 로드 밸런서: 핸드셰이크 이후 연결이 같은 서버에 유지되므로 별도의 세션 고정은 필요 없지만, Upgrade 헤더를 전달하도록 설정해야 한다(Nginx `proxy_set_header Upgrade`).',
          '- 배포: 서버를 재시작하면 연결이 모두 끊기므로, 클라이언트 재연결(지수 백오프)과 순차 배포가 필요하다.'
        ],
        code: `// STOMP + 외부 브로커 릴레이: 스프링이 메시지를 RabbitMQ로 중계해 모든 서버가 공유
@Configuration
@EnableWebSocketMessageBroker
public class StompConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableStompBrokerRelay("/topic", "/queue")   // 외부 브로커 사용
                .setRelayHost("rabbitmq").setRelayPort(61613);
        registry.setApplicationDestinationPrefixes("/app");
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins("https://shop.com");
    }
}`,
        warn: [
          'Redis Pub/Sub은 구독자가 없을 때 발행된 메시지를 저장하지 않는다(유실). 메시지 보존이 필요하면 Redis Streams나 Kafka를 쓴다.',
          '스프링의 기본 내장 브로커(`enableSimpleBroker`)는 서버 메모리 안에서만 동작해 서버가 여러 대면 메시지가 공유되지 않는다.',
          '서버 한 대당 동시 연결 수는 파일 디스크립터 한도와 메모리에 묶인다. OS의 `ulimit`과 커널 설정도 함께 조정해야 한다.'
        ],
        qa: ['채팅 서버를 여러 대로 늘리면 어떤 문제가 생기고, 어떻게 해결하나요?', 'WebSocket 연결은 특정 서버에 붙어 있어서, 서로 다른 서버에 연결된 사용자끼리는 서버가 직접 메시지를 전달할 수 없습니다. 그래서 Redis Pub/Sub이나 Kafka 같은 브로커를 두고, 메시지를 받은 서버가 브로커에 발행하면 모든 서버가 구독해 자기에게 연결된 수신자에게 전달하게 합니다. 스프링에서는 STOMP 브로커 릴레이로 RabbitMQ 같은 외부 브로커를 쓰며, 서버 재시작에 대비해 클라이언트 재연결과 메시지 유실 처리도 함께 설계합니다.'],
        rel: ['WebSocket', 'STOMP', '무상태 서버', '메시지 큐', 'Kafka'] },
      { t: 'STOMP', deep: false,
        d: 'WebSocket 위에서 쓰는 간단한 텍스트 기반 메시징 프로토콜로, 구독(SUBSCRIBE)·발행(SEND) 같은 명령과 목적지(destination)를 정의한다.',
        how: [
          '순수 WebSocket은 "메시지를 보낸다"는 기능만 있어, 채팅방 구분이나 특정 사용자 전송 같은 규칙을 직접 만들어야 한다. STOMP는 이런 메시징 규칙을 표준화한다.',
          '- 명령: CONNECT, SUBSCRIBE, UNSUBSCRIBE, SEND, MESSAGE, ACK, DISCONNECT.',
          '- 목적지: `/topic/room.1`(여러 명에게 방송), `/queue/...`(한 명에게), `/app/...`(서버의 처리 메서드로).',
          '- 스프링 연동: `@MessageMapping("/chat.send")`로 메시지를 받고, `@SendTo("/topic/room.1")`이나 `SimpMessagingTemplate`으로 구독자에게 보낸다. `convertAndSendToUser`로 특정 사용자에게 보낼 수 있다.',
          '- 브로커: 간단히는 내장 메모리 브로커, 운영에서는 RabbitMQ·ActiveMQ 같은 외부 브로커 릴레이를 쓴다.'
        ],
        code: `@Controller
public class ChatController {
    @MessageMapping("/chat.send")            // 클라이언트: SEND /app/chat.send
    @SendTo("/topic/room.1")                 // 구독자: SUBSCRIBE /topic/room.1
    public ChatMessage send(ChatMessage message) {
        return message;
    }
}`,
        warn: ['스프링 시큐리티는 HTTP 핸드셰이크만 보호한다. STOMP 메시지 단위 권한(누가 어느 방을 구독할 수 있는지)은 `ChannelInterceptor`나 메시지 보안 설정으로 따로 검사해야 한다.'],
        rel: ['WebSocket', 'WebSocket 스케일아웃', 'RabbitMQ'] }
    ]},
    { name: 'gRPC', items: [
      { t: 'gRPC', deep: true,
        d: '구글이 만든 고성능 RPC 프레임워크로, HTTP/2 위에서 Protocol Buffers로 직렬화한 메시지를 주고받으며 원격 메서드를 로컬 함수처럼 호출하게 해 준다.',
        why: 'MSA에서는 서비스끼리 초당 수많은 내부 호출을 한다. JSON + REST는 사람이 읽기 쉽지만 직렬화 크기와 비용이 크고, API 계약이 문서에만 있어 타입 불일치가 런타임에 드러난다. gRPC는 바이너리 직렬화와 코드 생성으로 빠르고 타입 안전한 서비스 간 통신을 제공한다.',
        how: [
          '1) `.proto` 파일에 서비스 메서드와 메시지 구조를 정의한다(계약 우선, contract-first).',
          '2) protoc 컴파일러가 서버용 기본 구현 클래스와 클라이언트 스텁(stub)을 여러 언어로 자동 생성한다.',
          '3) 서버는 생성된 클래스를 상속해 메서드를 구현하고, 클라이언트는 스텁의 메서드를 호출한다.',
          '4) 호출은 HTTP/2 POST 요청(`/패키지.서비스/메서드`)으로 변환되고, 본문은 Protocol Buffers 바이너리다.',
          '5) 결과는 gRPC 상태 코드(OK, NOT_FOUND, DEADLINE_EXCEEDED, UNAVAILABLE 등)와 함께 돌아온다.',
          '- HTTP/2 멀티플렉싱으로 연결 하나에서 많은 호출을 동시에 처리하고, 4가지 스트리밍 방식을 지원한다.',
          '- 데드라인(타임아웃)이 기본 개념으로 들어 있어, 호출 체인 전체에 남은 시간이 전파된다.'
        ],
        code: `// order.proto
syntax = "proto3";
service OrderService {
  rpc GetOrder (GetOrderRequest) returns (OrderReply);
}
message GetOrderRequest { int64 order_id = 1; }
message OrderReply { int64 order_id = 1; string status = 2; int64 amount = 3; }

// 서버 구현 (생성된 클래스 상속)
public class OrderGrpcService extends OrderServiceGrpc.OrderServiceImplBase {
    @Override
    public void getOrder(GetOrderRequest req, StreamObserver<OrderReply> out) {
        Order o = orderRepository.findById(req.getOrderId()).orElseThrow();
        out.onNext(OrderReply.newBuilder().setOrderId(o.getId()).setStatus(o.getStatus().name()).build());
        out.onCompleted();
    }
}

// 클라이언트: 데드라인 500ms
OrderReply reply = stub.withDeadlineAfter(500, TimeUnit.MILLISECONDS)
        .getOrder(GetOrderRequest.newBuilder().setOrderId(42).build());`,
        warn: [
          '브라우저는 HTTP/2 프레임을 직접 다룰 수 없어 gRPC를 바로 호출하지 못한다. 브라우저용으로는 gRPC-Web과 프록시(Envoy)가 필요하므로, 보통 외부 공개 API는 REST, 내부 서비스 간 통신은 gRPC로 나눈다.',
          'HTTP/2 연결을 오래 재사용하므로 L4 로드 밸런서를 쓰면 모든 요청이 한 서버로 몰린다. L7(요청 단위) 로드 밸런싱이나 클라이언트 측 로드 밸런싱이 필요하다.',
          '바이너리라 curl이나 브라우저로 쉽게 확인할 수 없다. grpcurl 같은 전용 도구와 서버 리플렉션 설정이 필요하다.'
        ],
        qa: ['gRPC가 REST보다 빠른 이유와, 언제 gRPC를 쓰나요?', 'gRPC는 JSON 대신 Protocol Buffers 바이너리로 직렬화해 메시지가 작고 직렬화가 빠르며, HTTP/2 멀티플렉싱으로 연결 하나에서 많은 호출을 동시에 처리합니다. 또 proto 파일에서 클라이언트와 서버 코드를 생성하므로 타입이 맞지 않는 문제가 컴파일 시점에 드러납니다. 그래서 호출이 많은 내부 마이크로서비스 간 통신이나 스트리밍에 쓰고, 브라우저와 외부 개발자가 쓰는 공개 API는 다루기 쉬운 REST를 주로 씁니다.'],
        rel: ['Protocol Buffers', 'gRPC 스트리밍 4종', 'gRPC vs REST', '스트림 멀티플렉싱', 'MSA'] },
      { t: 'Protocol Buffers', deep: false,
        d: '구글이 만든 언어 중립적인 바이너리 직렬화 형식으로, `.proto` 파일에 메시지 구조를 정의하고 코드 생성으로 사용한다.',
        how: [
          '- 필드 번호: 각 필드는 이름이 아니라 번호(태그)로 인코딩된다. 그래서 JSON처럼 필드 이름을 매번 보내지 않아 크기가 작다.',
          '- 가변 길이 정수(varint): 작은 숫자는 1바이트로 표현한다.',
          '- 크기와 속도: 같은 데이터를 JSON보다 보통 3~10배 작게, 더 빠르게 직렬화한다.',
          '- 스키마 진화: 새 필드는 새 번호로 추가하면 된다. 옛 클라이언트는 모르는 번호를 무시하고, 새 클라이언트는 빠진 필드를 기본값으로 읽어 앞뒤 호환이 유지된다.',
          'Kafka 메시지 직렬화(스키마 레지스트리와 함께)에도 많이 쓰인다.'
        ],
        code: `message User {
  int64  id    = 1;
  string name  = 2;
  string email = 3;
  // 4번은 삭제된 필드: 번호 재사용 금지
  reserved 4;
  repeated string roles = 5;   // 새 필드는 새 번호로 추가
}`,
        warn: [
          '이미 쓰인 필드 번호를 바꾸거나 삭제한 번호를 다른 필드에 재사용하면 기존 데이터가 엉뚱하게 해석된다. 삭제한 번호는 `reserved`로 막아 둔다.',
          'proto3에서는 기본값(0, 빈 문자열)과 "값이 없음"을 구분할 수 없다. 구분이 필요하면 `optional`이나 래퍼 타입을 쓴다.'
        ],
        rel: ['gRPC', 'gRPC vs REST'] },
      { t: 'gRPC 스트리밍 4종', deep: false,
        d: 'gRPC가 지원하는 네 가지 호출 방식으로, 요청과 응답 각각을 하나로 보낼지 스트림으로 보낼지에 따라 나뉜다.',
        how: [
          '- Unary: 요청 1개 → 응답 1개. 일반적인 함수 호출과 같다. 예: 주문 조회.',
          '- Server streaming: 요청 1개 → 응답 여러 개. 서버가 결과를 흘려보낸다. 예: 대용량 조회 결과, 실시간 시세 구독.',
          '- Client streaming: 요청 여러 개 → 응답 1개. 클라이언트가 데이터를 흘려보내고 마지막에 결과를 받는다. 예: 파일 업로드, 센서 데이터 일괄 전송.',
          '- Bidirectional streaming: 양쪽이 각자 독립적으로 메시지를 계속 주고받는다. 예: 채팅, 실시간 협업.',
          '모두 HTTP/2 스트림 하나 위에서 동작하며, proto 정의에서 `stream` 키워드로 구분한다.'
        ],
        code: `service PriceService {
  rpc GetPrice (PriceRequest) returns (Price);                       // Unary
  rpc Subscribe (PriceRequest) returns (stream Price);               // Server streaming
  rpc Upload (stream Tick) returns (UploadSummary);                  // Client streaming
  rpc Trade (stream Order) returns (stream Execution);               // Bidirectional
}`,
        warn: ['스트리밍 연결은 오래 유지되므로 데드라인, 재연결, 흐름 제어(서버가 너무 빨리 보내는 문제)를 따로 설계해야 한다.'],
        rel: ['gRPC', 'Protocol Buffers', 'WebSocket'] },
      { t: 'gRPC vs REST', deep: false,
        d: '두 방식은 경쟁 관계라기보다 용도가 다르다. 외부 공개 API는 REST, 내부 고성능 통신은 gRPC를 주로 쓴다.',
        how: [
          '- 데이터 형식: REST는 주로 JSON(사람이 읽기 쉬움), gRPC는 Protocol Buffers(작고 빠름).',
          '- 설계 관점: REST는 자원(URI)과 HTTP 메서드 중심, gRPC는 메서드 호출(동작) 중심.',
          '- 계약: REST는 OpenAPI 같은 문서를 선택적으로 두고, gRPC는 proto 파일이 곧 계약이며 코드가 생성된다.',
          '- 전송: REST는 HTTP/1.1과 2 모두 가능, gRPC는 HTTP/2 필수.',
          '- 스트리밍: REST는 기본적으로 요청-응답만, gRPC는 양방향 스트리밍 지원.',
          '- 브라우저: REST는 바로 호출 가능, gRPC는 gRPC-Web과 프록시가 필요.',
          '- 캐시·도구: REST는 HTTP 캐시, curl, 브라우저로 쉽게 다룬다. gRPC는 전용 도구가 필요하다.'
        ],
        rel: ['gRPC', 'REST 원칙', 'GraphQL'] }
    ]},
    { name: 'GraphQL', items: [
      { t: 'GraphQL', deep: false,
        d: '클라이언트가 필요한 데이터의 모양을 쿼리로 직접 지정해 한 번의 요청으로 받아 가는 API 쿼리 언어이자 런타임이다.',
        how: [
          'REST에서는 화면 하나를 그리려고 `/users/1`, `/users/1/orders`, `/products/...`를 여러 번 호출하거나(언더페칭), 필요 없는 필드까지 잔뜩 받는다(오버페칭).',
          '- 단일 엔드포인트: 보통 `POST /graphql` 하나로 모든 조회(Query)와 변경(Mutation)을 처리하고, Subscription으로 실시간 구독도 지원한다.',
          '- 스키마: 서버가 타입 시스템으로 데이터 구조를 정의하고, 클라이언트는 그 안에서 원하는 필드만 고른다.',
          '- 리졸버: 필드마다 데이터를 가져오는 함수가 있고, 서버가 쿼리 모양대로 리졸버를 호출해 결과를 조립한다.',
          '화면마다 필요한 데이터가 크게 다른 모바일·웹 클라이언트가 여럿인 서비스에 잘 맞는다. 스프링에서는 Spring for GraphQL을 쓴다.'
        ],
        code: `# 클라이언트가 필요한 필드만 요청
query {
  user(id: 1) {
    name
    orders(last: 3) { id amount status }
  }
}`,
        warn: [
          '모든 요청이 POST 한 곳으로 가서 URL 기반 HTTP 캐시를 쓰기 어렵다.',
          '클라이언트가 깊게 중첩된 쿼리를 보내 서버를 과부하시킬 수 있다. 쿼리 깊이와 복잡도 제한이 필요하다.',
          '오류도 대부분 200 응답 안의 `errors` 필드로 오므로, 상태 코드 기반 모니터링이 잘 맞지 않는다.'
        ],
        rel: ['GraphQL N+1과 DataLoader', 'gRPC vs REST', 'REST 원칙'] },
      { t: 'GraphQL N+1과 DataLoader', deep: false,
        d: 'GraphQL 리졸버가 목록의 항목마다 따로 DB를 조회해 쿼리가 폭증하는 문제와, 이를 묶어서 한 번에 조회하는 DataLoader 패턴이다.',
        how: [
          '사용자 100명을 조회한 뒤 각 사용자의 `orders` 리졸버가 따로 실행되면 주문 조회 쿼리가 100번 나간다(1 + N).',
          'DataLoader는 같은 요청 처리 중에 들어온 키(사용자 id)들을 잠시 모았다가, `WHERE user_id IN (...)` 한 번으로 조회한 뒤 결과를 각 리졸버에 나눠 준다(배칭). 같은 키를 여러 번 요청하면 캐시된 결과를 돌려준다.',
          '스프링 GraphQL에서는 `@BatchMapping`으로 이 패턴을 간단히 쓴다.'
        ],
        code: `@Controller
public class UserGraphqlController {
    // users 목록 전체의 orders를 한 번에 조회
    @BatchMapping
    public Map<User, List<Order>> orders(List<User> users) {
        List<Long> ids = users.stream().map(User::getId).toList();
        Map<Long, List<Order>> byUser = orderRepository.findByUserIdIn(ids).stream()
                .collect(Collectors.groupingBy(Order::getUserId));
        return users.stream().collect(Collectors.toMap(u -> u, u -> byUser.getOrDefault(u.getId(), List.of())));
    }
}`,
        rel: ['GraphQL'] }
    ]}
  ],
  must: [
    'HTTP/2는 HTTP 계층의 HOL 블로킹만 해결했다. TCP 계층의 HOL 블로킹은 HTTP/3(QUIC)에서 해결되었다.',
    '서버 → 클라이언트 단방향 실시간이면 SSE, 양방향이면 WebSocket, 지연이 괜찮으면 폴링부터 검토한다.',
    'WebSocket과 SSE 연결은 특정 서버에 붙는다. 서버가 여러 대면 Redis Pub/Sub이나 메시지 브로커로 이벤트를 모든 서버에 전파한다.',
    '오래 유지되는 연결(WebSocket, SSE, gRPC)은 프록시·로드 밸런서의 유휴 타임아웃과 버퍼링 설정을 함께 확인한다.',
    'gRPC는 내부 서비스 간 통신에, REST는 브라우저와 외부에 공개하는 API에 주로 쓴다.'
  ]
};
