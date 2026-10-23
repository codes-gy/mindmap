import type { Topic } from '../types';

const topic: Topic = {
  key: "net-4",
  name: "실시간 통신 · 프로토콜",
  must: [
    "HTTP/2는 HTTP 계층의 HOL 블로킹만 해결했다. TCP 계층의 HOL 블로킹은 HTTP/3(QUIC)에서 해결되었다.",
    "서버 → 클라이언트 단방향 실시간이면 SSE, 양방향이면 WebSocket, 지연이 괜찮으면 폴링부터 검토한다.",
    "WebSocket과 SSE 연결은 특정 서버에 붙는다. 서버가 여러 대면 Redis Pub/Sub이나 메시지 브로커로 이벤트를 모든 서버에 전파한다.",
    "오래 유지되는 연결(WebSocket, SSE, gRPC)은 프록시·로드 밸런서의 유휴 타임아웃과 버퍼링 설정을 함께 확인한다.",
    "gRPC는 내부 서비스 간 통신에, REST는 브라우저와 외부에 공개하는 API에 주로 쓴다."
  ],
  groups: [
    {
      name: "HTTP/1.1의 한계",
      compare: {
        cols: ["기준", "Keep-Alive 연결", "HTTP 파이프라이닝"],
        rows: [
          ["해결하려던 문제", "요청마다 연결 재수립 비용", "응답 대기로 쌓이는 왕복 지연"],
          ["동작", "연결 재사용, 요청은 하나씩", "응답 전 요청을 연달아 전송"],
          ["응답 순서", "요청 순서대로", "요청 순서대로 (강제)"],
          ["실제 사용", "HTTP/1.1 기본값", "브라우저 기본 비활성화"]
        ]
      },
      concepts: [
        {
          id: "net/keep-alive-yeongyeol",
          slug: "keep-alive-yeongyeol",
          title: "Keep-Alive 연결",
          deep: false,
          def: "하나의 TCP 연결을 여러 HTTP 요청·응답에 재사용하는 방식이다. HTTP/1.1에서는 기본으로 켜져 있다.",
          why: "요청마다 TCP와 TLS 핸드셰이크를 새로 하면 지연이 쌓이고 TIME_WAIT 소켓이 넘쳐나기 때문이다.",
          how: [
            "HTTP/1.0은 요청마다 TCP 연결을 새로 맺고 끊었다. 요청마다 3-way handshake와 TLS 핸드셰이크 비용이 들고, 짧은 연결이 많아 TIME_WAIT 소켓이 쌓였다.",
            "HTTP/1.1은 `Connection: keep-alive`를 기본값으로 바꿔, 응답이 끝나도 연결을 닫지 않고 다음 요청에 재사용한다.",
            "- 서버 설정: 유휴 연결을 얼마나 유지할지(`keepAliveTimeout`)와 한 연결로 처리할 최대 요청 수를 정한다.",
            "- 종료: 어느 쪽이든 `Connection: close` 헤더를 보내면 응답 후 연결을 닫는다.",
            "- 한계: 한 연결에서 요청은 여전히 하나씩 순서대로 처리된다. 그래서 브라우저는 도메인당 6개 정도의 연결을 동시에 연다."
          ],
          use: [
            "서버 간 HTTP 호출에서는 커넥션 풀(Apache HttpClient, OkHttp, RestClient 설정)로 Keep-Alive 연결을 재사용해 응답 시간을 줄인다.",
            "ALB·Nginx 뒤의 애플리케이션 서버는 keep-alive 타임아웃을 로드 밸런서보다 길게 잡아 간헐적 502를 막는다."
          ],
          warn: [
            "로드 밸런서와 애플리케이션 서버의 keep-alive 타임아웃이 어긋나면, 서버가 먼저 닫은 연결로 요청을 보내 502 오류가 간헐적으로 날 수 있다. 보통 뒤쪽 서버의 타임아웃을 더 길게 둔다."
          ],
          myth: [["Keep-Alive를 켜면 요청을 동시에 보낼 수 있다.", "연결만 재사용할 뿐, 한 연결에서 요청과 응답은 여전히 하나씩 순서대로 처리된다."]],
          answer: "Keep-Alive는 하나의 TCP 연결을 여러 HTTP 요청에 재사용하는 방식으로, HTTP/1.1에서는 기본으로 켜져 있습니다. 요청마다 TCP·TLS 핸드셰이크를 다시 하지 않아 지연과 서버 부담이 줄어듭니다. 다만 한 연결에서 요청을 하나씩 처리하므로 브라우저는 도메인당 여러 연결을 엽니다.",
          analogy: "전화를 걸 때마다 끊고 다시 거는 대신, 통화를 연결해 둔 채 용건을 차례로 말하는 것과 같습니다.",
          followUps: [
            [
              "Keep-Alive 연결은 언제 닫히나요?",
              "서버나 클라이언트가 `Connection: close`를 보내거나, 유휴 시간이 keep-alive 타임아웃을 넘거나, 한 연결의 최대 요청 수에 도달하면 닫힙니다. 서버는 유휴 연결이 자원을 계속 차지하지 않도록 타임아웃을 둡니다."
            ]
          ],
          related: ["net/hol-beulroking", "net/http-paipeuraining", "net/time-wait", "cs/http-1-1"]
        },
        {
          id: "net/http-paipeuraining",
          slug: "http-paipeuraining",
          title: "HTTP 파이프라이닝",
          deep: false,
          def: "이전 응답을 기다리지 않고 같은 연결로 여러 요청을 연달아 보내는 HTTP/1.1 기능이다. 실제로는 거의 쓰이지 않았다.",
          why: "응답 순서 제약 때문에 HOL 블로킹이 생겨 실패한 시도였고, 이것이 HTTP/2 멀티플렉싱의 출발점임을 알기 위해서다.",
          how: [
            "Keep-Alive만 쓰면 요청 → 응답 → 요청 → 응답 순서로 왕복 지연(RTT)이 요청 수만큼 쌓인다. 파이프라이닝은 요청 1, 2, 3을 한꺼번에 보내 왕복 대기를 줄이려 했다.",
            "- 응답 순서 제약: 서버는 반드시 요청이 온 순서대로 응답해야 한다. 요청 1이 느리면 이미 준비된 응답 2, 3도 기다려야 한다(HOL 블로킹).",
            "- 호환성 문제: 중간 프록시가 파이프라이닝을 제대로 처리하지 못하는 경우가 많았다.",
            "그래서 주요 브라우저는 기본으로 꺼 두었고, 이 문제는 HTTP/2의 멀티플렉싱이 해결했다."
          ],
          use: ["HTTP 버전 차이를 설명할 때, 파이프라이닝의 실패가 HTTP/2 멀티플렉싱이 등장한 배경이라는 흐름으로 쓰인다."],
          answer: "HTTP 파이프라이닝은 이전 응답을 기다리지 않고 같은 연결로 여러 요청을 연달아 보내는 HTTP/1.1 기능입니다. 하지만 응답은 반드시 요청 순서대로 와야 해서 앞 응답이 느리면 뒤 응답도 막히는 HOL 블로킹이 생겼습니다. 프록시 호환성 문제까지 겹쳐 브라우저에서는 거의 쓰이지 않았고, HTTP/2 멀티플렉싱이 이 문제를 해결했습니다.",
          followUps: [
            [
              "파이프라이닝과 HTTP/2 멀티플렉싱의 차이는 무엇인가요?",
              "파이프라이닝은 요청은 연달아 보내지만 응답을 요청 순서대로 받아야 해서 HOL 블로킹이 남습니다. 멀티플렉싱은 스트림 ID가 붙은 프레임으로 응답을 섞어 보내므로 준비된 응답부터 순서와 관계없이 받을 수 있습니다."
            ]
          ],
          related: ["net/keep-alive-yeongyeol", "net/hol-beulroking", "net/seuteurim-meoltipeulreksing"]
        },
        {
          id: "net/hol-beulroking",
          slug: "hol-beulroking",
          title: "HOL 블로킹",
          deep: true,
          def: "Head-of-Line 블로킹. 줄의 맨 앞 작업이 막히면 그 뒤의 작업들이 준비되어 있어도 모두 기다려야 하는 현상이다.",
          why: "HTTP 버전이 1.1 → 2 → 3으로 바뀐 가장 큰 이유가 HOL 블로킹을 단계적으로 없애는 것이었기 때문에, 이 개념을 알면 프로토콜 진화의 흐름이 한 번에 이해된다.",
          how: [
            "HOL 블로킹은 두 계층에서 각각 생긴다.",
            "- HTTP 계층(HTTP/1.1): 한 연결에서 요청을 순서대로 처리하므로 앞 응답이 느리면 뒤 응답이 막힌다. 파이프라이닝을 써도 응답 순서를 지켜야 해서 같은 문제가 남는다.",
            "- TCP 계층(HTTP/2): HTTP/2는 여러 스트림을 한 TCP 연결에 섞어 보내 HTTP 계층의 HOL은 없앴다. 하지만 TCP는 바이트 순서를 보장해야 하므로 패킷 하나가 손실되면 재전송될 때까지 그 뒤의 모든 데이터를 애플리케이션에 넘기지 않는다. 다른 스트림의 데이터까지 함께 멈춘다.",
            "- 해결(HTTP/3): QUIC은 UDP 위에서 스트림마다 독립적으로 순서를 관리한다. 한 스트림의 패킷이 손실되어도 다른 스트림은 계속 진행된다.",
            "그래서 손실률이 높은 모바일 네트워크에서는 HTTP/2가 오히려 여러 연결을 쓰는 HTTP/1.1보다 느려지는 경우도 있었다."
          ],
          flow: [
            "HTTP/1.1: 응답 순서 강제",
            "앞 응답 지연 → 뒤 응답 대기",
            "HTTP/2: 스트림 섞어 전송",
            "TCP 패킷 손실 시 전부 대기",
            "HTTP/3: 스트림별 독립 순서"
          ],
          code: "HTTP/1.1  연결 1개:  [요청A 느림.....][요청B][요청C]   B, C는 A가 끝날 때까지 대기\nHTTP/2    연결 1개:  A1 B1 C1 A2 B2 C2 ...           스트림이 섞여 흐름 (HTTP 계층 HOL 해결)\n          TCP 패킷 하나 손실 → A, B, C 모두 재전송 대기   (TCP 계층 HOL 남음)\nHTTP/3    QUIC 스트림별 독립 → A 손실 시 A만 대기, B와 C는 계속 진행",
          codeLang: "java",
          use: [
            "손실률이 높은 모바일 환경에서 HTTP/3를 켜면 체감 속도가 좋아지는 이유를 설명할 때 근거가 된다.",
            "단일 소비자 메시지 큐에서 처리가 오래 걸리는 메시지 하나가 뒤 메시지 전체를 지연시키는 문제도 같은 원리로 분석한다."
          ],
          warn: [
            "HTTP/2가 HOL 블로킹을 \"완전히\" 해결했다고 답하면 틀린다. HTTP 계층만 해결했고 TCP 계층의 HOL은 남아 있다.",
            "HOL 블로킹은 네트워크만의 용어가 아니다. 큐에서 앞 작업이 막혀 뒤 작업이 기다리는 모든 상황(예: 스위치 입력 큐, 단일 소비자 메시지 큐)에 같은 이름을 쓴다."
          ],
          myth: [
            [
              "HTTP/2가 HOL 블로킹을 완전히 해결했다.",
              "HTTP 계층의 HOL만 해결했다. TCP는 바이트 순서를 보장하므로 패킷 하나가 손실되면 모든 스트림이 재전송을 기다린다."
            ]
          ],
          answer: "HOL 블로킹은 줄의 맨 앞 작업이 막히면 뒤 작업들이 준비되어 있어도 기다려야 하는 현상입니다. HTTP/1.1은 응답 순서 때문에 HTTP 계층의 HOL이 있었고, HTTP/2는 이를 멀티플렉싱으로 해결했지만 TCP 패킷 손실 시 모든 스트림이 멈추는 TCP 계층의 HOL은 남았습니다. HTTP/3는 QUIC에서 스트림별로 순서를 관리해 이것까지 해결했습니다.",
          analogy: "마트 계산대 한 줄에서 맨 앞 손님이 결제 문제로 멈추면, 뒤의 손님은 물건 하나만 들고 있어도 기다려야 하는 것과 같습니다.",
          qa: [
            "HOL 블로킹이 무엇이고, HTTP/2와 HTTP/3는 이를 어떻게 다루나요?",
            "HOL 블로킹은 앞 요청이 막히면 뒤 요청이 준비되어 있어도 기다려야 하는 현상입니다. HTTP/1.1은 한 연결에서 응답을 순서대로 보내야 해서 HTTP 계층의 HOL이 생깁니다. HTTP/2는 스트림 멀티플렉싱으로 이를 없앴지만, TCP가 바이트 순서를 보장하기 때문에 패킷 하나가 손실되면 모든 스트림이 멈추는 TCP 계층의 HOL은 남았습니다. HTTP/3는 UDP 기반 QUIC에서 스트림별로 순서를 따로 관리해 이 문제까지 해결했습니다."
          ],
          followUps: [
            [
              "TCP 계층의 HOL 블로킹은 왜 TCP 안에서 해결할 수 없나요?",
              "TCP는 하나의 바이트 스트림만 알고 그 안에 여러 HTTP 스트림이 섞여 있다는 사실을 모릅니다. 순서 보장이 TCP의 기본 약속이라 앞 바이트가 빠지면 뒤 바이트를 애플리케이션에 넘길 수 없습니다. 그래서 스트림 개념을 전송 계층에 넣은 QUIC이 필요했습니다."
            ],
            [
              "손실이 많은 네트워크에서 HTTP/2가 HTTP/1.1보다 느릴 수 있는 이유는?",
              "HTTP/1.1은 연결을 여러 개 열기 때문에 한 연결의 손실이 다른 연결에 영향을 주지 않습니다. HTTP/2는 연결 하나에 모든 요청을 싣기 때문에 패킷 하나의 손실이 전체 요청을 멈추게 해, 손실률이 높으면 오히려 불리해질 수 있습니다."
            ]
          ],
          related: ["net/seuteurim-meoltipeulreksing", "net/quic", "net/http-paipeuraining", "net/tcp"]
        }
      ]
    },
    {
      name: "HTTP/2 핵심 기능",
      compare: {
        cols: ["개념", "해결하는 문제", "핵심 방식"],
        rows: [
          ["바이너리 프레이밍", "텍스트 파싱 비효율", "메시지를 프레임 단위로 분할"],
          ["스트림 멀티플렉싱", "HTTP 계층 HOL 블로킹", "한 연결에 여러 스트림 교차"],
          ["HPACK 헤더 압축", "반복 헤더 낭비", "정적·동적 테이블 + 허프만"],
          ["서버 푸시", "추가 요청 왕복", "요청 전 리소스 선전송(폐기됨)"]
        ]
      },
      concepts: [
        {
          id: "net/baineori-peureiming",
          slug: "baineori-peureiming",
          title: "바이너리 프레이밍",
          deep: false,
          def: "HTTP/2가 메시지를 텍스트가 아닌 작은 바이너리 프레임 단위로 쪼개 전송하는 방식이다.",
          why: "텍스트 메시지는 파싱이 느리고 한 연결에서 여러 요청을 섞어 보낼 수 없어 멀티플렉싱의 기반이 필요하기 때문이다.",
          how: [
            "HTTP/1.1은 줄바꿈으로 구분되는 텍스트 형식이라 파싱이 느리고 오류가 생기기 쉬웠다. HTTP/2는 메시지를 프레임이라는 바이너리 조각으로 나눈다.",
            "- 프레임 구조: 길이, 타입, 플래그, 스트림 ID가 담긴 9바이트 헤더 + 페이로드.",
            "- 주요 프레임 타입: HEADERS(헤더), DATA(본문), SETTINGS(연결 설정), WINDOW_UPDATE(흐름 제어), RST_STREAM(스트림 취소), PING, GOAWAY(연결 종료 예고).",
            "- 스트림: 하나의 요청·응답 쌍이 하나의 스트림이고, 같은 스트림 ID를 가진 프레임들이 모여 메시지가 된다.",
            "프레임마다 스트림 ID가 있기 때문에 여러 요청의 프레임을 한 연결에 섞어 보낼 수 있고, 이것이 멀티플렉싱의 기반이다. 메서드, 헤더, 상태 코드 같은 HTTP 의미는 1.1과 똑같다."
          ],
          use: ["HTTP/2 문제를 디버깅할 때 Wireshark나 브라우저 개발자 도구에서 HEADERS, DATA, RST_STREAM, GOAWAY 프레임을 보고 원인을 찾는다."],
          warn: ["바이너리라서 텔넷이나 일반 패킷 덤프로 바로 읽을 수 없다. 디버깅할 때는 브라우저 개발자 도구나 Wireshark의 HTTP/2 해석 기능을 쓴다."],
          answer: "바이너리 프레이밍은 HTTP/2가 메시지를 텍스트 대신 스트림 ID가 붙은 작은 바이너리 프레임으로 나눠 보내는 방식입니다. 파싱이 빠르고 정확해졌고, 프레임마다 스트림 ID가 있어 여러 요청을 한 연결에 섞어 보내는 멀티플렉싱이 가능해졌습니다. 메서드와 헤더 같은 HTTP의 의미는 1.1과 같습니다.",
          analogy: "긴 편지를 한 통으로 보내는 대신, 번호표가 붙은 엽서 여러 장으로 나눠 보내 받는 쪽이 번호로 다시 모으는 것과 같습니다.",
          followUps: [
            [
              "HTTP/2로 바꾸면 애플리케이션 코드도 바꿔야 하나요?",
              "대부분 바꿀 필요가 없습니다. 메서드, 상태 코드, 헤더 같은 HTTP 의미는 그대로이고 바이너리 변환은 서버와 클라이언트 라이브러리가 처리합니다. 다만 도메인 샤딩 같은 HTTP/1.1 시절 최적화는 걷어내는 것이 좋습니다."
            ]
          ],
          related: ["net/seuteurim-meoltipeulreksing", "net/hpack-hedeo-apchuk", "cs/http-2"]
        },
        {
          id: "net/seuteurim-meoltipeulreksing",
          slug: "seuteurim-meoltipeulreksing",
          title: "스트림 멀티플렉싱",
          deep: true,
          def: "하나의 TCP 연결 위에서 여러 요청·응답 스트림을 프레임 단위로 섞어 동시에 주고받는 HTTP/2의 핵심 기능이다.",
          why: "HTTP/1.1에서는 동시 요청을 위해 도메인당 여러 연결을 열고, 이미지 스프라이트나 도메인 샤딩 같은 우회 기법까지 썼다. 멀티플렉싱으로 연결 하나만으로 수십~수백 개 요청을 동시에 처리할 수 있게 되었다.",
          how: [
            "1) 클라이언트는 요청마다 새 스트림 ID(클라이언트는 홀수)를 붙여 HEADERS, DATA 프레임을 보낸다.",
            "2) 여러 스트림의 프레임이 한 연결에 번갈아(interleave) 실린다.",
            "3) 서버는 스트림 ID를 보고 프레임을 다시 메시지로 조립하고, 준비된 응답부터 순서와 관계없이 보낸다.",
            "4) 느린 응답이 있어도 다른 스트림의 응답은 먼저 도착한다(HTTP 계층 HOL 해결).",
            "5) 흐름 제어는 스트림별과 연결 전체 두 단계로 WINDOW_UPDATE 프레임을 써서 한다.",
            "- 동시 스트림 수는 `SETTINGS_MAX_CONCURRENT_STREAMS`로 제한한다(보통 100 이상).",
            "- 연결이 하나라 TCP 핸드셰이크·TLS 비용이 한 번만 들고, 혼잡 윈도우도 한 연결에서 키워 효율적이다."
          ],
          flow: ["요청마다 스트림 ID 부여", "프레임을 한 연결에 섞어 전송", "서버가 ID별로 메시지 조립", "준비된 응답부터 전송", "스트림별 흐름 제어 적용"],
          code: "# HTTP/1.1: 연결 6개를 열어 병렬 처리 (도메인당 제한)\nconn1: GET /a.js ──────▶ 응답\nconn2: GET /b.css ─────▶ 응답\n...\n\n# HTTP/2: 연결 1개에 스트림을 섞어서 전송\nconn1: [HEADERS s1][HEADERS s3][DATA s1][HEADERS s5][DATA s3][DATA s5]...\n       s1=/a.js  s3=/b.css  s5=/c.png  -> 준비된 순서대로 응답",
          codeLang: "java",
          use: [
            "gRPC는 HTTP/2 멀티플렉싱 덕분에 서비스 간 연결 하나로 수많은 동시 호출을 처리한다.",
            "HTTP/2 전환 후에는 파일 합치기나 도메인 샤딩을 걷어내 캐시 효율을 높인다.",
            "오래 유지되는 HTTP/2 연결은 L4 로드 밸런서에서 한 서버로 쏠리므로 L7 로드 밸런싱을 적용한다."
          ],
          warn: [
            "TCP 패킷 손실 시 모든 스트림이 함께 멈추는 TCP 계층 HOL 블로킹은 남아 있다.",
            "HTTP/1.1 시절의 최적화(파일 합치기, 도메인 샤딩)는 HTTP/2에서는 오히려 캐시 효율을 떨어뜨리거나 연결을 쪼개 손해일 수 있다.",
            "연결 하나에 요청이 몰리므로 L4 로드 밸런서는 요청이 아니라 연결 단위로만 분산한다. gRPC처럼 오래 유지되는 HTTP/2 연결은 L7 로드 밸런싱이 필요하다."
          ],
          myth: [
            [
              "멀티플렉싱이면 연결이 하나라 처리량이 줄어든다.",
              "연결 하나에서 혼잡 윈도우를 크게 키울 수 있고 핸드셰이크도 한 번이라 대부분 더 효율적이다. 손실이 아주 많은 네트워크에서만 불리해질 수 있다."
            ]
          ],
          answer: "스트림 멀티플렉싱은 HTTP/2가 하나의 TCP 연결에서 여러 요청과 응답을 프레임 단위로 섞어 동시에 주고받는 기능입니다. 준비된 응답부터 순서와 관계없이 보낼 수 있어 HTTP 계층의 HOL 블로킹이 사라지고, 연결 하나로 충분해 핸드셰이크 비용도 줄어듭니다. 다만 TCP 위에서 동작하므로 패킷 손실 시 모든 스트림이 함께 멈추는 문제는 남아 있습니다.",
          analogy: "1차선 도로에 차를 한 대씩 보내던 것을, 차마다 번호를 달아 여러 대가 번갈아 끼어들며 달리게 하고 목적지에서 번호별로 나누는 것과 같습니다.",
          qa: [
            "HTTP/2의 멀티플렉싱은 HTTP/1.1과 무엇이 다른가요?",
            "HTTP/1.1은 한 연결에서 요청을 하나씩 처리하기 때문에 병렬 처리를 하려면 여러 연결을 열어야 했습니다. HTTP/2는 메시지를 스트림 ID가 붙은 바이너리 프레임으로 쪼개 한 연결에 섞어 보내므로, 연결 하나로 여러 요청을 동시에 처리하고 준비된 응답부터 받을 수 있습니다. 다만 TCP 위에서 동작하기 때문에 패킷 손실 시 모든 스트림이 멈추는 TCP 계층의 HOL 블로킹은 남아 있고, 이는 HTTP/3에서 해결되었습니다."
          ],
          followUps: [
            [
              "HTTP/2에서 동시 스트림 수에 제한이 있나요?",
              "있습니다. 서버가 `SETTINGS_MAX_CONCURRENT_STREAMS`로 한 연결의 최대 동시 스트림 수를 알려 주고, 보통 100 이상입니다. 이를 넘는 요청은 기존 스트림이 끝날 때까지 기다리거나 새 연결을 씁니다."
            ],
            [
              "HTTP/2 흐름 제어는 TCP 흐름 제어와 무엇이 다른가요?",
              "TCP 흐름 제어는 연결 전체 단위이고, HTTP/2는 그 위에서 스트림별과 연결별로 WINDOW_UPDATE 프레임을 써서 따로 조절합니다. 그래서 한 스트림이 느리게 소비되어도 다른 스트림의 전송이 막히지 않게 할 수 있습니다."
            ]
          ],
          related: ["net/baineori-peureiming", "net/hol-beulroking", "net/quic", "net/l7-rodeu-baelreonseo"]
        },
        {
          id: "net/hpack-hedeo-apchuk",
          slug: "hpack-hedeo-apchuk",
          title: "HPACK 헤더 압축",
          deep: false,
          def: "HTTP/2에서 요청마다 반복되는 헤더를 테이블과 허프만 코딩으로 압축하는 방식이다.",
          why: "요청마다 같은 쿠키와 헤더를 텍스트로 반복 전송하면 작은 요청에서도 대역폭이 크게 낭비되기 때문이다.",
          how: [
            "HTTP/1.1은 매 요청마다 `User-Agent`, `Cookie`, `Accept` 같은 같은 헤더를 텍스트로 반복해서 보내 수백 바이트~수 KB가 낭비되었다.",
            "- 정적 테이블: `:method: GET`, `:status: 200`처럼 자주 쓰는 헤더 61개를 미리 번호로 정의해 두고 번호만 보낸다.",
            "- 동적 테이블: 연결 중에 한 번 보낸 헤더를 양쪽이 테이블에 저장해 두고, 다음부터는 인덱스 번호만 보낸다.",
            "- 허프만 코딩: 테이블에 없는 문자열 값은 허프만 코드로 줄여서 보낸다.",
            "HTTP/1.1 시절 TLS 압축(CRIME 공격)처럼 압축이 비밀값 추측에 악용되지 않도록, HPACK은 일반 압축 알고리즘 대신 이런 구조로 설계되었다. HTTP/3는 비슷한 방식의 QPACK을 쓴다."
          ],
          use: ["쿠키와 인증 토큰이 큰 서비스에서 HTTP/2로 바꾸면 요청마다 반복되던 헤더 바이트가 크게 줄어 모바일 업로드 대역폭이 절약된다."],
          answer: "HPACK은 HTTP/2에서 요청마다 반복되는 헤더를 줄이는 압축 방식입니다. 자주 쓰는 헤더는 정적 테이블 번호로, 한 번 보낸 헤더는 동적 테이블 번호로 보내고 나머지 문자열은 허프만 코딩으로 줄입니다. 일반 압축 알고리즘이 아니라 이런 구조를 쓴 이유는 CRIME 같은 압축 기반 공격을 피하기 위해서입니다.",
          followUps: [
            [
              "HTTP/3는 왜 HPACK 대신 QPACK을 쓰나요?",
              "HPACK의 동적 테이블은 프레임이 순서대로 도착한다고 가정하는데, QUIC은 스트림 간 순서를 보장하지 않습니다. 그래서 순서가 뒤바뀌어도 동작하도록 테이블 갱신을 별도 스트림으로 관리하는 QPACK을 만들었습니다."
            ]
          ],
          related: ["net/baineori-peureiming", "cs/http-2"]
        },
        {
          id: "net/seobeo-pusi",
          slug: "seobeo-pusi",
          title: "서버 푸시",
          deep: false,
          def: "클라이언트가 요청하기 전에 서버가 필요할 리소스를 미리 보내는 HTTP/2 기능이다. 현재는 사실상 폐기되었다.",
          why: "왕복을 줄이려던 시도가 캐시 중복 전송 때문에 폐기된 사례로, 대안인 preload와 103 Early Hints를 이해하기 위해서다.",
          how: [
            "클라이언트가 `index.html`을 요청하면, 서버가 그 페이지에 필요한 `style.css`를 PUSH_PROMISE 프레임으로 예고한 뒤 미리 보낸다. 왕복 한 번을 줄이려는 의도였다.",
            "- 문제점: 브라우저 캐시에 이미 있는 파일도 다시 보내 대역폭을 낭비했고, 무엇을 푸시할지 정하기 어려워 실제 성능 향상이 작았다.",
            "- 현재: 크롬은 2022년에 서버 푸시 지원을 제거했고, 대신 `103 Early Hints` 응답과 `<link rel=preload>`로 브라우저가 리소스를 미리 요청하게 한다.",
            "이름이 비슷하지만 SSE나 WebSocket 같은 \"실시간 서버 푸시\"와는 전혀 다른 기능이다."
          ],
          use: ["페이지 로딩 최적화에서는 서버 푸시 대신 `103 Early Hints` 응답과 `<link rel=preload>`로 중요한 CSS·폰트를 미리 받게 한다."],
          warn: ["면접에서 \"서버가 클라이언트에게 실시간 알림을 보내는 방법\"으로 HTTP/2 서버 푸시를 답하면 틀린다. 실시간 알림은 SSE나 WebSocket이다."],
          myth: [
            [
              "실시간 알림은 HTTP/2 서버 푸시로 구현한다.",
              "서버 푸시는 페이지 리소스를 미리 보내는 기능이고 애플리케이션이 받을 수 있는 메시지가 아니다. 실시간 알림은 SSE나 WebSocket으로 구현한다."
            ]
          ],
          answer: "HTTP/2 서버 푸시는 클라이언트가 요청하기 전에 서버가 필요할 리소스를 미리 보내는 기능입니다. 캐시에 이미 있는 파일까지 보내 낭비가 생기고 효과가 작아, 크롬은 2022년에 지원을 제거했습니다. 지금은 `103 Early Hints`와 preload로 대신하며, SSE나 WebSocket 같은 실시간 푸시와는 다른 기능입니다.",
          followUps: [
            [
              "서버 푸시가 실패한 이유는 무엇인가요?",
              "서버는 클라이언트 캐시에 무엇이 있는지 몰라 이미 있는 파일도 보내 대역폭을 낭비했고, 무엇을 언제 푸시할지 정하기가 어려워 실제 성능 향상이 작았습니다. 그래서 브라우저가 스스로 판단해 미리 요청하는 Early Hints 방식으로 바뀌었습니다."
            ]
          ],
          related: ["net/sse", "net/websocket", "cs/http-2"]
        }
      ]
    },
    {
      name: "HTTP/3 · QUIC",
      compare: {
        cols: ["개념", "해결하는 문제", "핵심 방식"],
        rows: [
          ["QUIC", "TCP 계층 HOL 블로킹", "UDP 위 스트림별 독립 전송"],
          ["0-RTT 연결", "재접속 핸드셰이크 지연", "이전 세션 키로 첫 패킷 전송"],
          ["연결 마이그레이션", "IP 변경 시 연결 끊김", "4-튜플 대신 연결 ID로 식별"]
        ]
      },
      concepts: [
        {
          id: "net/quic",
          slug: "quic",
          title: "QUIC",
          deep: true,
          def: "UDP 위에서 신뢰성, 혼잡 제어, 암호화(TLS 1.3), 스트림 멀티플렉싱을 직접 구현한 전송 프로토콜이다. HTTP/3는 QUIC 위에서 동작한다.",
          why: "TCP는 운영체제 커널에 구현되어 있어 개선이 매우 느리고, 패킷 손실 시 모든 스트림이 멈추는 HOL 블로킹과 TCP·TLS 핸드셰이크를 따로 하는 연결 지연 문제를 구조적으로 풀 수 없었다. 그래서 구글이 UDP 위에서 새 프로토콜을 만들었고 IETF 표준(RFC 9000)이 되었다.",
          how: [
            "- UDP 기반: 커널 수정 없이 사용자 공간 라이브러리로 구현하므로 빠르게 개선하고 배포할 수 있다. UDP라서 방화벽·NAT 장비의 TCP 전용 처리도 피한다.",
            "- 신뢰성 직접 구현: 패킷 번호, ACK, 재전송, 혼잡 제어를 QUIC이 스스로 처리한다. 재전송 패킷에는 새 번호를 붙여 RTT 측정이 정확하다.",
            "- 스트림별 독립 순서: 스트림마다 따로 순서를 관리해, 한 스트림의 손실이 다른 스트림을 막지 않는다(HOL 블로킹 해결).",
            "- 통합 핸드셰이크: 전송 연결 설정과 TLS 1.3 핸드셰이크를 한 번에 해서 첫 연결도 1-RTT, 재연결은 0-RTT로 데이터를 보낸다.",
            "- 항상 암호화: 헤더 대부분까지 암호화되어 중간 장비가 내용을 엿보거나 변조하기 어렵다.",
            "- 연결 ID: IP·포트가 아니라 연결 ID로 연결을 식별해 네트워크가 바뀌어도 연결이 유지된다."
          ],
          flow: ["UDP로 Initial 패킷 전송", "전송·TLS 1.3 핸드셰이크 통합", "1-RTT 후 데이터 전송", "스트림별 독립 순서 관리", "손실 시 해당 스트림만 재전송"],
          code: "연결 설정 왕복 비교 (데이터를 보내기까지)\nTCP + TLS 1.2 : TCP 1-RTT + TLS 2-RTT = 3-RTT\nTCP + TLS 1.3 : TCP 1-RTT + TLS 1-RTT = 2-RTT\nQUIC (첫 연결)   : 1-RTT  (전송 + TLS 1.3 통합)\nQUIC (재연결)    : 0-RTT  (이전 세션 정보로 첫 패킷에 데이터 포함)\n\n서버 측 광고 예시 (HTTP/2 응답 헤더로 HTTP/3 지원 알림)\nAlt-Svc: h3=\":443\"; ma=86400",
          codeLang: "java",
          use: [
            "CDN(Cloudflare, Akamai)과 구글·유튜브는 HTTP/3를 기본 제공해 모바일 사용자의 연결 지연을 줄인다.",
            "서버에서 HTTP/3를 켤 때는 UDP 443 포트를 방화벽과 로드 밸런서에서 열고, `Alt-Svc` 헤더로 지원을 알린다."
          ],
          warn: [
            "일부 기업 방화벽은 UDP 443을 막는다. 그래서 브라우저는 HTTP/3 연결이 실패하면 HTTP/2(TCP)로 자동으로 돌아간다.",
            "사용자 공간에서 암호화와 패킷 처리를 하므로 서버 CPU 사용량이 TCP보다 높을 수 있다.",
            "클라이언트는 처음부터 HTTP/3로 접속하지 않는다. 보통 HTTP/2로 접속한 뒤 `Alt-Svc` 헤더를 보고 다음부터 HTTP/3를 시도한다."
          ],
          myth: [
            [
              "UDP를 쓰니 HTTP/3는 신뢰성이 없다.",
              "QUIC이 패킷 번호, ACK, 재전송, 혼잡 제어를 직접 구현해 TCP와 같은 수준의 신뢰성을 제공한다. UDP는 단지 커널을 건드리지 않기 위한 운반 수단이다."
            ]
          ],
          answer: "QUIC은 UDP 위에서 신뢰성, 혼잡 제어, TLS 1.3 암호화, 스트림 멀티플렉싱을 직접 구현한 전송 프로토콜이고 HTTP/3가 그 위에서 동작합니다. 스트림별로 순서를 따로 관리해 TCP 계층의 HOL 블로킹을 없앴고, 전송과 TLS 핸드셰이크를 합쳐 첫 연결은 1-RTT, 재연결은 0-RTT로 줄였습니다. 연결 ID로 연결을 식별해 네트워크가 바뀌어도 연결이 유지됩니다.",
          analogy: "정해진 고속도로(TCP)를 고치기 어려우니, 일반 도로(UDP) 위에 신호 체계와 차선을 직접 깔아 새 길을 만든 것과 같습니다.",
          qa: [
            "HTTP/3는 왜 TCP 대신 UDP를 쓰나요?",
            "TCP는 커널에 구현되어 있어 바꾸기 어렵고, 바이트 순서를 보장하기 때문에 패킷 하나가 손실되면 모든 스트림이 멈추는 HOL 블로킹이 생깁니다. HTTP/3는 UDP 위에 QUIC을 올려 신뢰성과 혼잡 제어를 사용자 공간에서 직접 구현하고, 스트림별로 순서를 따로 관리해 HOL 블로킹을 없앴습니다. 또 전송 연결과 TLS 1.3 핸드셰이크를 합쳐 연결 지연을 1-RTT, 재연결은 0-RTT로 줄였고, 연결 ID를 써서 와이파이에서 LTE로 바뀌어도 연결이 유지됩니다."
          ],
          followUps: [
            [
              "HTTP/3 연결이 막히는 환경에서는 어떻게 되나요?",
              "일부 기업 방화벽은 UDP 443을 막기 때문에 HTTP/3 연결이 실패할 수 있습니다. 브라우저는 이때 HTTP/2(TCP)로 자동으로 돌아가고, 서버는 보통 HTTP/2와 HTTP/3를 함께 제공합니다."
            ],
            [
              "QUIC이 TCP보다 서버 부담이 큰 이유는?",
              "TCP는 커널과 네트워크 카드의 오프로드 기능으로 최적화되어 있지만, QUIC은 사용자 공간에서 패킷 처리와 암호화를 하므로 CPU를 더 씁니다. 그래서 대규모 서비스는 GSO 같은 커널 기능이나 전용 라이브러리로 이를 줄입니다."
            ],
            [
              "QUIC의 헤더까지 암호화하는 이유는?",
              "중간 장비가 헤더를 해석해 특정 버전 동작에 의존하면 프로토콜을 바꾸기 어려워지는 경직화(ossification)가 생깁니다. 헤더 대부분을 암호화해 중간 장비의 간섭을 막고 프로토콜을 계속 발전시킬 수 있게 했습니다."
            ]
          ],
          related: [
            "net/hol-beulroking",
            "net/0-rtt-yeongyeol",
            "net/yeongyeol-maigeureisyeon",
            "net/udp",
            "cs/http-3",
            "cs/tls-haendeusyeikeu"
          ]
        },
        {
          id: "net/0-rtt-yeongyeol",
          slug: "0-rtt-yeongyeol",
          title: "0-RTT 연결",
          deep: false,
          def: "예전에 연결한 적 있는 서버에 다시 접속할 때, 핸드셰이크 응답을 기다리지 않고 첫 패킷부터 애플리케이션 데이터를 보내는 기능이다.",
          why: "재접속할 때마다 핸드셰이크 왕복을 기다리면 지연이 큰 모바일 환경에서 첫 응답이 눈에 띄게 늦어지기 때문이다.",
          how: [
            "첫 연결에서 서버가 세션 재개용 티켓(PSK)을 준다. 다음 접속 때 클라이언트는 이 정보로 암호화 키를 미리 만들어, 첫 패킷에 HTTP 요청을 함께 실어 보낸다.",
            "- 효과: 재방문 시 왕복 지연이 0이 되어, 지연이 큰 모바일 환경에서 체감 속도가 크게 좋아진다.",
            "- TLS 1.3도 TCP 위에서 0-RTT를 지원하지만, TCP 핸드셰이크 1-RTT는 여전히 필요하다. QUIC은 이것까지 합쳐 진짜 0-RTT가 된다."
          ],
          use: ["CDN에서 0-RTT를 켤 때 POST 요청은 0-RTT로 처리하지 않도록 설정하고, 서버는 `Early-Data` 헤더가 붙은 비멱등 요청을 425로 거절한다."],
          warn: [
            "0-RTT 데이터는 재전송 공격(replay attack)에 취약하다. 공격자가 첫 패킷을 복사해 다시 보내면 서버가 같은 요청을 두 번 처리할 수 있다.",
            "그래서 0-RTT에는 GET 같은 멱등한 요청만 허용하고, 결제·주문 같은 POST는 0-RTT로 처리하지 않는 것이 원칙이다."
          ],
          answer: "0-RTT는 예전에 연결한 서버에 다시 접속할 때 이전 세션 정보로 첫 패킷부터 데이터를 보내 왕복 지연을 없애는 기능입니다. QUIC은 전송과 TLS 핸드셰이크가 합쳐져 진짜 0-RTT가 가능합니다. 다만 첫 패킷을 복사해 다시 보내는 재전송 공격에 취약해, GET 같은 멱등한 요청에만 허용합니다.",
          followUps: [
            [
              "0-RTT의 재전송 공격은 어떻게 막나요?",
              "0-RTT 데이터에는 멱등한 요청만 허용하는 것이 기본 원칙입니다. 서버는 `Early-Data: 1`이 붙은 결제·주문 요청을 `425 Too Early`로 거절해 클라이언트가 핸드셰이크 완료 후 다시 보내게 하고, 세션 티켓 재사용을 제한하는 방법도 씁니다."
            ]
          ],
          related: ["net/quic", "cs/myeokdeungseong", "cs/tls-haendeusyeikeu"]
        },
        {
          id: "net/yeongyeol-maigeureisyeon",
          slug: "yeongyeol-maigeureisyeon",
          title: "연결 마이그레이션",
          deep: false,
          def: "클라이언트의 IP나 포트가 바뀌어도(와이파이 → LTE) 기존 QUIC 연결을 끊지 않고 이어가는 기능이다.",
          why: "TCP는 와이파이에서 LTE로 바뀌어 IP가 달라지면 연결이 끊겨 처음부터 다시 연결해야 하기 때문이다.",
          how: [
            "TCP 연결은 (출발지 IP, 출발지 포트, 목적지 IP, 목적지 포트) 4개 값으로 식별된다. 휴대폰이 와이파이에서 LTE로 바뀌면 IP가 달라져 연결이 끊기고, 처음부터 다시 연결해야 한다.",
            "QUIC은 IP·포트 대신 연결 ID로 연결을 식별한다. 주소가 바뀌어도 같은 연결 ID로 패킷을 보내면 서버는 같은 연결로 인식하고, 새 경로가 유효한지 검증(path validation)한 뒤 계속 통신한다.",
            "- 다운로드나 영상 스트리밍이 네트워크 전환 중에도 끊기지 않는다.",
            "- 추적 방지를 위해 경로가 바뀔 때 연결 ID를 새 값으로 교체할 수 있다."
          ],
          use: ["영상 스트리밍이나 대용량 다운로드 앱이 이동 중 네트워크가 바뀌어도 재생과 다운로드를 끊김 없이 이어 가는 데 쓰인다."],
          warn: ["로드 밸런서가 IP·포트 해시로 서버를 고르면 마이그레이션 후 다른 서버로 보내질 수 있다. QUIC을 지원하는 로드 밸런서는 연결 ID 기반으로 라우팅해야 한다."],
          answer: "연결 마이그레이션은 휴대폰이 와이파이에서 LTE로 바뀌어 IP가 달라져도 QUIC 연결을 끊지 않고 이어 가는 기능입니다. TCP는 IP와 포트 4개 값으로 연결을 식별해 주소가 바뀌면 끊기지만, QUIC은 연결 ID로 식별하기 때문에 가능합니다. 서버는 새 경로가 유효한지 검증한 뒤 통신을 계속합니다.",
          analogy: "전화번호가 아니라 메신저 아이디로 대화하니, 폰 번호가 바뀌어도 대화방이 그대로 이어지는 것과 같습니다.",
          followUps: [
            [
              "연결 마이그레이션이 로드 밸런서에 주는 영향은?",
              "로드 밸런서가 IP와 포트 해시로 서버를 고르면 주소가 바뀐 뒤 다른 서버로 보내져 연결이 깨집니다. 그래서 QUIC을 지원하는 로드 밸런서는 연결 ID 안에 서버 정보를 넣거나 연결 ID 기반으로 라우팅합니다."
            ]
          ],
          related: ["net/quic", "net/poteuwa-soket", "net/l4-rodeu-baelreonseo"]
        }
      ]
    },
    {
      name: "서버 → 클라이언트 전달 방식",
      compare: {
        cols: ["기준", "폴링", "롱 폴링", "SSE"],
        rows: [
          ["연결 방식", "주기적으로 새 요청", "응답할 때까지 요청 유지", "응답 하나를 계속 열어 둠"],
          ["방향", "클라이언트가 묻기만", "클라이언트가 묻기만", "서버 → 클라이언트 단방향"],
          ["지연", "폴링 간격만큼", "거의 즉시", "즉시"],
          ["서버 부담", "빈 요청이 많음", "대기 연결 점유", "연결 유지, 요청은 적음"],
          ["적합한 곳", "드문 변경, 대시보드", "구형 환경의 알림", "알림, 시세, LLM 스트리밍"]
        ]
      },
      concepts: [
        {
          id: "net/polring",
          slug: "polring",
          title: "폴링",
          deep: false,
          def: "클라이언트가 일정 간격으로 서버에 \"새 데이터 있어?\"라고 반복해서 묻는 가장 단순한 방식이다.",
          why: "HTTP는 클라이언트가 요청해야만 응답할 수 있어, 서버의 새 소식을 가장 단순하게 받아 올 방법이 필요하기 때문이다.",
          how: [
            "HTTP는 클라이언트가 요청해야만 서버가 응답할 수 있다. 그래서 서버에 새 소식이 생겼는지 알려면 클라이언트가 주기적으로 요청을 보내야 한다.",
            "예: 5초마다 `GET /notifications?since=...`를 호출한다.",
            "- 장점: 구현이 매우 쉽고, 일반 HTTP API와 캐시·로드 밸런서를 그대로 쓴다.",
            "- 단점: 새 데이터가 없어도 요청이 계속 나가 서버와 네트워크 자원을 낭비한다. 실시간성은 폴링 간격만큼 늦어진다(최대 5초 지연).",
            "데이터가 자주 바뀌지 않고 몇 초의 지연이 괜찮은 경우(대시보드 갱신, 배치 작업 상태 확인)에 적합하다."
          ],
          use: [
            "배치 작업이나 동영상 인코딩처럼 오래 걸리는 작업의 진행 상태를 `GET /jobs/{id}`로 몇 초마다 확인한다.",
            "결제 대기 화면에서 PG사 결과를 짧은 기간 동안만 폴링하고, 일정 시간 후 중단한다."
          ],
          warn: ["사용자 수 × 호출 빈도만큼 요청이 생긴다. 10만 명이 1초마다 폴링하면 초당 10만 요청이 된다."],
          answer: "폴링은 클라이언트가 일정 간격으로 서버에 새 데이터가 있는지 반복해서 묻는 가장 단순한 방식입니다. 일반 HTTP API를 그대로 쓸 수 있어 구현이 쉽지만, 새 데이터가 없어도 요청이 계속 나가 자원이 낭비되고 간격만큼 지연이 생깁니다. 변경이 드물고 몇 초 지연이 괜찮은 대시보드 같은 곳에 적합합니다.",
          followUps: [
            [
              "폴링의 서버 부담은 어떻게 줄이나요?",
              "간격을 늘리거나 결과가 없을수록 간격을 늘리는 백오프를 쓰고, `ETag`와 304 응답으로 변경이 없으면 본문 없이 답합니다. 사용자가 많고 실시간성이 중요해지면 SSE나 WebSocket으로 바꿉니다."
            ]
          ],
          related: ["net/rong-polring", "net/sse", "net/websocket"]
        },
        {
          id: "net/rong-polring",
          slug: "rong-polring",
          title: "롱 폴링",
          deep: false,
          def: "클라이언트의 요청을 서버가 바로 응답하지 않고, 새 데이터가 생기거나 타임아웃이 될 때까지 붙잡아 두었다가 응답하는 방식이다.",
          why: "짧은 폴링은 대부분 빈 응답으로 요청을 낭비하고, 새 데이터가 생겨도 다음 주기까지 늦게 알게 되기 때문이다.",
          how: [
            "1) 클라이언트가 요청을 보낸다.",
            "2) 서버는 새 데이터가 없으면 응답하지 않고 연결을 열어 둔 채 기다린다(예: 최대 30초).",
            "3) 데이터가 생기면 즉시 응답하고, 타임아웃이면 빈 응답을 보낸다.",
            "4) 클라이언트는 응답을 받자마자 다시 요청을 보낸다.",
            "- 장점: 폴링보다 지연이 짧고 쓸데없는 요청이 적다. 일반 HTTP라서 방화벽·프록시 호환성이 좋다.",
            "- 단점: 대기하는 동안 서버 연결(스레드 기반 서버라면 스레드)을 점유한다. 메시지가 잦으면 결국 요청·응답이 계속 반복되어 폴링과 비슷해진다.",
            "스프링 MVC에서는 `DeferredResult`로 요청 스레드를 반납한 채 대기할 수 있다."
          ],
          flow: ["클라이언트가 요청 전송", "서버가 응답 없이 대기", "데이터 발생 시 즉시 응답", "타임아웃이면 빈 응답", "클라이언트가 바로 재요청"],
          use: ["SSE와 WebSocket을 쓰기 어려운 구형 프록시 환경에서 채팅·알림의 대안으로 쓰이고, 일부 설정 서버는 변경 감지에 롱 폴링을 쓴다."],
          warn: ["로드 밸런서·프록시의 유휴 타임아웃(예: 60초)보다 서버의 대기 시간을 짧게 잡아야 중간에서 연결이 끊기지 않는다."],
          answer: "롱 폴링은 서버가 요청을 바로 응답하지 않고 새 데이터가 생기거나 타임아웃이 될 때까지 붙잡아 두었다가 응답하는 방식입니다. 클라이언트는 응답을 받자마자 다시 요청하므로 폴링보다 지연과 빈 요청이 적고, 일반 HTTP라 호환성이 좋습니다. 대신 대기하는 동안 연결과 스레드를 점유하므로, 스프링 MVC에서는 `DeferredResult`로 요청 스레드를 반납한 채 기다립니다.",
          followUps: [
            [
              "스프링 MVC에서 롱 폴링을 구현할 때 스레드 고갈은 어떻게 피하나요?",
              "`DeferredResult`나 `Callable`을 반환하면 톰캣 요청 스레드는 바로 풀로 돌아가고, 결과가 준비될 때 다른 스레드가 응답을 완료합니다. 그래서 대기 중인 요청이 많아도 요청 스레드 수에 묶이지 않습니다."
            ]
          ],
          related: ["net/polring", "net/sse", "net/websocket"]
        },
        {
          id: "net/sse",
          slug: "sse",
          title: "SSE",
          deep: true,
          def: "Server-Sent Events. 서버가 하나의 HTTP 응답을 끊지 않고 열어 둔 채, 이벤트가 생길 때마다 텍스트로 계속 흘려보내는 단방향 실시간 통신 방식이다.",
          why: "알림, 주식 시세, 진행률, LLM 응답 스트리밍처럼 서버 → 클라이언트 한 방향이면 충분한 경우가 많다. 이때 WebSocket보다 훨씬 단순하게 일반 HTTP 위에서 실시간 전송을 할 수 있다.",
          how: [
            "1) 클라이언트가 `EventSource`로 요청하면 서버는 `Content-Type: text/event-stream` 응답을 보내고 연결을 닫지 않는다.",
            "2) 서버는 이벤트마다 `data: ...` 줄과 빈 줄을 써서 보낸다. `event:`로 이벤트 이름, `id:`로 이벤트 번호를 붙일 수 있다.",
            "3) 연결이 끊기면 브라우저가 자동으로 재연결하고, 마지막으로 받은 id를 `Last-Event-ID` 헤더로 보내 놓친 이벤트부터 다시 받을 수 있다.",
            "- 단방향: 클라이언트 → 서버 전송은 별도의 일반 HTTP 요청으로 한다.",
            "- 텍스트만 전송한다(바이너리는 Base64 등으로 인코딩).",
            "- HTTP/1.1에서는 브라우저의 도메인당 연결 수 제한(6개)에 걸린다. HTTP/2를 쓰면 한 연결에 여러 SSE 스트림을 실을 수 있다."
          ],
          flow: [
            "EventSource로 구독 요청",
            "text/event-stream 응답 유지",
            "이벤트마다 data 줄 전송",
            "끊기면 자동 재연결",
            "Last-Event-ID로 이어 받기"
          ],
          code: "// 스프링 MVC: SseEmitter\n@GetMapping(value = \"/notifications/stream\", produces = MediaType.TEXT_EVENT_STREAM_VALUE)\npublic SseEmitter subscribe(@AuthenticationPrincipal User user) {\n    SseEmitter emitter = new SseEmitter(60_000L);         // 타임아웃 60초\n    emitters.add(user.getId(), emitter);\n    emitter.onCompletion(() -> emitters.remove(user.getId(), emitter));\n    emitter.onTimeout(emitter::complete);\n    return emitter;\n}\n\npublic void notify(Long userId, Notification n) throws IOException {\n    for (SseEmitter e : emitters.get(userId)) {\n        e.send(SseEmitter.event().id(n.id().toString()).name(\"notification\").data(n));\n    }\n}\n\n/* 응답 스트림 모습\nid: 42\nevent: notification\ndata: {\"message\":\"주문이 출고되었습니다\"}\n*/",
          codeLang: "java",
          use: [
            "주문 상태, 알림 배지처럼 서버에서 사용자에게 밀어 주는 기능을 스프링 `SseEmitter`로 구현한다.",
            "ChatGPT 같은 LLM 서비스는 생성되는 토큰을 SSE로 스트리밍해 답변이 타이핑되듯 보이게 한다.",
            "서버가 여러 대면 Redis Pub/Sub으로 이벤트를 모든 서버에 전파한 뒤 각자 연결된 사용자에게 보낸다."
          ],
          warn: [
            "Nginx 같은 리버스 프록시가 응답을 버퍼링하면 이벤트가 바로 전달되지 않는다. `X-Accel-Buffering: no` 헤더나 `proxy_buffering off`로 버퍼링을 끈다.",
            "서버가 여러 대면 이벤트가 발생한 서버와 사용자가 연결된 서버가 다를 수 있다. Redis Pub/Sub이나 메시지 큐로 모든 서버에 이벤트를 전달해야 한다.",
            "연결 수만큼 Emitter를 메모리에 들고 있으므로, 완료·타임아웃·오류 시 반드시 정리하지 않으면 메모리 누수가 생긴다."
          ],
          myth: [
            [
              "SSE는 WebSocket의 하위 호환용 기술이라 쓸 일이 없다.",
              "단방향이면 SSE가 더 단순하고, HTTP 인프라(인증, 프록시, HTTP/2)를 그대로 쓰며 자동 재연결까지 제공한다. 요즘 LLM 스트리밍의 표준 방식이기도 하다."
            ]
          ],
          answer: "SSE는 서버가 하나의 HTTP 응답을 열어 둔 채 이벤트가 생길 때마다 텍스트로 흘려보내는 단방향 실시간 통신입니다. 일반 HTTP 위에서 동작해 구현이 단순하고, 끊기면 브라우저가 자동 재연결하며 `Last-Event-ID`로 놓친 이벤트부터 다시 받습니다. 알림처럼 서버에서 클라이언트로만 보내면 될 때 WebSocket보다 먼저 고려합니다.",
          analogy: "라디오 방송처럼 방송국이 계속 송출하고 청취자는 듣기만 하며, 신호가 끊기면 다시 주파수를 맞추는 것과 같습니다.",
          qa: [
            "실시간 알림을 구현한다면 폴링, SSE, WebSocket 중 무엇을 고르나요?",
            "알림처럼 서버에서 클라이언트로만 보내면 되는 경우에는 SSE를 고르겠습니다. SSE는 일반 HTTP 위에서 동작해 구현이 단순하고, 끊기면 브라우저가 자동 재연결하며 Last-Event-ID로 놓친 이벤트도 다시 받을 수 있습니다. 채팅이나 게임처럼 양방향으로 자주 주고받아야 하면 WebSocket을, 몇 초 지연이 괜찮고 변경이 드물면 폴링을 씁니다. 서버가 여러 대일 때는 Redis Pub/Sub 등으로 모든 서버에 이벤트를 전파해야 합니다."
          ],
          followUps: [
            [
              "SSE 연결이 Nginx 뒤에서 이벤트가 늦게 도착하는 이유는?",
              "Nginx가 응답을 버퍼에 모았다가 보내기 때문입니다. `proxy_buffering off`나 응답 헤더 `X-Accel-Buffering: no`로 버퍼링을 끄고, 유휴 타임아웃보다 짧은 주기로 주석 줄 같은 하트비트를 보내 연결을 유지합니다."
            ],
            [
              "HTTP/1.1에서 SSE를 여러 탭에서 열면 생기는 문제는?",
              "브라우저는 HTTP/1.1에서 도메인당 동시 연결을 6개 정도로 제한해, 탭마다 SSE를 열면 다른 요청이 막힐 수 있습니다. HTTP/2를 쓰면 한 연결에 여러 스트림을 실어 해결되고, 탭 간에 연결 하나를 공유하는 방법도 있습니다."
            ],
            [
              "SseEmitter를 쓸 때 메모리 누수는 어떻게 막나요?",
              "연결마다 SseEmitter 객체를 컬렉션에 보관하므로 완료, 타임아웃, 오류 콜백에서 반드시 제거해야 합니다. 전송 중 `IOException`이 나면 끊긴 연결로 보고 즉시 정리합니다."
            ]
          ],
          related: ["net/websocket", "net/rong-polring", "net/polring", "net/websocket-seukeilaut"]
        }
      ]
    },
    {
      name: "WebSocket",
      compare: {
        cols: ["개념", "역할", "핵심 내용"],
        rows: [
          ["WebSocket", "양방향 통신 프로토콜", "한 TCP 연결로 전이중 통신"],
          ["WebSocket 핸드셰이크", "연결 수립", "`Upgrade` 요청 → 101 응답"],
          ["WebSocket 프레임과 핑퐁", "전송 단위·상태 확인", "데이터 프레임 + Ping/Pong"],
          ["WebSocket 스케일아웃", "다중 서버 확장", "Redis Pub/Sub, 브로커로 중계"],
          ["STOMP", "상위 메시징 프로토콜", "SUBSCRIBE/SEND와 destination"]
        ]
      },
      concepts: [
        {
          id: "net/websocket",
          slug: "websocket",
          title: "WebSocket",
          deep: true,
          def: "하나의 TCP 연결 위에서 클라이언트와 서버가 언제든 서로 메시지를 보낼 수 있는 양방향(전이중) 통신 프로토콜이다.",
          why: "HTTP는 클라이언트가 요청해야만 서버가 응답할 수 있는 구조라, 채팅·협업 편집·게임처럼 양쪽이 수시로 데이터를 주고받는 서비스에는 맞지 않는다. 폴링은 낭비가 크고 지연이 있어, 연결을 한 번 맺고 계속 쓰는 양방향 채널이 필요했다.",
          how: [
            "1) 연결 시작은 일반 HTTP 요청이다. 클라이언트가 `Upgrade: websocket` 헤더로 프로토콜 전환을 요청한다.",
            "2) 서버가 `101 Switching Protocols`로 응답하면 그 TCP 연결은 더 이상 HTTP가 아니라 WebSocket 연결이 된다.",
            "3) 이후 양쪽은 요청·응답 구분 없이 프레임 단위로 메시지를 보낸다. 프레임 헤더가 2~14바이트로 작아 HTTP 요청보다 오버헤드가 훨씬 적다.",
            "4) 연결을 유지하는 동안 Ping/Pong 프레임으로 상대가 살아 있는지 확인한다.",
            "5) 어느 쪽이든 Close 프레임을 보내 연결을 정상 종료한다.",
            "- 주소 체계: `ws://`(평문), `wss://`(TLS 암호화). 운영에서는 항상 `wss://`를 쓴다.",
            "- 텍스트와 바이너리 메시지를 모두 보낼 수 있다."
          ],
          flow: ["HTTP GET + Upgrade 요청", "서버 101 응답", "프레임으로 양방향 통신", "Ping/Pong으로 생존 확인", "Close 프레임으로 종료"],
          code: "// 스프링: 순수 WebSocket 핸들러\n@Configuration\n@EnableWebSocket\npublic class WsConfig implements WebSocketConfigurer {\n    @Override\n    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {\n        registry.addHandler(new ChatHandler(), \"/ws/chat\")\n                .setAllowedOrigins(\"https://shop.com\");   // Origin 검증\n    }\n}\n\npublic class ChatHandler extends TextWebSocketHandler {\n    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();\n    @Override public void afterConnectionEstablished(WebSocketSession s) { sessions.add(s); }\n    @Override protected void handleTextMessage(WebSocketSession s, TextMessage msg) throws IOException {\n        for (WebSocketSession other : sessions) other.sendMessage(msg);   // 브로드캐스트\n    }\n    @Override public void afterConnectionClosed(WebSocketSession s, CloseStatus st) { sessions.remove(s); }\n}",
          codeLang: "java",
          use: [
            "채팅, 실시간 협업 편집(구글 독스류), 온라인 게임, 거래소 호가창처럼 양쪽이 자주 주고받는 기능에 쓴다.",
            "스프링에서는 STOMP와 외부 브로커 릴레이로 채팅방 구독과 다중 서버 메시지 전파를 구현한다."
          ],
          warn: [
            "연결이 상태를 가지므로 서버를 여러 대로 늘리면 사용자가 서로 다른 서버에 붙어 메시지가 전달되지 않는다. 메시지 브로커로 서버 간 전파가 필요하다.",
            "WebSocket에는 CORS가 적용되지 않는다. 다른 사이트에서 사용자 쿠키로 연결하는 공격(CSWSH)을 막으려면 핸드셰이크 때 Origin 헤더를 직접 검증한다.",
            "프록시·로드 밸런서의 유휴 타임아웃 때문에 조용한 연결이 끊길 수 있다. 주기적인 Ping으로 연결을 유지하고, 클라이언트에는 재연결 로직을 둔다.",
            "자동 재연결, 메시지 유실 처리는 프로토콜이 해 주지 않는다. 애플리케이션이 직접 구현해야 한다."
          ],
          myth: [
            [
              "실시간이 필요하면 무조건 WebSocket을 쓴다.",
              "서버에서 클라이언트로만 보내면 SSE가 더 단순하고, 변경이 드물면 폴링으로 충분하다. WebSocket은 양방향이 자주 필요할 때 선택한다."
            ]
          ],
          answer: "WebSocket은 한 번 연결하면 클라이언트와 서버가 언제든 서로 메시지를 보낼 수 있는 양방향 통신 프로토콜입니다. 일반 HTTP 요청에 `Upgrade: websocket`을 붙여 시작하고, 서버가 101로 응답하면 같은 TCP 연결이 WebSocket으로 바뀝니다. 프레임 오버헤드가 작아 채팅·게임·협업 편집에 쓰이지만, 연결이 상태를 가져 서버 확장 시 메시지 브로커가 필요합니다.",
          analogy: "편지를 주고받는 대신 전화를 연결해 두고 양쪽이 아무 때나 말하는 것과 같습니다.",
          qa: [
            "WebSocket은 HTTP와 무엇이 다르고, 어떻게 연결되나요?",
            "HTTP는 클라이언트가 요청해야만 서버가 응답하는 단방향 요청-응답 구조이고, WebSocket은 한 번 연결하면 양쪽이 언제든 메시지를 보낼 수 있는 전이중 통신입니다. 연결은 일반 HTTP 요청에 Upgrade: websocket 헤더를 붙여 시작하고, 서버가 101 Switching Protocols로 응답하면 같은 TCP 연결이 WebSocket으로 바뀝니다. 이후에는 헤더가 작은 프레임으로 통신해 오버헤드가 적지만, 연결이 상태를 가지므로 서버 확장 시 메시지 브로커로 서버 간 전파가 필요합니다."
          ],
          followUps: [
            [
              "WebSocket 연결의 인증은 어떻게 하나요?",
              "브라우저 WebSocket API는 Authorization 헤더를 붙일 수 없어서, 핸드셰이크 때 쿠키 세션을 쓰거나 토큰을 쿼리 파라미터나 연결 직후 첫 메시지로 보냅니다. 쿼리 파라미터는 로그에 남을 수 있어 짧은 수명의 일회용 토큰을 씁니다. 또 CORS가 적용되지 않으므로 Origin 헤더를 직접 검증합니다."
            ],
            [
              "WebSocket 연결이 갑자기 끊기는 흔한 원인은?",
              "로드 밸런서나 프록시의 유휴 타임아웃이 가장 흔합니다. 주기적인 Ping/Pong으로 연결에 트래픽을 흘리고, 클라이언트에는 지수 백오프 재연결 로직을 두며, 배포 시 연결이 끊기는 것도 대비합니다."
            ],
            [
              "서버 한 대가 유지할 수 있는 WebSocket 연결 수를 결정하는 요소는?",
              "연결마다 소켓 파일 디스크립터와 버퍼 메모리를 쓰므로 OS의 `ulimit`, 커널 설정, 힙 메모리가 한계를 정합니다. 스레드 기반 블로킹 처리면 스레드 수도 영향을 주어, 대규모 연결에는 논블로킹 서버나 가상 스레드를 씁니다."
            ]
          ],
          related: ["net/websocket-haendeusyeikeu", "net/websocket-seukeilaut", "net/stomp", "net/sse"]
        },
        {
          id: "net/websocket-haendeusyeikeu",
          slug: "websocket-haendeusyeikeu",
          title: "WebSocket 핸드셰이크",
          deep: false,
          def: "HTTP 요청을 WebSocket 연결로 전환하는 첫 과정으로, Upgrade 요청과 101 응답을 주고받는다.",
          why: "기존 HTTP 포트와 인프라를 그대로 쓰면서 양방향 연결로 전환하기 위해서다.",
          how: [
            "클라이언트는 다음 헤더를 담아 GET 요청을 보낸다.",
            "- `Upgrade: websocket`, `Connection: Upgrade`: 프로토콜 전환 요청",
            "- `Sec-WebSocket-Key`: 무작위 값(Base64)",
            "- `Sec-WebSocket-Version: 13`",
            "- `Origin`: 요청한 페이지의 출처",
            "서버는 Sec-WebSocket-Key에 정해진 GUID를 붙여 SHA-1 해시 후 Base64로 만든 값을 `Sec-WebSocket-Accept`에 담아 `101 Switching Protocols`로 응답한다. 클라이언트는 이 값을 검증해 상대가 진짜 WebSocket 서버인지(캐시된 HTTP 응답이 아닌지) 확인한다.",
            "이 Accept 값은 보안 인증이 아니라 프로토콜 확인용이다. 사용자 인증은 핸드셰이크 요청의 쿠키나 토큰으로 따로 한다."
          ],
          flow: [
            "Upgrade 헤더로 GET 요청",
            "Sec-WebSocket-Key 전송",
            "서버가 Accept 값 계산",
            "101 Switching Protocols",
            "같은 연결이 WebSocket 됨"
          ],
          code: "GET /ws/chat HTTP/1.1\nHost: api.shop.com\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\nSec-WebSocket-Version: 13\nOrigin: https://shop.com\n\nHTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=",
          codeLang: "java",
          use: [
            "Nginx 뒤에 WebSocket 서버를 둘 때 `proxy_set_header Upgrade $http_upgrade`와 `Connection \"upgrade\"`를 설정해야 핸드셰이크가 전달된다."
          ],
          warn: [
            "브라우저 WebSocket API는 커스텀 헤더(Authorization)를 붙일 수 없다. 토큰은 쿠키, 쿼리 파라미터, 또는 연결 직후 첫 메시지로 전달하며, 쿼리 파라미터는 로그에 남을 수 있어 주의한다."
          ],
          myth: [
            [
              "Sec-WebSocket-Accept 검증이 보안 인증이다.",
              "캐시된 HTTP 응답이나 WebSocket을 모르는 서버를 걸러 내는 프로토콜 확인일 뿐이다. 인증과 Origin 검증은 별도로 해야 한다."
            ]
          ],
          answer: "WebSocket 핸드셰이크는 HTTP 요청을 WebSocket 연결로 바꾸는 첫 단계입니다. 클라이언트가 `Upgrade: websocket`과 무작위 `Sec-WebSocket-Key`를 보내면, 서버가 그 키로 계산한 `Sec-WebSocket-Accept`를 담아 `101 Switching Protocols`로 응답합니다. 이 값은 상대가 진짜 WebSocket 서버인지 확인하는 용도이고, 사용자 인증은 쿠키나 토큰으로 따로 합니다.",
          followUps: [
            [
              "WebSocket에서 CSWSH 공격이란 무엇이고 어떻게 막나요?",
              "Cross-Site WebSocket Hijacking은 악성 사이트가 사용자 브라우저의 쿠키로 우리 WebSocket에 연결해 데이터를 가로채는 공격입니다. WebSocket에는 CORS가 적용되지 않으므로 핸드셰이크 때 Origin 헤더를 허용 목록과 비교하고, 쿠키 대신 토큰 인증을 쓰면 위험이 줄어듭니다."
            ]
          ],
          related: ["net/websocket", "cs/dongil-chulcheo-jeongchaek"]
        },
        {
          id: "net/websocket-peureimgwa-pingpong",
          slug: "websocket-peureimgwa-pingpong",
          title: "WebSocket 프레임과 핑퐁",
          deep: false,
          def: "WebSocket 메시지를 담는 작은 전송 단위인 프레임과, 연결 상태를 확인하는 Ping/Pong 제어 프레임이다.",
          why: "메시지 경계를 구분하고, 조용히 끊긴 연결이나 프록시의 유휴 타임아웃을 감지하기 위해서다.",
          how: [
            "- 프레임 헤더: FIN 비트(메시지의 마지막 조각인지), opcode(종류), 마스크 여부, 페이로드 길이. 최소 2바이트다.",
            "- opcode 종류: 텍스트(0x1), 바이너리(0x2), 이어지는 조각(0x0), Close(0x8), Ping(0x9), Pong(0xA).",
            "- 마스킹: 클라이언트 → 서버 프레임은 반드시 4바이트 키로 마스킹한다. 중간 프록시 캐시를 오염시키는 공격을 막기 위한 규칙이다.",
            "- 조각화: 큰 메시지는 여러 프레임으로 나눠 보낼 수 있다.",
            "Ping을 받은 쪽은 같은 내용의 Pong으로 답해야 한다. 서버가 주기적으로 Ping을 보내 응답이 없으면 죽은 연결로 보고 정리하며, 이 트래픽이 중간 장비의 유휴 타임아웃도 막아 준다."
          ],
          use: ["서버에서 30초마다 Ping을 보내고 두 번 연속 Pong이 없으면 세션을 닫아, 비정상 종료된 클라이언트의 연결이 메모리에 쌓이지 않게 한다."],
          warn: ["TCP 연결은 상대가 비정상 종료(전원 차단, 네트워크 단절)하면 한동안 살아 있는 것처럼 보인다. 애플리케이션 수준의 Ping/Pong 없이는 죽은 연결이 계속 쌓인다."],
          answer: "WebSocket 메시지는 최소 2바이트 헤더를 가진 프레임으로 전송되며, 텍스트·바이너리 데이터 프레임과 Close·Ping·Pong 제어 프레임이 있습니다. 클라이언트에서 서버로 가는 프레임은 프록시 캐시 오염 공격을 막기 위해 반드시 마스킹합니다. 서버는 주기적으로 Ping을 보내 Pong이 오지 않으면 죽은 연결로 정리하고, 이 트래픽이 중간 장비의 유휴 타임아웃도 막아 줍니다.",
          followUps: [
            [
              "TCP keepalive가 있는데 왜 WebSocket Ping/Pong이 필요한가요?",
              "TCP keepalive는 기본 간격이 2시간 정도로 너무 길고, 애플리케이션이 실제로 응답하는지는 확인하지 못합니다. WebSocket Ping/Pong은 애플리케이션 수준에서 짧은 주기로 확인할 수 있고 프록시 유휴 타임아웃도 막아 줍니다."
            ]
          ],
          related: ["net/websocket", "net/tcp"]
        },
        {
          id: "net/websocket-seukeilaut",
          slug: "websocket-seukeilaut",
          title: "WebSocket 스케일아웃",
          deep: true,
          def: "WebSocket 서버를 여러 대로 늘릴 때, 서로 다른 서버에 연결된 사용자끼리 메시지를 주고받게 하는 문제와 그 해결 방법이다.",
          why: "HTTP API는 무상태라 아무 서버로 보내도 되지만, WebSocket 연결은 특정 서버의 메모리에 붙어 있다. 사용자 A가 서버 1, 사용자 B가 서버 2에 연결되어 있으면 서버 1은 B에게 메시지를 직접 보낼 수 없다.",
          how: [
            "1) 메시지 브로커 도입: 모든 서버가 Redis Pub/Sub, Kafka, RabbitMQ 같은 브로커의 채널을 구독한다.",
            "2) 서버 1이 A의 메시지를 받으면 로컬 사용자에게 보내는 대신 브로커에 발행한다.",
            "3) 모든 서버가 그 메시지를 받아, 자기에게 연결된 수신자(B가 있는 서버 2)가 있으면 전달한다.",
            "4) 특정 사용자에게만 보내려면 \"사용자 → 연결된 서버\" 매핑을 Redis에 저장해 해당 서버로만 라우팅할 수도 있다.",
            "- 로드 밸런서: 핸드셰이크 이후 연결이 같은 서버에 유지되므로 별도의 세션 고정은 필요 없지만, Upgrade 헤더를 전달하도록 설정해야 한다(Nginx `proxy_set_header Upgrade`).",
            "- 배포: 서버를 재시작하면 연결이 모두 끊기므로, 클라이언트 재연결(지수 백오프)과 순차 배포가 필요하다."
          ],
          flow: ["사용자 A → 서버 1에 메시지", "서버 1이 브로커에 발행", "모든 서버가 메시지 수신", "서버 2가 B에게 전달"],
          code: "// STOMP + 외부 브로커 릴레이: 스프링이 메시지를 RabbitMQ로 중계해 모든 서버가 공유\n@Configuration\n@EnableWebSocketMessageBroker\npublic class StompConfig implements WebSocketMessageBrokerConfigurer {\n    @Override\n    public void configureMessageBroker(MessageBrokerRegistry registry) {\n        registry.enableStompBrokerRelay(\"/topic\", \"/queue\")   // 외부 브로커 사용\n                .setRelayHost(\"rabbitmq\").setRelayPort(61613);\n        registry.setApplicationDestinationPrefixes(\"/app\");\n    }\n    @Override\n    public void registerStompEndpoints(StompEndpointRegistry registry) {\n        registry.addEndpoint(\"/ws\").setAllowedOrigins(\"https://shop.com\");\n    }\n}",
          codeLang: "java",
          use: [
            "채팅 서비스에서 채팅방 ID를 Redis Pub/Sub 채널로 쓰고, 각 서버는 자기 접속자가 있는 방만 구독한다.",
            "특정 사용자 알림은 \"사용자 ID → 접속 서버\"를 Redis에 기록해 해당 서버에만 전달해 브로드캐스트 비용을 줄인다."
          ],
          warn: [
            "Redis Pub/Sub은 구독자가 없을 때 발행된 메시지를 저장하지 않는다(유실). 메시지 보존이 필요하면 Redis Streams나 Kafka를 쓴다.",
            "스프링의 기본 내장 브로커(`enableSimpleBroker`)는 서버 메모리 안에서만 동작해 서버가 여러 대면 메시지가 공유되지 않는다.",
            "서버 한 대당 동시 연결 수는 파일 디스크립터 한도와 메모리에 묶인다. OS의 `ulimit`과 커널 설정도 함께 조정해야 한다."
          ],
          myth: [
            [
              "로드 밸런서에 스티키 세션을 켜면 스케일아웃 문제가 해결된다.",
              "스티키 세션은 한 사용자가 같은 서버에 붙게 할 뿐, 다른 서버에 있는 사용자에게 메시지를 보내는 문제는 해결하지 못한다. 서버 간 전파를 위한 브로커가 여전히 필요하다."
            ]
          ],
          answer: "WebSocket 연결은 특정 서버에 붙어 있어서 서버를 여러 대로 늘리면 서로 다른 서버에 연결된 사용자끼리 메시지를 직접 전달할 수 없습니다. 그래서 Redis Pub/Sub, Kafka, RabbitMQ 같은 브로커를 두고, 메시지를 받은 서버가 발행하면 모든 서버가 구독해 자기에게 연결된 수신자에게 전달합니다. 스프링에서는 STOMP 브로커 릴레이로 외부 브로커를 연결합니다.",
          analogy: "건물마다 따로 있는 안내 방송실을 중앙 방송실과 연결해, 어느 건물에서 방송해도 모든 건물에 들리게 하는 것과 같습니다.",
          qa: [
            "채팅 서버를 여러 대로 늘리면 어떤 문제가 생기고, 어떻게 해결하나요?",
            "WebSocket 연결은 특정 서버에 붙어 있어서, 서로 다른 서버에 연결된 사용자끼리는 서버가 직접 메시지를 전달할 수 없습니다. 그래서 Redis Pub/Sub이나 Kafka 같은 브로커를 두고, 메시지를 받은 서버가 브로커에 발행하면 모든 서버가 구독해 자기에게 연결된 수신자에게 전달하게 합니다. 스프링에서는 STOMP 브로커 릴레이로 RabbitMQ 같은 외부 브로커를 쓰며, 서버 재시작에 대비해 클라이언트 재연결과 메시지 유실 처리도 함께 설계합니다."
          ],
          followUps: [
            [
              "Redis Pub/Sub을 쓰면 메시지가 유실될 수 있나요?",
              "있습니다. Redis Pub/Sub은 메시지를 저장하지 않아 구독 중인 서버가 잠시 끊겨 있으면 그동안의 메시지를 받지 못합니다. 유실이 허용되지 않으면 Redis Streams나 Kafka를 쓰고, 클라이언트가 재연결 시 마지막 메시지 ID 이후를 조회하게 합니다."
            ],
            [
              "WebSocket 서버를 무중단 배포하려면 어떻게 하나요?",
              "배포하는 서버는 새 연결을 받지 않게 한 뒤 기존 연결에 재연결을 유도하고 순차적으로 교체합니다. 클라이언트는 지수 백오프와 무작위 지연으로 재연결해 한꺼번에 몰리지 않게 하고, 끊긴 동안의 메시지는 메시지 ID 기반으로 다시 받습니다."
            ]
          ],
          related: ["net/websocket", "net/stomp", "cs/musangtae-seobeo", "cs/mesiji-kyu", "cs/kafka"]
        },
        {
          id: "net/stomp",
          slug: "stomp",
          title: "STOMP",
          deep: false,
          def: "WebSocket 위에서 쓰는 간단한 텍스트 기반 메시징 프로토콜로, 구독(SUBSCRIBE)·발행(SEND) 같은 명령과 목적지(destination)를 정의한다.",
          why: "순수 WebSocket에는 구독과 목적지 개념이 없어 채팅방 구분이나 특정 사용자 전송 규칙을 직접 만들어야 하기 때문이다.",
          how: [
            "순수 WebSocket은 \"메시지를 보낸다\"는 기능만 있어, 채팅방 구분이나 특정 사용자 전송 같은 규칙을 직접 만들어야 한다. STOMP는 이런 메시징 규칙을 표준화한다.",
            "- 명령: CONNECT, SUBSCRIBE, UNSUBSCRIBE, SEND, MESSAGE, ACK, DISCONNECT.",
            "- 목적지: `/topic/room.1`(여러 명에게 방송), `/queue/...`(한 명에게), `/app/...`(서버의 처리 메서드로).",
            "- 스프링 연동: `@MessageMapping(\"/chat.send\")`로 메시지를 받고, `@SendTo(\"/topic/room.1\")`이나 `SimpMessagingTemplate`으로 구독자에게 보낸다. `convertAndSendToUser`로 특정 사용자에게 보낼 수 있다.",
            "- 브로커: 간단히는 내장 메모리 브로커, 운영에서는 RabbitMQ·ActiveMQ 같은 외부 브로커 릴레이를 쓴다."
          ],
          code: "@Controller\npublic class ChatController {\n    @MessageMapping(\"/chat.send\")            // 클라이언트: SEND /app/chat.send\n    @SendTo(\"/topic/room.1\")                 // 구독자: SUBSCRIBE /topic/room.1\n    public ChatMessage send(ChatMessage message) {\n        return message;\n    }\n}",
          codeLang: "java",
          use: [
            "스프링 채팅 서비스에서 `/topic/room.{id}`를 구독하고 `/app/chat.send`로 메시지를 보내며, `convertAndSendToUser`로 개인 메시지를 보낸다."
          ],
          warn: [
            "스프링 시큐리티는 HTTP 핸드셰이크만 보호한다. STOMP 메시지 단위 권한(누가 어느 방을 구독할 수 있는지)은 `ChannelInterceptor`나 메시지 보안 설정으로 따로 검사해야 한다."
          ],
          answer: "STOMP는 WebSocket 위에서 쓰는 텍스트 기반 메시징 프로토콜로, SUBSCRIBE와 SEND 같은 명령과 목적지 주소 규칙을 정해 줍니다. 순수 WebSocket은 메시지만 보낼 뿐이라 채팅방 구분이나 특정 사용자 전송을 직접 만들어야 하는데, STOMP를 쓰면 스프링의 `@MessageMapping`과 `SimpMessagingTemplate`으로 간단히 구현합니다. 운영에서는 RabbitMQ 같은 외부 브로커와 연결해 여러 서버가 메시지를 공유합니다.",
          followUps: [
            [
              "STOMP 메시지의 권한 검사는 어떻게 하나요?",
              "스프링 시큐리티는 HTTP 핸드셰이크만 보호하므로, 구독과 전송 단위 권한은 `ChannelInterceptor`에서 STOMP 명령과 목적지를 보고 직접 검사하거나 메시지 보안 설정을 씁니다. 예를 들어 사용자가 속하지 않은 채팅방의 SUBSCRIBE를 거부합니다."
            ]
          ],
          related: ["net/websocket", "net/websocket-seukeilaut", "cs/rabbitmq"]
        }
      ]
    },
    {
      name: "gRPC",
      compare: {
        cols: ["개념", "역할", "핵심 내용"],
        rows: [
          ["gRPC", "RPC 프레임워크", "HTTP/2 + Protobuf, 코드 생성"],
          ["Protocol Buffers", "직렬화 형식", "`.proto` 스키마, 작은 바이너리"],
          ["gRPC 스트리밍 4종", "호출 방식", "단항, 서버·클라이언트·양방향 스트림"],
          ["gRPC vs REST", "용도 구분", "내부 고성능 gRPC, 외부 공개 REST"]
        ]
      },
      concepts: [
        {
          id: "net/grpc",
          slug: "grpc",
          title: "gRPC",
          deep: true,
          def: "구글이 만든 고성능 RPC 프레임워크로, HTTP/2 위에서 Protocol Buffers로 직렬화한 메시지를 주고받으며 원격 메서드를 로컬 함수처럼 호출하게 해 준다.",
          why: "MSA에서는 서비스끼리 초당 수많은 내부 호출을 한다. JSON + REST는 사람이 읽기 쉽지만 직렬화 크기와 비용이 크고, API 계약이 문서에만 있어 타입 불일치가 런타임에 드러난다. gRPC는 바이너리 직렬화와 코드 생성으로 빠르고 타입 안전한 서비스 간 통신을 제공한다.",
          how: [
            "1) `.proto` 파일에 서비스 메서드와 메시지 구조를 정의한다(계약 우선, contract-first).",
            "2) protoc 컴파일러가 서버용 기본 구현 클래스와 클라이언트 스텁(stub)을 여러 언어로 자동 생성한다.",
            "3) 서버는 생성된 클래스를 상속해 메서드를 구현하고, 클라이언트는 스텁의 메서드를 호출한다.",
            "4) 호출은 HTTP/2 POST 요청(`/패키지.서비스/메서드`)으로 변환되고, 본문은 Protocol Buffers 바이너리다.",
            "5) 결과는 gRPC 상태 코드(OK, NOT_FOUND, DEADLINE_EXCEEDED, UNAVAILABLE 등)와 함께 돌아온다.",
            "- HTTP/2 멀티플렉싱으로 연결 하나에서 많은 호출을 동시에 처리하고, 4가지 스트리밍 방식을 지원한다.",
            "- 데드라인(타임아웃)이 기본 개념으로 들어 있어, 호출 체인 전체에 남은 시간이 전파된다."
          ],
          flow: ["proto에 서비스·메시지 정의", "protoc로 스텁 코드 생성", "클라이언트가 스텁 메서드 호출", "HTTP/2로 Protobuf 전송", "응답과 상태 코드 반환"],
          code: "// order.proto\nsyntax = \"proto3\";\nservice OrderService {\n  rpc GetOrder (GetOrderRequest) returns (OrderReply);\n}\nmessage GetOrderRequest { int64 order_id = 1; }\nmessage OrderReply { int64 order_id = 1; string status = 2; int64 amount = 3; }\n\n// 서버 구현 (생성된 클래스 상속)\npublic class OrderGrpcService extends OrderServiceGrpc.OrderServiceImplBase {\n    @Override\n    public void getOrder(GetOrderRequest req, StreamObserver<OrderReply> out) {\n        Order o = orderRepository.findById(req.getOrderId()).orElseThrow();\n        out.onNext(OrderReply.newBuilder().setOrderId(o.getId()).setStatus(o.getStatus().name()).build());\n        out.onCompleted();\n    }\n}\n\n// 클라이언트: 데드라인 500ms\nOrderReply reply = stub.withDeadlineAfter(500, TimeUnit.MILLISECONDS)\n        .getOrder(GetOrderRequest.newBuilder().setOrderId(42).build());",
          codeLang: "java",
          use: [
            "주문 서비스가 재고·결제 서비스를 호출하는 내부 통신을 gRPC로 바꿔 지연과 직렬화 비용을 줄인다.",
            "쿠버네티스 환경에서는 Envoy나 Istio 같은 L7 프록시로 gRPC 요청을 서버들에 고르게 분산한다.",
            "실시간 시세나 로그 수집처럼 데이터를 계속 흘려보내는 기능에 gRPC 서버 스트리밍을 쓴다."
          ],
          warn: [
            "브라우저는 HTTP/2 프레임을 직접 다룰 수 없어 gRPC를 바로 호출하지 못한다. 브라우저용으로는 gRPC-Web과 프록시(Envoy)가 필요하므로, 보통 외부 공개 API는 REST, 내부 서비스 간 통신은 gRPC로 나눈다.",
            "HTTP/2 연결을 오래 재사용하므로 L4 로드 밸런서를 쓰면 모든 요청이 한 서버로 몰린다. L7(요청 단위) 로드 밸런싱이나 클라이언트 측 로드 밸런싱이 필요하다.",
            "바이너리라 curl이나 브라우저로 쉽게 확인할 수 없다. grpcurl 같은 전용 도구와 서버 리플렉션 설정이 필요하다."
          ],
          myth: [
            [
              "gRPC는 항상 REST보다 좋으니 모든 API를 gRPC로 바꿔야 한다.",
              "브라우저 직접 호출이 어렵고 디버깅 도구와 HTTP 캐시 활용이 불편하다. 외부 공개 API와 단순한 CRUD는 REST가 더 적합한 경우가 많다."
            ]
          ],
          answer: "gRPC는 HTTP/2 위에서 Protocol Buffers로 직렬화한 메시지를 주고받으며 원격 메서드를 로컬 함수처럼 호출하게 해 주는 RPC 프레임워크입니다. proto 파일에서 클라이언트와 서버 코드를 생성해 타입 안전하고, 바이너리 직렬화와 멀티플렉싱으로 JSON REST보다 빠릅니다. 그래서 내부 마이크로서비스 간 통신에 많이 쓰고, 브라우저와 외부 공개 API는 REST를 주로 씁니다.",
          analogy: "외국 회사와 일할 때 매번 문서를 번역해 주고받는 대신, 양쪽이 같은 계약서 양식을 쓰고 통역기를 자동으로 만들어 바로 대화하는 것과 같습니다.",
          qa: [
            "gRPC가 REST보다 빠른 이유와, 언제 gRPC를 쓰나요?",
            "gRPC는 JSON 대신 Protocol Buffers 바이너리로 직렬화해 메시지가 작고 직렬화가 빠르며, HTTP/2 멀티플렉싱으로 연결 하나에서 많은 호출을 동시에 처리합니다. 또 proto 파일에서 클라이언트와 서버 코드를 생성하므로 타입이 맞지 않는 문제가 컴파일 시점에 드러납니다. 그래서 호출이 많은 내부 마이크로서비스 간 통신이나 스트리밍에 쓰고, 브라우저와 외부 개발자가 쓰는 공개 API는 다루기 쉬운 REST를 주로 씁니다."
          ],
          followUps: [
            [
              "gRPC에서 L4 로드 밸런서를 쓰면 왜 문제가 되나요?",
              "gRPC는 HTTP/2 연결 하나를 오래 유지하며 그 안에서 모든 호출을 멀티플렉싱합니다. L4 로드 밸런서는 연결 단위로만 분산하므로 한 클라이언트의 모든 요청이 한 서버로 몰립니다. 그래서 요청 단위로 분산하는 L7 프록시나 클라이언트 측 로드 밸런싱을 씁니다."
            ],
            [
              "gRPC 데드라인은 왜 중요한가요?",
              "데드라인은 호출이 언제까지 끝나야 하는지를 정하고, 호출 체인을 따라 남은 시간이 전파됩니다. 이미 시간이 지난 요청을 하위 서비스가 계속 처리하는 낭비를 막고, 응답이 없을 때 무한정 기다리는 것도 막아 장애 전파를 줄입니다."
            ],
            [
              "gRPC의 오류는 어떻게 전달되나요?",
              "HTTP 상태 코드 대신 OK, INVALID_ARGUMENT, NOT_FOUND, DEADLINE_EXCEEDED, UNAVAILABLE 같은 gRPC 상태 코드와 메시지로 전달됩니다. 재시도 여부는 이 코드로 판단하는데, 보통 UNAVAILABLE은 재시도하고 INVALID_ARGUMENT는 재시도하지 않습니다."
            ]
          ],
          related: [
            "net/protocol-buffers",
            "net/grpc-seuteuriming-4jong",
            "net/grpc-vs-rest",
            "net/seuteurim-meoltipeulreksing",
            "cs/msa"
          ]
        },
        {
          id: "net/protocol-buffers",
          slug: "protocol-buffers",
          title: "Protocol Buffers",
          deep: false,
          def: "구글이 만든 언어 중립적인 바이너리 직렬화 형식으로, `.proto` 파일에 메시지 구조를 정의하고 코드 생성으로 사용한다.",
          why: "JSON은 필드 이름을 매번 보내 크기가 크고 파싱이 느리며, 서비스 간 스키마 계약도 강제하지 못하기 때문이다.",
          how: [
            "- 필드 번호: 각 필드는 이름이 아니라 번호(태그)로 인코딩된다. 그래서 JSON처럼 필드 이름을 매번 보내지 않아 크기가 작다.",
            "- 가변 길이 정수(varint): 작은 숫자는 1바이트로 표현한다.",
            "- 크기와 속도: 같은 데이터를 JSON보다 보통 3~10배 작게, 더 빠르게 직렬화한다.",
            "- 스키마 진화: 새 필드는 새 번호로 추가하면 된다. 옛 클라이언트는 모르는 번호를 무시하고, 새 클라이언트는 빠진 필드를 기본값으로 읽어 앞뒤 호환이 유지된다.",
            "Kafka 메시지 직렬화(스키마 레지스트리와 함께)에도 많이 쓰인다."
          ],
          code: "message User {\n  int64  id    = 1;\n  string name  = 2;\n  string email = 3;\n  // 4번은 삭제된 필드: 번호 재사용 금지\n  reserved 4;\n  repeated string roles = 5;   // 새 필드는 새 번호로 추가\n}",
          codeLang: "java",
          use: [
            "gRPC 메시지 정의에 쓰고, Kafka 메시지를 스키마 레지스트리와 함께 Protobuf로 직렬화해 크기와 호환성을 관리한다.",
            "모바일 앱과 서버 간 통신량이 많을 때 JSON 대신 Protobuf를 써 데이터 사용량을 줄인다."
          ],
          warn: [
            "이미 쓰인 필드 번호를 바꾸거나 삭제한 번호를 다른 필드에 재사용하면 기존 데이터가 엉뚱하게 해석된다. 삭제한 번호는 `reserved`로 막아 둔다.",
            "proto3에서는 기본값(0, 빈 문자열)과 \"값이 없음\"을 구분할 수 없다. 구분이 필요하면 `optional`이나 래퍼 타입을 쓴다."
          ],
          myth: [
            [
              "필드 이름만 같으면 번호는 바꿔도 된다.",
              "인코딩에는 번호만 들어가므로 번호를 바꾸면 기존 데이터가 엉뚱한 필드로 읽힌다. 번호는 한 번 정하면 바꾸지 않고, 삭제한 번호는 `reserved`로 막는다."
            ]
          ],
          answer: "Protocol Buffers는 proto 파일에 메시지 구조를 정의하고 코드 생성으로 쓰는 바이너리 직렬화 형식입니다. 필드 이름 대신 필드 번호로 인코딩하고 작은 숫자를 짧게 표현해 JSON보다 보통 몇 배 작고 빠릅니다. 새 필드는 새 번호로 추가하면 옛 클라이언트와 새 클라이언트가 서로 호환됩니다.",
          followUps: [
            [
              "proto3에서 값이 0인지, 값이 없는지 어떻게 구분하나요?",
              "proto3 기본 스칼라 필드는 기본값이면 아예 전송하지 않아 0과 \"없음\"을 구분할 수 없습니다. 구분이 필요하면 필드에 `optional`을 붙이거나 `google.protobuf.Int64Value` 같은 래퍼 타입을 써서 존재 여부를 확인합니다."
            ]
          ],
          related: ["net/grpc", "net/grpc-vs-rest"]
        },
        {
          id: "net/grpc-seuteuriming-4jong",
          slug: "grpc-seuteuriming-4jong",
          title: "gRPC 스트리밍 4종",
          deep: false,
          def: "gRPC가 지원하는 네 가지 호출 방식으로, 요청과 응답 각각을 하나로 보낼지 스트림으로 보낼지에 따라 나뉜다.",
          why: "대용량 결과 전송이나 실시간 양방향 통신을 요청 하나에 응답 하나인 모델로는 효율적으로 표현할 수 없기 때문이다.",
          how: [
            "- Unary: 요청 1개 → 응답 1개. 일반적인 함수 호출과 같다. 예: 주문 조회.",
            "- Server streaming: 요청 1개 → 응답 여러 개. 서버가 결과를 흘려보낸다. 예: 대용량 조회 결과, 실시간 시세 구독.",
            "- Client streaming: 요청 여러 개 → 응답 1개. 클라이언트가 데이터를 흘려보내고 마지막에 결과를 받는다. 예: 파일 업로드, 센서 데이터 일괄 전송.",
            "- Bidirectional streaming: 양쪽이 각자 독립적으로 메시지를 계속 주고받는다. 예: 채팅, 실시간 협업.",
            "모두 HTTP/2 스트림 하나 위에서 동작하며, proto 정의에서 `stream` 키워드로 구분한다."
          ],
          code: "service PriceService {\n  rpc GetPrice (PriceRequest) returns (Price);                       // Unary\n  rpc Subscribe (PriceRequest) returns (stream Price);               // Server streaming\n  rpc Upload (stream Tick) returns (UploadSummary);                  // Client streaming\n  rpc Trade (stream Order) returns (stream Execution);               // Bidirectional\n}",
          codeLang: "java",
          use: ["실시간 시세 구독은 서버 스트리밍, IoT 센서 데이터 일괄 업로드는 클라이언트 스트리밍, 채팅이나 실시간 매칭은 양방향 스트리밍으로 구현한다."],
          warn: ["스트리밍 연결은 오래 유지되므로 데드라인, 재연결, 흐름 제어(서버가 너무 빨리 보내는 문제)를 따로 설계해야 한다."],
          answer: "gRPC는 요청과 응답을 하나로 보낼지 스트림으로 보낼지에 따라 네 가지 호출을 지원합니다. Unary는 요청 하나에 응답 하나, 서버 스트리밍은 응답을 여러 개, 클라이언트 스트리밍은 요청을 여러 개 보내고, 양방향 스트리밍은 양쪽이 독립적으로 계속 주고받습니다. 모두 HTTP/2 스트림 하나 위에서 동작하고 proto에서 `stream` 키워드로 구분합니다.",
          followUps: [
            [
              "서버 스트리밍과 SSE는 어떻게 다른가요?",
              "둘 다 서버가 데이터를 계속 흘려보내지만, SSE는 브라우저가 바로 쓸 수 있는 텍스트 기반 HTTP 응답이고 gRPC 서버 스트리밍은 Protobuf 바이너리와 생성된 클라이언트가 필요합니다. 그래서 브라우저용은 SSE, 서비스 간 스트리밍은 gRPC를 주로 씁니다."
            ]
          ],
          related: ["net/grpc", "net/protocol-buffers", "net/websocket"]
        },
        {
          id: "net/grpc-vs-rest",
          slug: "grpc-vs-rest",
          title: "gRPC vs REST",
          deep: false,
          def: "두 방식은 경쟁 관계라기보다 용도가 다르다. 외부 공개 API는 REST, 내부 고성능 통신은 gRPC를 주로 쓴다.",
          why: "외부 공개 API와 내부 고성능 서비스 통신에 맞는 방식을 상황에 따라 근거 있게 고르기 위해서다.",
          how: [
            "- 데이터 형식: REST는 주로 JSON(사람이 읽기 쉬움), gRPC는 Protocol Buffers(작고 빠름).",
            "- 설계 관점: REST는 자원(URI)과 HTTP 메서드 중심, gRPC는 메서드 호출(동작) 중심.",
            "- 계약: REST는 OpenAPI 같은 문서를 선택적으로 두고, gRPC는 proto 파일이 곧 계약이며 코드가 생성된다.",
            "- 전송: REST는 HTTP/1.1과 2 모두 가능, gRPC는 HTTP/2 필수.",
            "- 스트리밍: REST는 기본적으로 요청-응답만, gRPC는 양방향 스트리밍 지원.",
            "- 브라우저: REST는 바로 호출 가능, gRPC는 gRPC-Web과 프록시가 필요.",
            "- 캐시·도구: REST는 HTTP 캐시, curl, 브라우저로 쉽게 다룬다. gRPC는 전용 도구가 필요하다."
          ],
          use: ["API 게이트웨이에서 외부 요청은 REST로 받고, 내부 서비스로는 gRPC로 변환해 호출하는 구조(gRPC-Gateway, Envoy 트랜스코딩)를 쓴다."],
          answer: "REST는 JSON과 자원 중심 URI로 사람이 읽고 다루기 쉬워 브라우저와 외부 공개 API에 적합합니다. gRPC는 Protobuf 바이너리와 메서드 호출 중심으로 빠르고, proto 계약에서 코드를 생성해 타입 안전하며 양방향 스트리밍을 지원합니다. 그래서 외부는 REST, 호출이 많은 내부 서비스 간 통신은 gRPC로 나누는 구성이 흔합니다.",
          followUps: [
            [
              "기존 REST 서비스를 gRPC로 바꿀 때 고려할 점은?",
              "브라우저나 외부 클라이언트가 직접 호출한다면 gRPC-Web이나 트랜스코딩 계층이 필요합니다. 또 로드 밸런서를 L7로 바꾸고, grpcurl 같은 디버깅 도구와 모니터링을 준비해야 하며, proto 파일을 공유·버전 관리하는 체계도 만들어야 합니다."
            ]
          ],
          related: ["net/grpc", "cs/rest-wonchik", "net/graphql"]
        }
      ]
    },
    {
      name: "GraphQL",
      compare: {
        cols: ["기준", "GraphQL", "GraphQL N+1과 DataLoader"],
        rows: [
          ["다루는 것", "API 쿼리 언어·런타임", "리졸버 성능 문제와 해법"],
          ["핵심 내용", "필요한 필드만 한 번에 요청", "항목별 조회를 배치로 묶음"],
          ["효과", "오버·언더페칭 해소", "쿼리 수 N+1 → 2"],
          ["주의점", "HTTP 캐싱 어려움, 복잡 쿼리 부하", "요청마다 DataLoader 새로 생성"]
        ]
      },
      concepts: [
        {
          id: "net/graphql",
          slug: "graphql",
          title: "GraphQL",
          deep: false,
          def: "클라이언트가 필요한 데이터의 모양을 쿼리로 직접 지정해 한 번의 요청으로 받아 가는 API 쿼리 언어이자 런타임이다.",
          why: "화면마다 필요한 데이터가 달라 REST에서 생기는 여러 번 호출(언더페칭)과 불필요한 필드(오버페칭)를 없애기 위해서다.",
          how: [
            "REST에서는 화면 하나를 그리려고 `/users/1`, `/users/1/orders`, `/products/...`를 여러 번 호출하거나(언더페칭), 필요 없는 필드까지 잔뜩 받는다(오버페칭).",
            "- 단일 엔드포인트: 보통 `POST /graphql` 하나로 모든 조회(Query)와 변경(Mutation)을 처리하고, Subscription으로 실시간 구독도 지원한다.",
            "- 스키마: 서버가 타입 시스템으로 데이터 구조를 정의하고, 클라이언트는 그 안에서 원하는 필드만 고른다.",
            "- 리졸버: 필드마다 데이터를 가져오는 함수가 있고, 서버가 쿼리 모양대로 리졸버를 호출해 결과를 조립한다.",
            "화면마다 필요한 데이터가 크게 다른 모바일·웹 클라이언트가 여럿인 서비스에 잘 맞는다. 스프링에서는 Spring for GraphQL을 쓴다."
          ],
          code: "# 클라이언트가 필요한 필드만 요청\nquery {\n  user(id: 1) {\n    name\n    orders(last: 3) { id amount status }\n  }\n}",
          codeLang: "java",
          use: [
            "웹, iOS, 안드로이드가 같은 데이터를 서로 다른 모양으로 쓰는 서비스에서 BFF 역할로 GraphQL 서버를 둔다.",
            "스프링에서는 Spring for GraphQL과 `@QueryMapping`, `@SchemaMapping`으로 리졸버를 구현한다."
          ],
          warn: [
            "모든 요청이 POST 한 곳으로 가서 URL 기반 HTTP 캐시를 쓰기 어렵다.",
            "클라이언트가 깊게 중첩된 쿼리를 보내 서버를 과부하시킬 수 있다. 쿼리 깊이와 복잡도 제한이 필요하다.",
            "오류도 대부분 200 응답 안의 `errors` 필드로 오므로, 상태 코드 기반 모니터링이 잘 맞지 않는다."
          ],
          myth: [
            [
              "GraphQL을 쓰면 N+1 문제가 사라진다.",
              "오히려 필드마다 리졸버가 따로 실행되어 N+1이 더 쉽게 생긴다. DataLoader나 `@BatchMapping`으로 직접 묶어 줘야 한다."
            ]
          ],
          answer: "GraphQL은 클라이언트가 필요한 필드의 모양을 쿼리로 지정해 한 번의 요청으로 받아 가는 API 쿼리 언어입니다. REST에서 생기는 여러 번 호출(언더페칭)과 불필요한 필드 수신(오버페칭)을 줄여, 화면마다 필요한 데이터가 다른 클라이언트가 많을 때 유리합니다. 대신 URL 기반 HTTP 캐시가 어렵고, 복잡한 쿼리로 서버가 과부하될 수 있어 깊이와 복잡도 제한이 필요합니다.",
          followUps: [
            [
              "GraphQL API를 악의적인 쿼리로부터 어떻게 보호하나요?",
              "쿼리 깊이와 복잡도에 상한을 두고, 페이지 크기를 제한하며, 미리 등록된 쿼리만 허용하는 persisted query를 쓸 수 있습니다. 운영에서는 스키마 공개(introspection)를 끄고 요청별 타임아웃도 둡니다."
            ]
          ],
          related: ["net/graphql-nplus1gwa-dataloader", "net/grpc-vs-rest", "cs/rest-wonchik"]
        },
        {
          id: "net/graphql-nplus1gwa-dataloader",
          slug: "graphql-nplus1gwa-dataloader",
          title: "GraphQL N+1과 DataLoader",
          deep: false,
          def: "GraphQL 리졸버가 목록의 항목마다 따로 DB를 조회해 쿼리가 폭증하는 문제와, 이를 묶어서 한 번에 조회하는 DataLoader 패턴이다.",
          why: "필드마다 독립 실행되는 리졸버가 목록 항목마다 DB를 조회해 쿼리 수가 폭증하는 것을 막기 위해서다.",
          how: [
            "사용자 100명을 조회한 뒤 각 사용자의 `orders` 리졸버가 따로 실행되면 주문 조회 쿼리가 100번 나간다(1 + N).",
            "DataLoader는 같은 요청 처리 중에 들어온 키(사용자 id)들을 잠시 모았다가, `WHERE user_id IN (...)` 한 번으로 조회한 뒤 결과를 각 리졸버에 나눠 준다(배칭). 같은 키를 여러 번 요청하면 캐시된 결과를 돌려준다.",
            "스프링 GraphQL에서는 `@BatchMapping`으로 이 패턴을 간단히 쓴다."
          ],
          flow: ["목록 리졸버가 N개 반환", "하위 필드 키를 모음", "IN 쿼리 한 번 실행", "결과를 키별로 분배"],
          code: "@Controller\npublic class UserGraphqlController {\n    // users 목록 전체의 orders를 한 번에 조회\n    @BatchMapping\n    public Map<User, List<Order>> orders(List<User> users) {\n        List<Long> ids = users.stream().map(User::getId).toList();\n        Map<Long, List<Order>> byUser = orderRepository.findByUserIdIn(ids).stream()\n                .collect(Collectors.groupingBy(Order::getUserId));\n        return users.stream().collect(Collectors.toMap(u -> u, u -> byUser.getOrDefault(u.getId(), List.of())));\n    }\n}",
          codeLang: "java",
          use: ["사용자 목록과 각 사용자의 주문을 함께 조회하는 화면에서 `@BatchMapping`으로 주문 조회를 한 번의 쿼리로 묶는다."],
          answer: "GraphQL에서 목록을 조회하면 항목마다 하위 필드 리졸버가 따로 실행되어 DB 조회가 1 + N번 나가는 문제가 생깁니다. DataLoader는 한 요청 안에서 들어온 키를 모았다가 `IN` 쿼리 한 번으로 조회하고 결과를 나눠 주는 배칭 패턴입니다. 스프링 GraphQL에서는 `@BatchMapping`으로 간단히 적용합니다.",
          followUps: [
            [
              "DataLoader의 캐시는 요청 간에 공유되나요?",
              "보통 공유하지 않습니다. DataLoader 캐시는 한 요청 범위에서만 같은 키의 중복 조회를 막는 용도라, 요청이 끝나면 버립니다. 요청 간 캐시가 필요하면 Redis 같은 별도 캐시를 씁니다."
            ]
          ],
          related: ["net/graphql"]
        }
      ]
    }
  ]
};

export default topic;
