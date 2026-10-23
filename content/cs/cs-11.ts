import type { Topic } from '../types';

const topic: Topic = {
  key: "cs-11",
  name: "Redis",
  must: [
    "Redis는 명령 실행이 싱글 스레드다. `KEYS *`, 큰 키 `DEL`처럼 오래 걸리는 명령 하나가 전체를 멈춘다. `SCAN`, `UNLINK`를 쓴다.",
    "캐시와 세션·락처럼 사라지면 안 되는 데이터는 eviction 정책이 다르므로 인스턴스를 나눈다.",
    "분산 락은 만료 시간과 고유값을 함께 걸고, 해제는 Lua로 \"내 락일 때만\" 지운다. 트랜잭션 커밋 후 해제한다.",
    "같은 TTL로 대량 저장하면 한꺼번에 만료되어 DB에 요청이 몰린다. TTL에 무작위 값을 더한다.",
    "복제는 비동기라 장애 전환 때 마지막 쓰기가 유실될 수 있다. Redis를 유일한 원본 저장소로 쓰지 않는다."
  ],
  groups: [
    {
      name: "Redis 기본",
      compare: {
        cols: ["기준", "Redis 개요", "싱글 스레드 이벤트 루프"],
        rows: [
          ["다루는 것", "저장소 전체 특성", "명령 처리 구조"],
          ["핵심 내용", "인메모리 Key-Value, 다양한 자료형", "한 스레드가 명령 순차 실행"],
          ["장점", "마이크로초 단위 응답", "락 없이 명령 단위 원자성"],
          ["주의점", "메모리 용량 한계, 유실 대비", "O(N) 명령이 전체를 막음"]
        ]
      },
      concepts: [
        {
          id: "cs/redis-gaeyo",
          slug: "redis-gaeyo",
          title: "Redis 개요",
          deep: false,
          def: "모든 데이터를 메모리에 두고 다양한 자료형을 제공하는 Key-Value 저장소로, 캐시, 세션, 랭킹, 분산 락, 메시지 처리에 널리 쓴다.",
          why: "DB 디스크 조회만으로는 버티기 힘든 대량의 읽기와 짧게 사는 데이터를 메모리에서 빠르게 처리하기 위해서다.",
          how: [
            "데이터를 디스크가 아닌 RAM에 저장해 대부분의 명령이 마이크로초 단위로 끝난다. 단일 인스턴스로도 초당 수만~수십만 건을 처리한다.",
            "- 단순 문자열뿐 아니라 List, Hash, Set, Sorted Set 같은 자료형과 그에 맞는 원자적 명령을 제공한다.",
            "- 키마다 만료 시간(TTL)을 줄 수 있어 캐시로 쓰기 좋다.",
            "- RDB, AOF로 디스크에 저장해 재시작 후 복구할 수 있지만, 기본 목적은 영구 저장소가 아니다.",
            "- 복제, Sentinel, Cluster로 가용성과 확장성을 확보한다.",
            "메모리는 디스크보다 비싸고 작으므로, 원본 데이터는 RDB에 두고 Redis는 빠른 조회용 보조 저장소로 쓰는 구성이 일반적이다.",
            "2024년 Redis 라이선스 변경 이후 BSD 라이선스를 유지한 포크 Valkey도 많이 쓰이며, 명령과 사용법은 거의 같다."
          ],
          use: ["상품 상세 조회 결과를 Redis에 5분간 캐시해 DB 조회를 대부분 없앤다.", "여러 서버가 공유하는 로그인 세션과 API 요청 횟수 제한 카운터를 Redis에 둔다."],
          answer: "Redis는 모든 데이터를 메모리에 두는 Key-Value 저장소로, String, Hash, Sorted Set 같은 자료형과 원자적 명령을 제공합니다. 대부분의 명령이 마이크로초 단위로 끝나 캐시, 세션, 랭킹, 분산 락에 많이 씁니다. RDB와 AOF로 영속성도 지원하지만, 원본 데이터는 보통 RDB에 두고 Redis는 빠른 조회용 보조 저장소로 씁니다.",
          analogy: "책상 위에 펼쳐 둔 메모장과 같습니다. 서랍 속 문서철(DB)보다 훨씬 빨리 볼 수 있지만, 공간이 작고 잃어버릴 수 있어 원본은 문서철에 둡니다.",
          followUps: [
            [
              "Redis와 Memcached의 차이는?",
              "Memcached는 단순 문자열 캐시에 특화되어 멀티 스레드로 동작하고 영속성이 없습니다. Redis는 다양한 자료형, 영속성, 복제, Cluster, Pub/Sub, Lua 스크립트를 제공해 캐시 외 용도로도 쓸 수 있습니다."
            ]
          ],
          related: ["cs/singgeul-seuredeu-ibenteu-rupeu", "cs/key-value-jeojangso", "cs/redis-kaesi-hwalyong"]
        },
        {
          id: "cs/singgeul-seuredeu-ibenteu-rupeu",
          slug: "singgeul-seuredeu-ibenteu-rupeu",
          title: "싱글 스레드 이벤트 루프",
          deep: true,
          def: "Redis는 명령 실행을 하나의 메인 스레드가 이벤트 루프로 순서대로 처리해, 락 없이도 각 명령이 원자적으로 실행된다.",
          why: "메모리 연산은 매우 빨라 병목이 CPU보다 네트워크에 있다. 단일 스레드로 처리하면 락과 컨텍스트 스위칭 비용이 없고, 모든 명령이 원자적이라 동시성 문제를 단순하게 다룰 수 있다.",
          how: [
            "1) 운영체제의 I/O 다중화(Linux epoll)로 수많은 클라이언트 소켓을 하나의 스레드가 감시한다.",
            "2) 읽을 준비가 된 소켓에서 명령을 읽는다.",
            "3) 명령을 하나씩 순서대로 실행한다. 실행 중에는 다른 명령이 끼어들지 않는다.",
            "4) 결과를 응답 버퍼에 쓰고 다음 이벤트를 처리한다.",
            "Redis 6.0부터는 네트워크 읽기·쓰기와 프로토콜 파싱을 여러 I/O 스레드로 나눌 수 있지만, 명령 실행은 여전히 메인 스레드 하나가 한다.",
            "백그라운드 스레드는 RDB 저장, AOF 재작성, 큰 키의 비동기 삭제(`UNLINK`) 같은 무거운 작업을 따로 처리한다.",
            "그래서 `INCR` 같은 단일 명령은 항상 원자적이고, 여러 명령을 원자적으로 묶으려면 `MULTI/EXEC` 트랜잭션이나 Lua 스크립트를 쓴다."
          ],
          flow: ["epoll로 소켓 이벤트 감시", "준비된 소켓에서 명령 읽기", "명령을 하나씩 순서대로 실행", "결과를 응답 버퍼에 기록", "다음 이벤트 처리"],
          code: "# 각 명령은 원자적이라 동시에 호출해도 카운트가 유실되지 않는다\nINCR page:view:1001\n\n# 여러 명령을 원자적으로: Lua 스크립트 (실행 중 다른 명령이 끼어들지 않음)\nEVAL \"local v = redis.call('GET', KEYS[1])\n      if not v then redis.call('SET', KEYS[1], ARGV[1], 'EX', 60) return 1 end\n      return 0\" 1 coupon:lock user-7",
          codeLang: "java",
          use: ["`INCR`로 선착순 쿠폰 발급 수를 세면 동시에 요청해도 정확히 센다.", "확인 후 저장을 Lua 스크립트 하나로 묶어 두 요청이 동시에 통과하는 것을 막는다."],
          warn: [
            "오래 걸리는 명령 하나가 모든 클라이언트를 멈춘다. `KEYS *`, 큰 컬렉션 전체 조회(`HGETALL`, `SMEMBERS`), 큰 키 `DEL`은 운영에서 피한다.",
            "Lua 스크립트도 실행되는 동안 서버 전체를 막으므로 짧게 유지한다."
          ],
          myth: [
            [
              "Redis 6부터 멀티 스레드라 느린 명령도 괜찮다.",
              "Redis 6의 멀티 스레드는 네트워크 읽기·쓰기용입니다. 명령 실행은 여전히 메인 스레드 하나라 느린 명령은 전체를 막습니다."
            ]
          ],
          answer: "Redis는 명령 실행을 메인 스레드 하나가 이벤트 루프로 순서대로 처리합니다. 데이터가 메모리에 있어 명령이 매우 빠르고 병목은 네트워크라서, epoll로 수많은 연결을 한 스레드가 처리해도 충분히 빠르고 락 비용이 없습니다. 대신 느린 명령 하나가 전체를 막으므로 KEYS나 큰 키 삭제를 피해야 합니다.",
          analogy: "주문을 한 명의 바리스타가 순서대로 처리하는 카페와 같습니다. 음료 하나가 금방 나와서 줄이 잘 줄지만, 누가 복잡한 주문 하나를 넣으면 뒤 손님이 모두 기다립니다.",
          qa: [
            "Redis는 싱글 스레드인데 왜 빠른가요?",
            "데이터가 메모리에 있어 명령 하나의 처리 시간이 매우 짧고, 병목은 CPU보다 네트워크 I/O에 있습니다. Redis는 epoll 같은 I/O 다중화로 하나의 스레드가 수많은 연결을 처리하고, 락이나 컨텍스트 스위칭 비용이 없습니다. 또 명령이 순서대로 하나씩 실행되어 각 명령이 원자적이라는 장점이 있습니다. 대신 느린 명령 하나가 전체를 막으므로 KEYS 같은 명령은 피해야 합니다."
          ],
          followUps: [
            [
              "MULTI/EXEC 트랜잭션은 롤백이 되나요?",
              "MULTI/EXEC는 명령들을 모아 중간에 다른 명령이 끼어들지 않게 한 번에 실행할 뿐, 중간 명령이 실패해도 앞 명령을 되돌리지 않습니다. 조건부 실행이 필요하면 WATCH로 낙관적 락을 걸거나 Lua 스크립트를 씁니다."
            ],
            [
              "CPU 코어를 더 활용하려면 어떻게 하나요?",
              "한 인스턴스는 명령 실행에 코어 하나만 쓰므로, 한 서버에 여러 인스턴스를 띄우거나 Redis Cluster로 샤드를 나눠 여러 코어와 서버를 활용합니다."
            ]
          ],
          related: ["cs/redis-gaeyo", "cs/beulroking-myeongryeong-juui", "cs/redis-bunsan-rak"]
        }
      ]
    },
    {
      name: "자료형",
      compare: {
        cols: ["기준", "Redis String", "Redis List", "Redis Hash", "Redis Set", "Sorted Set"],
        rows: [
          ["구조", "키 하나에 값 하나", "순서 있는 목록", "필드-값 묶음", "중복 없는 집합", "점수순 정렬 집합"],
          ["대표 명령", "SET, GET, INCR", "LPUSH, RPOP", "HSET, HGET", "SADD, SISMEMBER", "ZADD, ZREVRANGE"],
          ["주요 시간", "O(1)", "양 끝 O(1)", "필드 O(1)", "포함 확인 O(1)", "삽입·순위 O(log n)"],
          ["대표 용도", "캐시, 카운터", "최근 목록, 큐", "객체 속성", "좋아요, 태그", "랭킹, 시간순 조회"]
        ]
      },
      concepts: [
        {
          id: "cs/redis-string",
          slug: "redis-string",
          title: "Redis String",
          deep: false,
          def: "키 하나에 값 하나(최대 512MB)를 저장하는 가장 기본 자료형으로, 문자열, 숫자, 직렬화한 객체를 담는다.",
          why: "캐시 값, 카운터, 락 키처럼 가장 흔한 단순 데이터를 만료 시간과 원자적 연산으로 다루기 위해서다.",
          how: [
            "- `SET key value EX 60`: 60초 만료로 저장한다. `NX` 옵션은 키가 없을 때만 저장해 락이나 중복 방지에 쓴다.",
            "- `GET`, `MGET`(여러 키 한 번에), `GETDEL` 등으로 조회한다.",
            "- `INCR`, `INCRBY`, `DECR`: 원자적으로 숫자를 증감한다. 조회수, 요청 횟수 제한(Rate Limiting) 카운터에 쓴다.",
            "- 객체를 JSON으로 직렬화해 캐시로 저장하는 용도가 가장 흔하다.",
            "필드 일부만 바꾸는 일이 잦은 객체는 통째로 다시 쓰는 String보다 Hash가 효율적이다."
          ],
          code: "SET user:1:profile '{\"name\":\"kim\",\"grade\":\"VIP\"}' EX 600\nINCR api:limit:user:1          # 요청 수 증가\nEXPIRE api:limit:user:1 60     # 1분 창",
          codeLang: "java",
          use: ["`INCR`과 `EXPIRE`로 사용자별 분당 요청 수를 세어 Rate Limiting을 한다.", "조회 결과 DTO를 JSON 문자열로 저장해 캐시한다."],
          answer: "Redis String은 키 하나에 최대 512MB 값 하나를 저장하는 기본 자료형입니다. SET에 EX로 만료를, NX로 없을 때만 저장을 지정할 수 있고, INCR로 원자적 카운터를 만들 수 있습니다. 직렬화한 객체를 캐시하는 용도로 가장 많이 씁니다.",
          followUps: [
            [
              "객체를 String에 JSON으로 저장할 때와 Hash에 저장할 때의 차이는?",
              "String은 한 번에 읽고 쓰기 간단하지만 필드 하나를 바꿔도 전체를 다시 써야 합니다. Hash는 필드 단위로 읽고 바꿀 수 있어 부분 갱신이 잦은 객체에 유리합니다."
            ]
          ],
          related: ["cs/redis-hash", "cs/rate-limiting", "cs/redis-kaesi-hwalyong"]
        },
        {
          id: "cs/redis-list",
          slug: "redis-list",
          title: "Redis List",
          deep: false,
          def: "삽입 순서를 유지하는 문자열 목록으로, 양 끝에서 넣고 빼는 연산이 O(1)이라 큐나 최근 목록에 쓴다.",
          why: "별도 메시지 브로커 없이도 순서가 있는 작업 큐나 최근 N개 목록을 간단히 만들기 위해서다.",
          how: [
            "- `LPUSH`/`RPUSH`로 넣고 `LPOP`/`RPOP`으로 꺼낸다. 한쪽으로 넣고 반대쪽으로 빼면 큐, 같은 쪽이면 스택이다.",
            "- `BLPOP`/`BRPOP`: 원소가 생길 때까지 기다리는 블로킹 꺼내기로, 간단한 작업 큐를 만든다.",
            "- `LRANGE key 0 9`: 앞에서 10개 조회. `LTRIM key 0 99`로 최근 100개만 유지할 수 있다(최근 본 상품, 타임라인).",
            "- 중간 인덱스 접근(`LINDEX`)과 중간 삽입은 O(n)이다.",
            "메시지 유실이 허용되지 않는 작업 큐에는 꺼낸 뒤 처리 실패 시 복구가 어려우므로 Streams나 전용 메시지 큐가 더 적합하다."
          ],
          use: ["사용자별 최근 본 상품을 `LPUSH` 후 `LTRIM 0 19`로 20개만 유지한다."],
          answer: "Redis List는 삽입 순서를 유지하는 목록으로 양 끝 넣기와 빼기가 O(1)입니다. LPUSH와 LTRIM으로 최근 N개 목록을, BRPOP으로 간단한 작업 큐를 만들 수 있습니다. 중간 접근은 O(n)이고, 메시지 유실이 안 되는 큐에는 Streams가 더 적합합니다.",
          followUps: [
            [
              "List로 만든 작업 큐의 약점은?",
              "RPOP으로 꺼낸 직후 소비자가 죽으면 그 작업은 사라집니다. LMOVE로 처리 중 목록에 옮겨 두는 방식이 있지만 복잡하므로, 처리 확인이 필요하면 Streams나 전용 메시지 큐를 씁니다."
            ]
          ],
          related: ["cs/redis-streams", "ds/kyu"]
        },
        {
          id: "cs/redis-hash",
          slug: "redis-hash",
          title: "Redis Hash",
          deep: false,
          def: "키 하나 안에 필드-값 쌍을 여러 개 저장하는 자료형으로, 객체의 속성을 필드별로 다루기 좋다.",
          why: "객체 전체를 직렬화해 덮어쓰지 않고 필요한 필드만 읽고 바꿔 네트워크와 CPU 낭비를 줄이기 위해서다.",
          how: [
            "- `HSET user:1 name kim age 30`, `HGET user:1 name`, `HINCRBY user:1 point 100`.",
            "- 필드 하나만 읽고 바꿀 수 있어 객체 전체를 직렬화해 덮어쓰는 String보다 네트워크와 CPU를 아낀다.",
            "- 필드가 적고 값이 작으면 메모리 효율이 좋은 listpack 인코딩으로 저장된다.",
            "- 만료(TTL)는 키 단위로만 걸 수 있었으나 Redis 7.4부터 `HEXPIRE`로 필드별 만료도 지원한다.",
            "`HGETALL`은 필드 수에 비례해 오래 걸리므로 필드가 수만 개인 큰 Hash에서는 `HSCAN`으로 나눠 읽는다."
          ],
          use: [
            "장바구니를 `cart:{userId}` Hash에 상품 ID를 필드, 수량을 값으로 저장한다.",
            "상품별 조회수, 좋아요 수를 하나의 Hash 필드로 두고 `HINCRBY`로 올린다."
          ],
          answer: "Redis Hash는 키 하나에 필드-값 쌍을 여러 개 저장하는 자료형으로, 객체 속성을 필드별로 읽고 바꿀 수 있습니다. HINCRBY로 필드 값을 원자적으로 증가시킬 수 있습니다. 필드가 아주 많은 Hash는 HGETALL이 느리므로 HSCAN으로 나눠 읽습니다.",
          followUps: [
            [
              "Hash 필드마다 만료 시간을 줄 수 있나요?",
              "오랫동안 키 단위로만 가능했지만 Redis 7.4부터 HEXPIRE로 필드별 만료를 지원합니다. 이전 버전에서는 필드를 별도 키로 나누거나 만료 시각을 값에 함께 저장해 직접 처리했습니다."
            ]
          ],
          related: ["cs/redis-string", "cs/bikki-munje", "cs/redis-sesyeon-jeojangso"]
        },
        {
          id: "cs/redis-set",
          slug: "redis-set",
          title: "Redis Set",
          deep: false,
          def: "중복 없는 문자열 집합으로, 포함 여부 확인이 O(1)이고 교집합·합집합·차집합 연산을 제공한다.",
          why: "중복 제거와 포함 여부 확인, 공통 친구 같은 집합 연산을 애플리케이션 코드 없이 빠르게 처리하기 위해서다.",
          how: [
            "- `SADD`, `SREM`, `SISMEMBER`(포함 여부), `SCARD`(개수).",
            "- `SINTER`, `SUNION`, `SDIFF`: 공통 친구, 함께 좋아요한 사용자 같은 관계 계산에 쓴다.",
            "- 활용: 게시글 좋아요한 사용자 목록(중복 방지), 일별 방문자 ID, 태그.",
            "- `SRANDMEMBER`, `SPOP`으로 무작위 추첨을 할 수 있다.",
            "원소가 매우 많으면 메모리를 많이 쓰므로, 정확한 목록이 필요 없고 개수만 알면 되는 경우는 HyperLogLog가 낫다."
          ],
          use: ["게시글별 좋아요 사용자 ID를 Set에 넣어 한 사람이 여러 번 누르는 것을 막는다.", "이벤트 응모자를 Set에 모은 뒤 `SRANDMEMBER`로 당첨자를 추첨한다."],
          answer: "Redis Set은 중복 없는 문자열 집합으로 포함 여부 확인이 O(1)이고 교집합, 합집합, 차집합을 제공합니다. 좋아요 누른 사용자처럼 중복을 막아야 하는 목록이나 공통 친구 계산에 씁니다. 개수만 필요하면 메모리를 아끼는 HyperLogLog가 낫습니다.",
          followUps: [
            [
              "SINTER 같은 집합 연산을 운영에서 쓸 때 주의점은?",
              "집합 크기에 비례해 시간이 걸리고 단일 스레드라 다른 요청을 막습니다. 큰 집합끼리의 연산은 피하거나 복제본에서 실행하고, Cluster에서는 키들이 같은 슬롯에 있어야 합니다."
            ]
          ],
          related: ["cs/sorted-set", "cs/hyperloglog"]
        },
        {
          id: "cs/sorted-set",
          slug: "sorted-set",
          title: "Sorted Set",
          deep: true,
          def: "각 원소가 점수(score)를 가지고 점수 순으로 정렬된 상태를 유지하는 중복 없는 집합으로, 랭킹과 순위 조회에 쓴다.",
          why: "실시간 게임 랭킹이나 인기 검색어 순위를 DB에서 매번 `ORDER BY`로 계산하면 부하가 크다. Sorted Set은 삽입할 때 정렬 상태를 유지해 순위 조회를 로그 시간에 처리한다.",
          how: [
            "내부적으로 원소 → 점수 조회용 해시 테이블과, 점수 순서 유지용 스킵 리스트를 함께 쓴다. 원소가 적을 때는 메모리를 아끼는 listpack으로 저장한다.",
            "- `ZADD rank 1500 user:7`: 원소 추가 또는 점수 갱신, O(log n).",
            "- `ZINCRBY rank 10 user:7`: 점수를 원자적으로 증가.",
            "- `ZREVRANGE rank 0 9 WITHSCORES`: 상위 10명, O(log n + m).",
            "- `ZREVRANK rank user:7`: 내 순위, O(log n).",
            "- `ZRANGEBYSCORE key min max`: 점수 범위 조회. 점수에 타임스탬프를 넣으면 시간 범위 조회나 슬라이딩 윈도우 Rate Limiting에도 쓸 수 있다.",
            "- `ZREMRANGEBYRANK`로 하위 원소를 잘라 상위 N개만 유지할 수 있다.",
            "점수가 같으면 원소 문자열의 사전순으로 정렬된다."
          ],
          flow: ["ZINCRBY로 점수 갱신", "스킵 리스트에서 위치 이동", "해시로 원소 점수 조회", "ZREVRANGE로 상위 조회", "ZREVRANK로 내 순위"],
          code: "ZINCRBY game:rank:2026-10 150 \"user:7\"    # 점수 획득\nZREVRANGE game:rank:2026-10 0 9 WITHSCORES # TOP 10\nZREVRANK game:rank:2026-10 \"user:7\"        # 내 순위 (0부터)\n\n// Spring Data Redis\nredisTemplate.opsForZSet().incrementScore(\"game:rank\", \"user:7\", 150);\nSet<String> top10 = redisTemplate.opsForZSet().reverseRange(\"game:rank\", 0, 9);",
          codeLang: "java",
          use: [
            "게임 시즌 랭킹을 `rank:2026-10` 키로 만들어 상위 100명과 내 순위를 실시간으로 보여 준다.",
            "점수에 타임스탬프를 넣어 최근 1분 요청만 남기는 슬라이딩 윈도우 요청 제한을 구현한다."
          ],
          warn: [
            "원소 수가 수백만 이상인 Sorted Set은 빅키가 되어 삭제나 복제 때 지연이 생긴다. 기간별(월별)로 키를 나눈다.",
            "점수는 배정밀도 실수라 2^53을 넘는 정수는 정확히 표현되지 않는다."
          ],
          myth: [["점수가 같으면 먼저 들어온 원소가 앞선다.", "점수가 같으면 원소 문자열의 사전순으로 정렬됩니다. 먼저 달성한 사람을 앞세우려면 점수에 시간 정보를 섞어야 합니다."]],
          answer: "Sorted Set은 원소마다 점수를 두고 점수 순 정렬을 유지하는 집합으로, 내부적으로 해시 테이블과 스킵 리스트를 함께 씁니다. ZADD와 ZINCRBY로 점수를 갱신하고, ZREVRANGE로 상위 N명을, ZREVRANK로 순위를 O(log n)에 조회합니다. 실시간 랭킹, 시간순 목록, 슬라이딩 윈도우 Rate Limiting에 씁니다.",
          analogy: "점수가 바뀔 때마다 알아서 자리를 다시 잡는 순위표와 같습니다. 순위를 보려고 매번 전체를 다시 정렬할 필요가 없습니다.",
          qa: [
            "실시간 랭킹 시스템을 어떻게 구현하겠어요?",
            "Redis Sorted Set을 쓰겠습니다. 점수를 얻을 때마다 ZINCRBY로 원자적으로 갱신하고, ZREVRANGE로 상위 N명을, ZREVRANK로 내 순위를 O(log n)에 조회합니다. 내부가 스킵 리스트라 삽입 시 정렬이 유지되어 DB에서 매번 정렬하는 것보다 훨씬 가볍습니다. 키는 시즌이나 월 단위로 나눠 빅키를 막고, 원본 점수는 DB에 따로 저장해 Redis 장애 시 복구할 수 있게 합니다."
          ],
          followUps: [
            [
              "왜 균형 트리가 아니라 스킵 리스트를 쓰나요?",
              "스킵 리스트는 균형 트리와 같은 평균 O(log n) 성능을 내면서 구현이 단순하고, 범위 조회 때 연결 리스트처럼 순서대로 따라가기 쉽습니다. 레벨을 확률적으로 정해 회전 같은 복잡한 재균형이 없습니다."
            ],
            [
              "동점자를 먼저 달성한 순서로 정렬하려면?",
              "점수를 실수 하나로 만들 때 정수부에 실제 점수, 소수부에 \"큰 값 - 달성 시각\" 같은 값을 넣어 같은 점수 안에서 빠른 사람이 높게 정렬되게 합니다. 정밀도 한계 안에서 설계해야 합니다."
            ]
          ],
          related: ["cs/redis-set", "cs/bikki-munje", "cs/rate-limiting"]
        },
        {
          id: "cs/bitmap",
          slug: "bitmap",
          title: "Bitmap",
          deep: false,
          def: "String 값을 비트 배열로 다루는 기능으로, 사용자 ID를 비트 위치로 써서 대규모 예/아니오 데이터를 아주 적은 메모리로 저장한다.",
          why: "수백만 사용자의 출석 여부 같은 예/아니오 데이터를 행마다 저장하면 메모리가 너무 커지기 때문이다.",
          how: [
            "- `SETBIT attend:2026-10-23 1001 1`: 1001번 사용자가 출석했다고 표시한다.",
            "- `GETBIT`으로 확인하고, `BITCOUNT`로 1인 비트 수(출석자 수)를 센다.",
            "- `BITOP AND`로 여러 날 연속 출석자를 구할 수 있다.",
            "- 사용자 1천만 명이어도 하루 약 1.2MB면 된다.",
            "ID가 매우 크고 듬성듬성하면 큰 오프셋 때문에 메모리가 낭비되므로, 연속된 정수 ID에 적합하다."
          ],
          use: ["일별 출석 키에 `SETBIT attend:2026-10-23 {userId} 1`로 출석을 기록하고 월말에 7일 연속 출석자를 뽑는다."],
          answer: "Bitmap은 String을 비트 배열로 다루는 기능으로, 사용자 ID를 비트 위치로 써서 예/아니오 데이터를 매우 적은 메모리로 저장합니다. SETBIT로 표시하고 BITCOUNT로 개수를 세며, BITOP AND로 여러 날 연속 출석자를 구할 수 있습니다. 연속된 정수 ID에 적합합니다.",
          followUps: [
            [
              "사용자 ID가 매우 크면 어떤 문제가 생기나요?",
              "비트 위치가 ID 값이라 ID가 수십억이면 앞쪽 빈 비트까지 메모리를 차지해 수백 MB가 될 수 있습니다. ID를 연속 번호로 다시 매기거나 ID 범위별로 키를 나눕니다."
            ]
          ],
          related: ["cs/redis-string", "cs/hyperloglog"]
        },
        {
          id: "cs/hyperloglog",
          slug: "hyperloglog",
          title: "HyperLogLog",
          deep: false,
          def: "원소를 저장하지 않고 고유한 원소의 개수(카디널리티)만 약 0.81% 오차로 추정하는 확률적 자료구조다.",
          why: "일일 순방문자 수처럼 고유 개수만 필요할 때 모든 ID를 Set에 담으면 메모리가 감당할 수 없이 커지기 때문이다.",
          how: [
            "- `PFADD uv:2026-10-23 user:1 user:2`, `PFCOUNT uv:2026-10-23`.",
            "- 원소가 몇억 개여도 키 하나당 최대 12KB만 쓴다.",
            "- `PFMERGE`로 일별 키를 합쳐 주간·월간 순 방문자 수를 구할 수 있다.",
            "- 어떤 원소가 들어 있는지는 확인할 수 없고 개수만 알 수 있다.",
            "정확한 값이 필요 없는 순 방문자 수(UV), 검색어 고유 사용자 수 같은 통계에 적합하다. 정확해야 하면 Set을 쓴다."
          ],
          use: ["일별 순 방문자 수를 `PFADD uv:{date} {userId}`로 모으고 `PFMERGE`로 월간 UV를 계산한다."],
          answer: "HyperLogLog는 원소를 저장하지 않고 고유 원소 개수만 약 0.81% 오차로 추정하는 자료구조입니다. 원소가 몇억 개여도 키 하나에 최대 12KB만 쓰고, PFMERGE로 여러 기간을 합칠 수 있습니다. 순 방문자 수처럼 정확한 값이 필요 없는 통계에 씁니다.",
          followUps: [
            [
              "HyperLogLog로 특정 사용자가 방문했는지 확인할 수 있나요?",
              "불가능합니다. 개수 추정만 할 수 있고 원소 자체는 저장하지 않습니다. 포함 여부가 필요하면 Set이나 Bitmap, 대략적인 포함 확인은 블룸 필터를 씁니다."
            ]
          ],
          related: ["cs/redis-set", "cs/bitmap"]
        }
      ]
    },
    {
      name: "영속성",
      compare: {
        cols: ["기준", "RDB 스냅샷", "AOF"],
        rows: [
          ["저장 방식", "시점별 메모리 덤프", "쓰기 명령 로그 추가"],
          ["유실 범위", "마지막 스냅샷 이후", "everysec면 약 1초"],
          ["파일 크기", "작음 (압축 바이너리)", "큼 (재작성 필요)"],
          ["복구 속도", "빠름", "느림 (명령 재실행)"]
        ]
      },
      concepts: [
        {
          id: "cs/rdb-seunaepsyat",
          slug: "rdb-seunaepsyat",
          title: "RDB 스냅샷",
          deep: true,
          def: "특정 시점의 메모리 전체 데이터를 압축된 바이너리 파일(dump.rdb)로 디스크에 저장하는 Redis의 영속성 방식이다.",
          why: "Redis는 메모리에 데이터를 두기 때문에 재시작하면 모두 사라진다. 주기적으로 스냅샷을 남겨 재시작 시 빠르게 복구하고, 백업 파일로 보관하려고 쓴다.",
          how: [
            "1) `BGSAVE`가 실행되면(설정한 주기 또는 수동) 메인 프로세스가 `fork()`로 자식 프로세스를 만든다.",
            "2) 자식 프로세스가 fork 시점의 메모리 내용을 파일로 쓴다. 메인 프로세스는 그동안에도 계속 요청을 처리한다.",
            "3) OS의 Copy-on-Write 덕분에 부모와 자식은 메모리를 공유하다가, 부모가 수정한 페이지만 복사된다.",
            "4) 쓰기가 끝나면 임시 파일을 기존 dump.rdb로 바꿔 끼운다.",
            "- 장점: 파일이 작고, 재시작 시 로딩이 빠르며, 백업과 복제 초기 동기화에 쓰기 좋다.",
            "- 단점: 마지막 스냅샷 이후의 변경은 장애 시 유실된다(예: 5분마다 저장하면 최대 5분 유실).",
            "`save 3600 1 300 100 60 10000`처럼 \"N초 동안 M번 이상 변경되면 저장\" 규칙을 여러 개 둔다."
          ],
          flow: ["저장 조건 충족", "fork로 자식 프로세스 생성", "자식이 메모리를 파일로 기록", "부모는 계속 요청 처리", "완료 후 dump.rdb 교체"],
          code: "# redis.conf\nsave 3600 1      # 1시간 동안 1번 이상 변경되면\nsave 300 100     # 5분 동안 100번 이상\nsave 60 10000    # 1분 동안 10000번 이상\ndbfilename dump.rdb\n\n# 수동 실행\nBGSAVE",
          codeLang: "java",
          use: ["매일 새벽 RDB 파일을 S3에 백업해 재해 복구용으로 보관한다.", "새 복제본을 붙일 때 마스터가 RDB를 만들어 초기 데이터를 전달한다."],
          warn: [
            "fork 순간 메모리 페이지 테이블 복사로 짧은 멈춤이 생기고, 쓰기가 많으면 Copy-on-Write로 메모리 사용량이 최대 2배까지 늘 수 있다. 메모리를 넉넉히 남겨 둔다.",
            "`SAVE`(백그라운드가 아닌 저장)는 메인 스레드를 막으므로 운영에서 쓰지 않는다."
          ],
          myth: [
            [
              "BGSAVE는 백그라운드라 서비스에 영향이 전혀 없다.",
              "fork 순간 짧은 멈춤이 생기고, 쓰기가 많으면 Copy-on-Write로 메모리 사용량이 크게 늘 수 있습니다."
            ]
          ],
          answer: "RDB는 특정 시점의 메모리 전체를 압축 바이너리 파일로 저장하는 방식입니다. BGSAVE가 fork로 자식 프로세스를 만들어 Copy-on-Write로 스냅샷을 쓰므로 메인 프로세스는 계속 요청을 처리합니다. 파일이 작고 복구가 빠르지만, 마지막 스냅샷 이후 변경은 장애 시 유실됩니다.",
          analogy: "일정 시간마다 찍어 두는 사진과 같습니다. 사진으로 금방 복원할 수 있지만, 마지막 사진 이후의 변화는 남지 않습니다.",
          qa: [
            "Redis의 RDB와 AOF의 차이는 무엇인가요?",
            "RDB는 특정 시점 메모리 전체를 바이너리 스냅샷으로 저장해 파일이 작고 복구가 빠르지만, 마지막 스냅샷 이후 변경은 유실될 수 있습니다. AOF는 모든 쓰기 명령을 로그로 남겨 everysec 설정이면 최대 1초 정도만 유실되지만 파일이 크고 복구가 느립니다. 그래서 보통 둘을 함께 쓰고, 최신 Redis는 AOF 안에 RDB 형식 베이스를 포함하는 하이브리드 방식을 기본으로 씁니다."
          ],
          followUps: [
            [
              "RDB 저장 중 메모리가 부족해지는 이유는?",
              "fork 후 부모가 데이터를 수정하면 그 페이지가 복사되기 때문에, 쓰기가 많은 시간대에는 메모리가 최대 두 배 가까이 필요할 수 있습니다. 그래서 maxmemory를 물리 메모리보다 넉넉히 낮게 잡습니다."
            ],
            [
              "캐시 전용 Redis에도 RDB를 켜야 하나요?",
              "원본이 DB에 있다면 꺼도 됩니다. 다만 재시작 직후 캐시가 비어 DB로 요청이 몰리는 콜드 스타트를 줄이려고 켜 두기도 합니다."
            ]
          ],
          related: ["cs/aof", "cs/redis-bokje"]
        },
        {
          id: "cs/aof",
          slug: "aof",
          title: "AOF",
          deep: true,
          def: "Append Only File. 데이터를 바꾸는 모든 쓰기 명령을 순서대로 파일 끝에 기록하고, 재시작할 때 그 명령을 다시 실행해 복구하는 영속성 방식이다.",
          why: "RDB만 쓰면 스냅샷 사이의 변경이 장애 때 사라진다. AOF는 명령 단위로 기록해 유실 범위를 1초 이하로 줄일 수 있다.",
          how: [
            "`appendfsync` 설정으로 디스크에 실제로 쓰는(fsync) 시점을 정한다.",
            "- always: 명령마다 fsync. 가장 안전하지만 매우 느리다.",
            "- everysec(기본, 권장): 1초마다 fsync. 장애 시 최대 약 1초 유실.",
            "- no: OS에 맡긴다. 빠르지만 유실 범위를 예측할 수 없다.",
            "AOF 재작성(rewrite): 같은 키를 100번 증가시키면 명령이 100줄 쌓인다. 파일이 커지면 백그라운드에서 현재 상태를 만드는 최소 명령으로 새 파일을 만든다(`BGREWRITEAOF`, 자동 조건 설정 가능).",
            "Redis 7부터는 멀티 파트 AOF로 베이스 파일과 증분 파일을 나눠 관리하고, `aof-use-rdb-preamble yes`(기본)면 베이스 파일을 RDB 형식으로 써서 로딩이 빠르다. 이것이 RDB와 AOF를 합친 하이브리드 방식이다.",
            "재시작할 때 AOF가 켜져 있으면 RDB보다 AOF를 우선해 복구한다."
          ],
          flow: ["쓰기 명령 실행", "AOF 버퍼에 명령 추가", "appendfsync 주기로 fsync", "크기 초과 시 백그라운드 재작성", "재시작 시 명령 재실행"],
          code: "# redis.conf\nappendonly yes\nappendfsync everysec\nauto-aof-rewrite-percentage 100   # 지난 재작성보다 2배 커지면\nauto-aof-rewrite-min-size 64mb\naof-use-rdb-preamble yes          # 하이브리드 (기본값)",
          codeLang: "java",
          use: ["세션이나 실시간 카운터처럼 유실을 줄여야 하는 Redis에 `appendonly yes`, `appendfsync everysec`을 설정한다."],
          warn: [
            "캐시 전용 Redis는 영속성을 꺼서 디스크 I/O와 fork 비용을 없애는 것도 선택지다. 원본 데이터가 DB에 있기 때문이다.",
            "디스크가 느리면 everysec에서도 fsync가 밀려 지연이 생길 수 있다."
          ],
          myth: [
            [
              "AOF를 켜면 데이터가 절대 유실되지 않는다.",
              "everysec이면 최대 약 1초, 비동기 복제 구조에서는 장애 전환 때 추가 유실이 생길 수 있습니다. always는 안전하지만 매우 느립니다."
            ]
          ],
          answer: "AOF는 모든 쓰기 명령을 파일 끝에 기록하고 재시작할 때 다시 실행해 복구하는 방식입니다. appendfsync를 everysec으로 두면 장애 시 약 1초만 유실되고, 파일이 커지면 현재 상태를 만드는 최소 명령으로 재작성합니다. 최신 Redis는 RDB 형식 베이스와 AOF 증분을 합친 하이브리드 방식을 기본으로 씁니다.",
          analogy: "가계부에 거래를 한 줄씩 적어 두는 것과 같습니다. 처음부터 다시 계산하면 잔액을 정확히 복원할 수 있지만, 기록이 길어지면 요약해서 다시 적어야 합니다.",
          qa: [
            "AOF의 fsync 정책과 재작성(rewrite)을 설명해 주세요.",
            "AOF는 쓰기 명령을 파일에 계속 추가하는데, 디스크에 실제로 반영하는 시점을 appendfsync로 정합니다. always는 매 명령, everysec은 1초마다, no는 OS에 맡기며 보통 everysec으로 성능과 안전성을 절충합니다. 명령이 계속 쌓이면 파일이 커지므로 현재 상태를 만드는 최소 명령만으로 파일을 다시 쓰는 재작성을 백그라운드에서 수행합니다."
          ],
          followUps: [
            ["RDB와 AOF가 모두 있으면 재시작할 때 무엇을 쓰나요?", "AOF가 켜져 있으면 AOF를 우선해 복구합니다. AOF가 더 최신 상태를 담고 있기 때문입니다."],
            [
              "AOF 파일이 깨지면 어떻게 하나요?",
              "마지막 명령이 불완전하게 기록된 경우가 많아 redis-check-aof로 잘린 부분을 정리하고 시작합니다. aof-load-truncated 설정이 켜져 있으면 끝부분이 잘린 파일도 자동으로 불러옵니다."
            ]
          ],
          related: ["cs/rdb-seunaepsyat", "cs/jisokseong"]
        }
      ]
    },
    {
      name: "만료와 메모리",
      compare: {
        cols: ["기준", "TTL과 만료 삭제", "메모리 eviction 정책"],
        rows: [
          ["동작 시점", "TTL이 지났을 때", "`maxmemory` 도달 시"],
          ["삭제 대상", "만료된 키", "정책에 따른 키(만료 전 포함)"],
          ["방식", "지연 삭제 + 주기적 샘플링", "LRU, LFU, random, noeviction"],
          ["설정", "`EXPIRE`, `SET ... EX`", "`maxmemory-policy`"]
        ]
      },
      concepts: [
        {
          id: "cs/ttlgwa-manryo-sakje",
          slug: "ttlgwa-manryo-sakje",
          title: "TTL과 만료 삭제",
          deep: true,
          def: "키에 만료 시간을 지정하면 그 시간이 지난 키를 Redis가 지연 삭제와 주기적 샘플링 삭제 두 방식으로 지운다.",
          why: "캐시는 오래된 데이터를 자동으로 버려야 메모리를 아끼고 최신 데이터로 교체된다. 만료가 어떻게 동작하는지 알아야 메모리 사용량과 지연 문제를 예측할 수 있다.",
          how: [
            "- 설정: `SET key v EX 60`, `EXPIRE key 60`, `PEXPIRE`(밀리초), `EXPIREAT`(특정 시각). `TTL key`로 남은 시간을 확인한다(-1은 만료 없음, -2는 키 없음).",
            "- `SET`으로 값을 다시 쓰면 기존 TTL이 사라진다. 유지하려면 `KEEPTTL` 옵션을 쓴다.",
            "만료된 키를 지우는 방식은 두 가지다.",
            "1) 지연 삭제(passive): 클라이언트가 키에 접근할 때 만료됐는지 확인하고, 만료됐으면 그때 지운다.",
            "2) 주기적 삭제(active): 초당 여러 번 만료 시간이 있는 키 중 일부를 무작위로 골라 만료된 것을 지운다. 만료된 비율이 높으면 같은 과정을 반복한다.",
            "두 방식을 함께 써서, 아무도 접근하지 않는 만료 키도 결국 정리되고 CPU도 과하게 쓰지 않는다.",
            "복제본(replica)은 스스로 만료 키를 지우지 않고 마스터가 보낸 삭제 명령을 따른다. 다만 읽기 요청에는 만료된 키를 없는 것으로 응답한다."
          ],
          flow: ["SET EX로 TTL 지정", "접근 시 만료 확인 후 삭제", "주기적으로 일부 키 샘플링", "만료 비율 높으면 반복", "복제본은 마스터 삭제 따름"],
          code: "SET product:1001 '{...}' EX 300     # 5분 캐시\nTTL product:1001                      # 남은 초\nSET product:1001 '{...}' KEEPTTL     # 값만 갱신, TTL 유지\n\n// 캐시 스탬피드 완화: TTL에 무작위 값 더하기\nlong ttl = 300 + ThreadLocalRandom.current().nextInt(60);\nredisTemplate.opsForValue().set(key, json, Duration.ofSeconds(ttl));",
          codeLang: "java",
          use: [
            "인증번호를 `SET verify:{phone} 123456 EX 180`으로 3분 뒤 자동 만료되게 저장한다.",
            "대량 캐시 적재 시 TTL에 0~60초 무작위 값을 더해 동시 만료를 피한다."
          ],
          warn: [
            "같은 시각에 대량의 키를 같은 TTL로 넣으면 한꺼번에 만료되어 DB로 요청이 몰린다. TTL에 무작위 값을 더해 흩어 놓는다.",
            "만료가 정확한 시각에 메모리에서 사라진다는 보장은 없다. 주기적 삭제가 따라잡기 전까지 메모리를 차지할 수 있다."
          ],
          myth: [["SET으로 값을 갱신해도 기존 TTL은 유지된다.", "SET은 기존 TTL을 지웁니다. 유지하려면 KEEPTTL 옵션을 써야 합니다."]],
          answer: "Redis는 키에 TTL을 줄 수 있고, 만료된 키를 지연 삭제와 주기적 삭제 두 방식으로 지웁니다. 지연 삭제는 키에 접근할 때 확인해 지우고, 주기적 삭제는 만료 키를 무작위로 샘플링해 지우며 만료 비율이 높으면 반복합니다. 그래서 접근되지 않는 키도 결국 정리되면서 CPU를 과하게 쓰지 않습니다.",
          analogy: "냉장고 정리와 같습니다. 음식을 꺼낼 때 유통기한을 확인해 버리고, 틈틈이 몇 개씩 골라 확인해서 오래된 것을 치웁니다.",
          qa: [
            "Redis는 만료된 키를 어떻게 삭제하나요?",
            "두 가지 방식을 함께 씁니다. 하나는 키에 접근할 때 만료 여부를 확인해 지우는 지연 삭제이고, 다른 하나는 주기적으로 만료 시간이 있는 키를 무작위로 샘플링해 만료된 키를 지우는 능동 삭제입니다. 샘플 중 만료된 비율이 높으면 반복해서 지웁니다. 이렇게 하면 접근되지 않는 키도 결국 정리되면서 CPU를 과도하게 쓰지 않습니다."
          ],
          followUps: [
            [
              "만료 시각에 키가 정확히 메모리에서 사라지나요?",
              "접근 시점에는 정확히 없는 것으로 처리되지만, 메모리에서 실제로 지워지는 시점은 주기적 삭제가 따라잡을 때까지 늦어질 수 있습니다. 만료 키가 매우 많으면 메모리가 예상보다 오래 차 있을 수 있습니다."
            ],
            ["TTL이 -1과 -2는 무엇을 뜻하나요?", "-1은 키는 있지만 만료 시간이 없다는 뜻이고, -2는 키가 존재하지 않는다는 뜻입니다."]
          ],
          related: ["cs/memori-eviction-jeongchaek", "cs/kaesi-seutaempideu", "cs/redis-kaesi-hwalyong"]
        },
        {
          id: "cs/memori-eviction-jeongchaek",
          slug: "memori-eviction-jeongchaek",
          title: "메모리 eviction 정책",
          deep: false,
          def: "`maxmemory`에 도달했을 때 새 데이터를 위해 어떤 키를 내보낼지 정하는 `maxmemory-policy` 설정이다.",
          why: "메모리가 가득 찼을 때 쓰기가 실패할지, 어떤 키를 지울지를 용도에 맞게 미리 정해 두기 위해서다.",
          how: [
            "- noeviction(기본): 아무것도 지우지 않고 쓰기 명령에 오류를 낸다.",
            "- allkeys-lru: 모든 키 중 가장 오래 사용되지 않은 키를 지운다. 캐시 용도에서 가장 흔한 선택이다.",
            "- allkeys-lfu: 모든 키 중 사용 빈도가 가장 낮은 키를 지운다(Redis 4.0+). 인기 키가 확실히 구분될 때 유리하다.",
            "- volatile-lru / volatile-lfu: TTL이 있는 키 중에서만 고른다.",
            "- volatile-ttl: 만료가 가장 임박한 키부터 지운다.",
            "- allkeys-random / volatile-random: 무작위로 지운다.",
            "Redis의 LRU, LFU는 정확한 계산이 아니라 일부 키를 샘플링(`maxmemory-samples`, 기본 5)해 근사한다. 샘플 수를 늘리면 정확해지지만 CPU를 더 쓴다."
          ],
          use: ["캐시 전용 인스턴스는 `allkeys-lru`, 세션·락 인스턴스는 `noeviction`으로 나눠 운영한다."],
          warn: ["세션이나 분산 락처럼 사라지면 안 되는 데이터와 캐시를 같은 인스턴스에 두면 eviction으로 함께 지워질 수 있다. 용도별로 인스턴스를 나눈다."],
          answer: "메모리 eviction 정책은 maxmemory에 도달했을 때 어떤 키를 지울지 정하는 설정입니다. 기본 noeviction은 쓰기를 오류로 거부하고, 캐시 용도에는 allkeys-lru나 allkeys-lfu를 주로 씁니다. Redis의 LRU와 LFU는 일부 키를 샘플링해 근사하는 방식입니다.",
          followUps: [
            [
              "LRU와 LFU 중 무엇을 고르나요?",
              "최근에 쓴 데이터가 다시 쓰일 가능성이 높으면 LRU, 일부 인기 키가 꾸준히 많이 쓰이면 LFU가 유리합니다. 한 번 대량 조회된 데이터가 인기 키를 밀어내는 문제는 LFU가 덜 겪습니다."
            ]
          ],
          related: ["cs/ttlgwa-manryo-sakje", "cs/kaesi-manryowa-gyoche", "cs/peiji-gyoche-algorijeum"]
        }
      ]
    },
    {
      name: "활용 패턴",
      compare: {
        cols: ["기준", "Redis Pub/Sub", "Redis Streams"],
        rows: [
          ["메시지 저장", "저장 안 함", "로그로 저장"],
          ["끊긴 동안 메시지", "유실", "다시 읽을 수 있음"],
          ["처리 확인", "없음", "XACK, Pending 목록"],
          ["대표 용도", "실시간 알림 전파", "가벼운 작업 큐"]
        ]
      },
      concepts: [
        {
          id: "cs/redis-kaesi-hwalyong",
          slug: "redis-kaesi-hwalyong",
          title: "Redis 캐시 활용",
          deep: false,
          def: "DB 조회 결과를 Redis에 TTL과 함께 저장해 두고, 다음 요청은 DB 대신 Redis에서 응답해 지연 시간과 DB 부하를 줄이는 방식이다.",
          why: "같은 데이터를 반복 조회할 때마다 DB를 거치면 응답이 느려지고 DB가 트래픽을 감당하지 못하기 때문이다.",
          how: [
            "- 대부분 Cache-Aside를 쓴다. Redis를 먼저 조회하고, 없으면 DB에서 읽어 Redis에 넣는다. 데이터를 수정하면 캐시를 삭제한다.",
            "- 스프링에서는 `@Cacheable`, `@CacheEvict`와 `RedisCacheManager`로 적용한다. 직렬화는 JSON(`GenericJackson2JsonRedisSerializer`)을 많이 쓴다.",
            "- 키 규칙: `서비스:엔티티:id` 형태(`shop:product:1001`)로 정하고, 스키마가 바뀌면 버전을 붙여(`v2`) 예전 캐시와 섞이지 않게 한다.",
            "- 로컬 캐시(Caffeine)와 함께 2단계로 두면 Redis 왕복까지 줄일 수 있지만, 서버 간 값이 달라지는 문제를 관리해야 한다.",
            "Redis 장애 시에도 서비스가 동작하도록 캐시 조회 실패는 DB 조회로 넘기고, 타임아웃을 짧게 둔다."
          ],
          flow: ["Redis에서 키 조회", "있으면 바로 응답", "없으면 DB 조회", "결과를 TTL과 함께 저장", "데이터 수정 시 키 삭제"],
          code: "@Cacheable(cacheNames = \"product\", key = \"#id\")\npublic ProductDto find(Long id) { return toDto(repo.findById(id).orElseThrow()); }\n\n@CacheEvict(cacheNames = \"product\", key = \"#id\")\npublic void update(Long id, UpdateRequest req) { ... }",
          codeLang: "java",
          use: [
            "상품 상세를 `@Cacheable(cacheNames = \"product\")`로 캐시하고 상품 수정 API에서 `@CacheEvict`로 지운다.",
            "캐시 키에 `v2`를 붙여 DTO 구조를 바꾼 배포 후 예전 캐시와 섞이지 않게 한다."
          ],
          warn: ["DB 변경과 캐시 삭제 사이에 다른 요청이 옛 값을 다시 캐시에 넣는 경쟁이 생길 수 있다. 짧은 TTL로 피해를 제한한다."],
          myth: [
            [
              "캐시를 갱신(update)하는 것이 삭제보다 정확하다.",
              "동시 요청에서 갱신 순서가 뒤바뀌면 옛 값이 남을 수 있습니다. 수정 시에는 캐시를 지우고 다음 조회에서 다시 채우는 편이 안전합니다."
            ]
          ],
          answer: "Redis 캐시는 DB 조회 결과를 TTL과 함께 저장해 다음 요청을 Redis에서 응답하는 방식으로, 보통 Cache-Aside 패턴을 씁니다. 스프링에서는 @Cacheable과 @CacheEvict로 적용하고, 키 규칙과 직렬화 방식을 정해 둡니다. Redis 장애 시 DB로 넘어가도록 짧은 타임아웃을 두는 것이 중요합니다.",
          followUps: [
            [
              "캐시와 DB의 정합성이 깨지는 상황과 대응은?",
              "DB를 수정하고 캐시를 지우는 사이에 다른 요청이 옛 값을 다시 캐시에 넣을 수 있습니다. 짧은 TTL로 피해 기간을 줄이고, 중요한 데이터는 삭제를 지연 후 한 번 더 하거나 캐시를 쓰지 않습니다."
            ]
          ],
          related: ["cs/cache-aside", "cs/kaesi-seutaempideu", "cs/ttlgwa-manryo-sakje", "cs/hatki-munje"]
        },
        {
          id: "cs/redis-sesyeon-jeojangso",
          slug: "redis-sesyeon-jeojangso",
          title: "Redis 세션 저장소",
          deep: false,
          def: "서버 메모리 대신 Redis에 HTTP 세션을 저장해, 서버가 여러 대여도 어느 서버로 요청이 가든 같은 세션을 보게 하는 방식이다.",
          why: "서버 메모리에 세션을 두면 서버가 여러 대일 때 다른 서버로 간 요청이 로그인을 잃어버리기 때문이다.",
          how: [
            "- 스프링에서는 `spring-session-data-redis`를 추가하면 `HttpSession`이 자동으로 Redis에 저장된다. 코드 변경이 거의 없다.",
            "- 세션은 Hash로 저장되고, 세션 타임아웃이 TTL로 설정된다.",
            "- 로드 밸런서에서 스티키 세션을 쓰지 않아도 되어 서버를 자유롭게 늘리고 줄일 수 있다.",
            "- 로그아웃이나 강제 만료는 Redis에서 키를 지우면 즉시 반영된다. JWT보다 무효화가 쉽다.",
            "Redis가 단일 장애점이 되지 않도록 복제와 Sentinel 또는 Cluster로 가용성을 확보한다."
          ],
          use: [
            "오토스케일링되는 API 서버들이 Spring Session + Redis로 로그인 상태를 공유한다.",
            "관리자가 특정 사용자를 차단하면 해당 세션 키를 지워 즉시 로그아웃시킨다."
          ],
          answer: "Redis 세션 저장소는 서버 메모리 대신 Redis에 세션을 둬서 서버가 여러 대여도 같은 세션을 보게 하는 방식입니다. 스프링에서는 spring-session-data-redis만 추가하면 HttpSession이 Redis에 저장되고, 세션 타임아웃이 TTL이 됩니다. 스티키 세션 없이 서버를 자유롭게 늘릴 수 있고 강제 로그아웃도 쉽습니다.",
          analogy: "지점마다 따로 보관하던 고객 카드를 본사 서버 하나에 모아 두는 것과 같습니다. 어느 지점에 가도 같은 정보를 봅니다.",
          followUps: [
            [
              "Redis가 죽으면 세션은 어떻게 되나요?",
              "모든 사용자가 로그아웃되는 장애가 됩니다. 복제와 Sentinel 또는 Cluster로 가용성을 확보하고, 영속성(AOF)을 켜서 재시작 후에도 세션이 남게 합니다."
            ]
          ],
          related: ["cs/sesyeon", "cs/musangtae-seobeo", "cs/redis-sentinel"]
        },
        {
          id: "cs/redis-bunsan-rak",
          slug: "redis-bunsan-rak",
          title: "Redis 분산 락",
          deep: true,
          def: "여러 서버가 같은 자원을 동시에 처리하지 못하도록 Redis 키를 락으로 쓰는 방식으로, `SET key value NX PX`가 기본이다.",
          why: "서버가 여러 대면 `synchronized`는 각 JVM 안에서만 동작한다. 선착순 쿠폰 발급, 중복 결제 방지, 스케줄러 중복 실행 방지처럼 서버 사이에서 하나만 실행돼야 하는 작업에 쓴다.",
          how: [
            "1) 획득: `SET lock:coupon:10 <고유값> NX PX 30000`. 키가 없을 때만 저장(NX)하고, 30초 뒤 자동 만료(PX)되게 한다. 성공하면 락을 얻은 것이다.",
            "2) 고유값: 요청마다 UUID 같은 고유값을 넣어 \"내가 건 락\"인지 구분한다.",
            "3) 해제: Lua 스크립트로 \"값이 내 고유값과 같을 때만 삭제\"를 원자적으로 실행한다. 그냥 `DEL`하면 내 락이 만료된 뒤 다른 서버가 잡은 락을 지울 수 있다.",
            "4) 만료 시간: 작업 시간보다 넉넉히 잡는다. 작업이 더 길어질 수 있으면 락을 연장한다. Redisson은 워치독이 기본 30초 락을 주기적으로 연장해 준다.",
            "5) 대기: 락을 못 얻으면 재시도하는데, 스핀으로 계속 요청하면 Redis에 부하가 된다. Redisson은 Pub/Sub으로 해제 알림을 받아 대기한다.",
            "Redlock은 독립된 Redis 노드 5대 중 과반에서 락을 얻어야 성공으로 보는 알고리즘이다. 단일 노드 장애에 강하지만, 시계 오차나 GC 멈춤에 대한 안전성 논쟁(마틴 클레프만의 비판)이 있다.",
            "정합성이 절대적으로 중요하면 락만 믿지 말고 펜싱 토큰(증가하는 번호)을 함께 저장소에서 검증하거나, DB의 유니크 제약이나 비관적 락으로 한 번 더 막는다."
          ],
          flow: ["SET NX PX로 락 시도", "실패 시 해제 알림 대기", "성공하면 작업 실행", "트랜잭션 커밋", "Lua로 내 락만 해제"],
          code: "// Redisson\nRLock lock = redisson.getLock(\"lock:coupon:\" + couponId);\nif (lock.tryLock(3, 10, TimeUnit.SECONDS)) { // 최대 3초 대기, 10초 후 자동 해제\n    try {\n        couponService.issue(couponId, userId);\n    } finally {\n        if (lock.isHeldByCurrentThread()) lock.unlock();\n    }\n}\n\n-- 직접 구현 시 해제용 Lua (내 값일 때만 삭제)\nif redis.call('GET', KEYS[1]) == ARGV[1] then\n  return redis.call('DEL', KEYS[1])\nend\nreturn 0",
          codeLang: "sql",
          use: ["선착순 쿠폰 발급 API에서 쿠폰 ID별 락을 걸어 수량 초과 발급을 막는다.", "여러 서버에서 도는 정산 배치가 하루 한 번만 실행되도록 시작 시 락을 건다."],
          warn: [
            "만료 시간 없이 락을 걸면 락을 잡은 서버가 죽었을 때 영원히 풀리지 않는다.",
            "트랜잭션 안에서 락을 해제하면, 커밋 전에 다른 요청이 락을 얻어 아직 반영 안 된 데이터를 읽을 수 있다. 락은 트랜잭션 바깥에서 잡고, 커밋 후 해제한다.",
            "마스터-복제 비동기 복제 구조에서는 락을 건 직후 마스터가 죽으면 복제본에 락이 없어 두 서버가 동시에 락을 얻을 수 있다."
          ],
          myth: [["DEL로 락을 지우면 충분하다.", "내 락이 만료된 뒤 다른 요청이 잡은 락을 지울 수 있습니다. 값을 비교하고 지우는 동작을 Lua로 원자적으로 해야 합니다."]],
          answer: "Redis 분산 락은 SET NX PX로 키가 없을 때만 만료 시간과 함께 저장해 락을 잡고, 값에 요청별 고유값을 넣습니다. 해제는 Lua 스크립트로 내 고유값일 때만 지워 다른 요청의 락을 지우는 실수를 막습니다. 실무에서는 Redisson의 워치독과 Pub/Sub 대기를 쓰고, 트랜잭션 커밋 후에 락을 해제합니다.",
          analogy: "회의실 문에 이름과 종료 시각을 적은 예약 쪽지를 붙이는 것과 같습니다. 쪽지가 있으면 다른 사람은 기다리고, 시간이 지나면 쪽지는 자동으로 떨어지며, 내 쪽지만 내가 뗄 수 있습니다.",
          qa: [
            "Redis로 분산 락을 구현할 때 주의할 점은?",
            "SET NX PX로 키가 없을 때만 만료 시간과 함께 저장해 락을 잡고, 값에 요청별 고유값을 넣습니다. 해제할 때는 Lua 스크립트로 내 고유값일 때만 지워 다른 요청의 락을 지우는 실수를 막습니다. 만료 시간은 작업보다 넉넉히 두거나 Redisson 워치독으로 연장하고, 트랜잭션 커밋 이후에 락을 해제해야 합니다. 정합성이 매우 중요하면 DB 유니크 제약이나 펜싱 토큰으로 한 번 더 보호합니다."
          ],
          followUps: [
            [
              "락 만료 시간보다 작업이 오래 걸리면 어떻게 되나요?",
              "락이 먼저 풀려 다른 요청이 동시에 작업하게 됩니다. Redisson 워치독처럼 작업 중 주기적으로 만료를 연장하거나, 작업 시간을 넉넉히 측정해 만료를 잡고, 결과 저장 시 펜싱 토큰이나 DB 제약으로 한 번 더 검증합니다."
            ],
            [
              "트랜잭션 안에서 락을 해제하면 왜 문제가 되나요?",
              "락을 풀었는데 아직 커밋 전이라, 다음 요청이 락을 얻고 커밋 전 옛 데이터를 읽어 같은 처리를 반복할 수 있습니다. 락 획득은 트랜잭션 시작 전, 해제는 커밋 후에 해야 합니다."
            ],
            [
              "Redlock의 한계는 무엇인가요?",
              "독립된 노드 과반에서 락을 얻으면 단일 노드 장애에 강하지만, 시계 오차나 GC 멈춤으로 락이 만료된 줄 모르고 작업하는 경우를 막지 못한다는 비판이 있습니다. 정합성이 절대적이면 펜싱 토큰이나 합의 기반 시스템을 씁니다."
            ]
          ],
          related: ["cs/singgeul-seuredeu-ibenteu-rupeu", "cs/bigwanjeok-rak", "cs/redis-pub-sub"]
        },
        {
          id: "cs/redis-pub-sub",
          slug: "redis-pub-sub",
          title: "Redis Pub/Sub",
          deep: false,
          def: "발행자가 채널에 메시지를 보내면 그 순간 구독 중인 모든 클라이언트에게 전달하는 실시간 메시징 기능이다.",
          why: "채팅이나 서버 간 캐시 무효화 알림처럼 유실돼도 괜찮은 메시지를 지연 없이 여러 곳에 뿌리기 위해서다.",
          how: [
            "- `SUBSCRIBE chat:room1`, `PUBLISH chat:room1 \"hello\"`, 패턴 구독 `PSUBSCRIBE chat:*`.",
            "- 메시지를 저장하지 않는다(fire-and-forget). 구독자가 연결되어 있지 않거나 잠깐 끊기면 그 사이 메시지는 영원히 사라진다.",
            "- 전달 확인(ack)이나 재전송이 없다.",
            "- 활용: 여러 서버에 흩어진 웹소켓 연결로 채팅 메시지 전파, 로컬 캐시 무효화 알림, 설정 변경 알림.",
            "메시지 유실이 허용되지 않으면 Redis Streams나 Kafka를 쓴다. Redis 7의 Sharded Pub/Sub(`SPUBLISH`)은 Cluster에서 채널을 샤드별로 나눠 확장성을 높인다."
          ],
          use: [
            "웹소켓 서버가 여러 대일 때 채팅 메시지를 Redis 채널로 발행해 모든 서버가 자기 연결에 전달한다.",
            "관리자가 설정을 바꾸면 무효화 메시지를 발행해 각 서버의 로컬 캐시를 지운다."
          ],
          answer: "Redis Pub/Sub은 채널에 발행한 메시지를 그 순간 구독 중인 클라이언트에게 전달하는 기능입니다. 메시지를 저장하지 않아 구독자가 끊겨 있으면 메시지가 사라지고, 처리 확인도 없습니다. 여러 서버로 채팅 메시지나 캐시 무효화 신호를 퍼뜨리는 데 쓰고, 유실이 안 되면 Streams나 Kafka를 씁니다.",
          analogy: "라디오 방송과 같습니다. 켜 둔 사람만 듣고, 꺼져 있던 동안의 방송은 다시 들을 수 없습니다.",
          followUps: [
            [
              "Pub/Sub으로 결제 완료 이벤트를 전달해도 되나요?",
              "권하지 않습니다. 구독 서버가 재시작 중이면 메시지가 유실되고 재전송도 없습니다. 결제처럼 유실이 치명적인 이벤트는 Kafka나 Redis Streams처럼 저장과 처리 확인이 있는 수단을 씁니다."
            ]
          ],
          related: ["cs/redis-streams", "cs/mesiji-kyu", "cs/opjeobeo-paeteon"]
        },
        {
          id: "cs/redis-streams",
          slug: "redis-streams",
          title: "Redis Streams",
          deep: false,
          def: "메시지를 로그처럼 저장하고 소비자 그룹과 확인(ack)을 지원하는 Redis 5.0의 자료형으로, 가벼운 메시지 큐로 쓴다.",
          why: "Pub/Sub처럼 메시지를 잃지 않으면서 Kafka보다 가볍게 소비자 그룹과 ack가 있는 큐를 쓰기 위해서다.",
          how: [
            "- `XADD orders * id 1001 amount 5000`: 자동 생성 ID와 함께 메시지를 추가한다.",
            "- 소비자 그룹: `XGROUP CREATE`로 그룹을 만들고 `XREADGROUP`으로 읽으면 그룹 안의 소비자들이 메시지를 나눠 처리한다(Kafka 소비자 그룹과 비슷).",
            "- `XACK`로 처리 완료를 알린다. 확인되지 않은 메시지는 PEL(Pending Entries List)에 남아, `XPENDING`으로 조회하고 `XCLAIM`/`XAUTOCLAIM`으로 다른 소비자가 가져가 재처리할 수 있다.",
            "- 메시지가 저장되므로 소비자가 잠시 죽어도 다시 읽을 수 있다. `MAXLEN`으로 길이를 제한한다.",
            "Kafka보다 운영이 간단하지만, 메모리에 저장되므로 대용량·장기 보관이나 매우 높은 처리량에는 Kafka가 적합하다."
          ],
          flow: ["XADD로 메시지 추가", "XREADGROUP으로 분배 수신", "처리 후 XACK", "미확인은 Pending 목록", "XAUTOCLAIM으로 재처리"],
          use: ["주문 완료 후 알림 발송 작업을 Streams에 넣고 알림 서버 3대가 소비자 그룹으로 나눠 처리한다."],
          answer: "Redis Streams는 메시지를 로그처럼 저장하고 소비자 그룹과 처리 확인을 지원하는 자료형입니다. XADD로 추가하고 XREADGROUP으로 그룹 안 소비자들이 나눠 읽으며, XACK하지 않은 메시지는 Pending 목록에 남아 재처리할 수 있습니다. Kafka보다 운영이 간단하지만 메모리 기반이라 대용량 장기 보관에는 적합하지 않습니다.",
          followUps: [
            [
              "같은 메시지가 두 번 처리될 수 있나요?",
              "처리 후 XACK 전에 소비자가 죽으면 다른 소비자가 Pending 메시지를 가져가 다시 처리합니다. 최소 한 번 전달이므로 소비자는 메시지 ID로 처리 여부를 기록하는 식으로 멱등하게 만듭니다."
            ]
          ],
          related: ["cs/redis-pub-sub", "cs/kafka", "cs/myeokdeung-sobija"]
        }
      ]
    },
    {
      name: "고가용성 · 확장",
      compare: {
        cols: ["기준", "Redis 복제", "Redis Sentinel", "Redis Cluster"],
        rows: [
          ["목적", "데이터 사본, 읽기 분산", "자동 장애 전환", "샤딩 + 장애 전환"],
          ["자동 failover", "없음", "있음", "있음"],
          ["데이터 분산", "없음 (전체 복사)", "없음", "16384 슬롯 분산"],
          ["다중 키 명령", "제한 없음", "제한 없음", "같은 슬롯만 가능"]
        ]
      },
      concepts: [
        {
          id: "cs/redis-bokje",
          slug: "redis-bokje",
          title: "Redis 복제",
          deep: false,
          def: "마스터의 데이터를 하나 이상의 복제본(replica)에 비동기로 복사해 읽기를 분산하고 장애에 대비하는 구성이다.",
          why: "마스터 한 대만 두면 장애 시 데이터와 서비스를 모두 잃고 읽기 부하도 한 곳에 몰리기 때문이다.",
          how: [
            "1) 복제본이 처음 연결되면 마스터가 RDB 스냅샷을 만들어 보내고(전체 동기화), 그동안 들어온 쓰기 명령도 이어서 보낸다.",
            "2) 이후에는 마스터가 실행한 쓰기 명령을 실시간으로 복제본에 전달한다.",
            "3) 연결이 잠깐 끊겼다 돌아오면 복제 백로그 버퍼에 남은 부분만 보내는 부분 동기화를 시도한다.",
            "- 복제는 비동기라 마스터가 응답한 쓰기가 복제본에 반영되기 전에 마스터가 죽으면 그 쓰기는 유실된다. `WAIT` 명령으로 복제 완료를 기다릴 수 있지만 강한 일관성을 보장하지는 않는다.",
            "- 복제본은 기본적으로 읽기 전용이다. 읽기를 복제본으로 보내면 복제 지연 때문에 방금 쓴 값이 안 보일 수 있다.",
            "복제만으로는 마스터 장애 시 자동 전환이 되지 않으므로 Sentinel이나 Cluster를 함께 쓴다."
          ],
          flow: ["복제본이 마스터에 연결", "마스터가 RDB 전송", "이후 쓰기 명령 실시간 전달", "끊기면 백로그로 부분 동기화"],
          use: ["조회가 많은 랭킹 데이터를 복제본에서 읽어 마스터 부하를 나눈다."],
          answer: "Redis 복제는 마스터의 데이터를 복제본에 비동기로 복사하는 구성입니다. 처음에는 RDB로 전체 동기화를 하고, 이후 쓰기 명령을 실시간으로 전달하며, 잠깐 끊기면 백로그로 부분 동기화를 합니다. 비동기라 마스터 장애 시 마지막 쓰기가 유실될 수 있고, 자동 장애 전환은 Sentinel이나 Cluster가 맡습니다.",
          followUps: [
            [
              "복제본에서 읽으면 어떤 문제가 생길 수 있나요?",
              "복제 지연 때문에 방금 마스터에 쓴 값이 복제본에 아직 없을 수 있습니다. 쓰고 바로 읽어야 하는 데이터는 마스터에서 읽습니다."
            ]
          ],
          related: ["cs/repeulrikeisyeon", "cs/redis-sentinel", "cs/rdb-seunaepsyat"]
        },
        {
          id: "cs/redis-sentinel",
          slug: "redis-sentinel",
          title: "Redis Sentinel",
          deep: false,
          def: "마스터와 복제본을 감시하다가 마스터가 죽으면 복제본 하나를 새 마스터로 자동 승격(failover)시키는 고가용성 시스템이다.",
          why: "마스터가 죽었을 때 사람이 직접 복제본을 승격하면 그 사이 쓰기가 모두 실패하기 때문이다.",
          how: [
            "- 보통 Sentinel 프로세스를 3개 이상(홀수) 서로 다른 서버에 둔다.",
            "- 한 Sentinel이 마스터 응답이 없다고 판단하면(주관적 다운), 정해진 수(quorum) 이상의 Sentinel이 동의할 때 객관적 다운으로 확정한다.",
            "- Sentinel끼리 리더를 뽑고, 리더가 가장 적합한 복제본을 새 마스터로 승격한 뒤 나머지 복제본이 새 마스터를 따르게 한다.",
            "- 클라이언트는 Sentinel에게 현재 마스터 주소를 물어 연결한다. 스프링 `RedisSentinelConfiguration`, Lettuce가 지원한다.",
            "데이터를 나누는(샤딩) 기능은 없으므로, 한 서버 메모리에 다 들어가는 규모에서 가용성만 높일 때 쓴다."
          ],
          flow: ["Sentinel이 마스터 감시", "응답 없으면 주관적 다운", "quorum 동의로 객관적 다운", "리더 선출 후 복제본 승격", "클라이언트가 새 마스터 연결"],
          use: ["세션 저장용 Redis를 마스터 1대, 복제본 2대, Sentinel 3대로 구성해 마스터 장애 시 자동 전환한다."],
          warn: ["장애 전환 중 수 초~수십 초 동안 쓰기가 실패할 수 있고, 비동기 복제라 마지막 쓰기 일부가 유실될 수 있다."],
          answer: "Redis Sentinel은 마스터와 복제본을 감시하다가 마스터가 죽으면 복제본을 새 마스터로 자동 승격하는 고가용성 시스템입니다. 보통 3개 이상의 Sentinel이 quorum 이상 동의해야 장애로 확정하고, 리더 Sentinel이 장애 전환을 진행합니다. 샤딩 기능은 없어서 데이터가 한 서버에 들어갈 때 가용성만 높이는 용도입니다.",
          followUps: [
            [
              "Sentinel을 2개만 두면 어떤 문제가 있나요?",
              "하나가 죽으면 과반 동의를 얻지 못해 장애 전환을 못 할 수 있고, 네트워크가 둘로 나뉘면 판단이 갈립니다. 그래서 서로 다른 서버에 홀수 개, 보통 3개 이상을 둡니다."
            ]
          ],
          related: ["cs/redis-bokje", "cs/redis-cluster"]
        },
        {
          id: "cs/redis-cluster",
          slug: "redis-cluster",
          title: "Redis Cluster",
          deep: true,
          def: "데이터를 16384개의 해시 슬롯으로 나눠 여러 마스터 노드에 분산 저장하고, 노드마다 복제본을 두어 확장성과 가용성을 함께 얻는 구성이다.",
          why: "데이터가 한 서버 메모리보다 커지거나 쓰기 처리량이 한 노드의 한계를 넘으면 수평 확장이 필요하다. Cluster는 별도 프록시 없이 Redis 자체로 샤딩과 장애 전환을 제공한다.",
          how: [
            "1) 키의 슬롯은 `CRC16(key) mod 16384`로 계산한다. 각 마스터 노드가 슬롯 범위를 나눠 맡는다(예: 3대면 0~5460, 5461~10922, 10923~16383).",
            "2) 클라이언트가 엉뚱한 노드에 요청하면 노드가 `MOVED 슬롯 주소`로 올바른 노드를 알려 준다. 스마트 클라이언트(Lettuce, Redisson)는 슬롯 표를 캐시해 처음부터 맞는 노드로 보낸다.",
            "3) 슬롯을 옮기는 중(리샤딩)에는 `ASK` 응답으로 일시적으로 다른 노드를 안내한다.",
            "4) 노드끼리 가십 프로토콜로 상태를 주고받고, 마스터가 죽으면 과반수 마스터의 동의로 그 복제본이 마스터로 승격된다.",
            "- 여러 키를 한 번에 다루는 명령(`MGET`, 트랜잭션, Lua)은 모든 키가 같은 슬롯에 있어야 한다. 해시 태그 `{user:1}:cart`, `{user:1}:profile`처럼 중괄호 안 부분만 해시해 같은 슬롯에 모을 수 있다.",
            "- 데이터베이스 번호는 0번만 쓸 수 있다."
          ],
          flow: ["CRC16(key) mod 16384", "슬롯 담당 노드 결정", "잘못 가면 MOVED 응답", "클라이언트가 슬롯 표 갱신", "마스터 장애 시 복제본 승격"],
          code: "# 같은 슬롯에 모으기 (해시 태그)\nSET {user:1001}:cart  '...'\nSET {user:1001}:point 300\nMGET {user:1001}:cart {user:1001}:point   # 같은 슬롯이라 가능\n\n# spring application.yml\nspring:\n  data:\n    redis:\n      cluster:\n        nodes: redis-1:6379,redis-2:6379,redis-3:6379",
          codeLang: "java",
          use: [
            "메모리 100GB가 필요한 캐시를 마스터 6대 클러스터로 나눠 저장한다.",
            "사용자별 장바구니와 포인트 키에 `{user:1001}` 해시 태그를 붙여 MGET과 Lua 스크립트를 쓸 수 있게 한다."
          ],
          warn: [
            "해시 태그를 과하게 쓰면 한 슬롯에 데이터가 몰려 특정 노드만 바빠진다.",
            "마스터 과반이 죽거나 어떤 슬롯을 맡은 마스터와 복제본이 모두 죽으면 기본 설정에서 클러스터 전체가 쓰기를 거부한다(`cluster-require-full-coverage`)."
          ],
          myth: [["Cluster면 노드를 늘리는 만큼 모든 요청이 분산된다.", "키 하나는 한 노드에만 있으므로 특정 핫키에 몰린 요청은 노드를 늘려도 분산되지 않습니다."]],
          answer: "Redis Cluster는 키를 CRC16으로 해시해 16384개 슬롯에 배정하고, 여러 마스터가 슬롯을 나눠 맡는 샤딩 구성입니다. 잘못된 노드로 요청하면 MOVED로 올바른 노드를 알려 주고, 마스터마다 복제본을 두어 장애 시 자동 승격합니다. 여러 키를 함께 다루려면 해시 태그로 같은 슬롯에 모아야 합니다.",
          analogy: "16384개 사물함을 여러 관리인이 구역을 나눠 맡는 것과 같습니다. 사물함 번호만 알면 어느 관리인에게 가야 하는지 정해집니다.",
          qa: [
            "Redis Cluster는 데이터를 어떻게 분산하나요?",
            "키를 CRC16으로 해시해 16384개 슬롯 중 하나에 배정하고, 각 마스터 노드가 슬롯 범위를 나눠 맡습니다. 클라이언트가 잘못된 노드에 요청하면 MOVED 응답으로 올바른 노드를 알려 주고, 스마트 클라이언트는 슬롯 표를 캐시합니다. 마스터마다 복제본을 두어 장애 시 자동 승격되며, 여러 키를 함께 다루려면 해시 태그로 같은 슬롯에 모아야 합니다."
          ],
          followUps: [
            [
              "왜 슬롯 수가 16384인가요?",
              "노드끼리 주고받는 가십 메시지에 슬롯 소유 비트맵이 들어가는데, 16384개면 2KB로 충분히 작으면서 1000대 정도 노드까지 고르게 나눌 수 있기 때문입니다."
            ],
            [
              "MOVED와 ASK의 차이는?",
              "MOVED는 슬롯 담당이 영구적으로 다른 노드라는 뜻이라 클라이언트가 슬롯 표를 갱신합니다. ASK는 리샤딩 중 일시적으로 다른 노드를 보라는 뜻이라 그 요청만 다른 노드로 보내고 표는 바꾸지 않습니다."
            ]
          ],
          related: ["cs/redis-sentinel", "cs/db-syading", "cs/haesi-hamsu", "cs/cap-jeongri"]
        }
      ]
    },
    {
      name: "운영 문제",
      compare: {
        cols: ["개념", "원인", "증상", "해결"],
        rows: [
          ["핫키 문제", "특정 키에 요청 집중", "노드 하나만 과부하", "로컬 캐시, 키 복제·분산"],
          ["빅키 문제", "값·원소가 너무 큼", "지연, 네트워크·삭제 부하", "키 분할, `UNLINK`"],
          ["블로킹 명령 주의", "`KEYS *` 등 O(N) 명령", "모든 요청 일시 정지", "`SCAN` 계열 사용"]
        ]
      },
      concepts: [
        {
          id: "cs/hatki-munje",
          slug: "hatki-munje",
          title: "핫키 문제",
          deep: false,
          def: "특정 키 하나에 요청이 몰려 그 키를 가진 노드 하나만 과부하가 걸리는 문제다(인기 상품, 실시간 이벤트).",
          why: "노드를 늘려도 특정 키 하나에 몰린 요청은 분산되지 않아 한 노드가 전체 장애를 일으킬 수 있기 때문이다.",
          how: [
            "Cluster에서는 키 하나가 한 노드에만 있으므로 노드를 늘려도 분산되지 않는다.",
            "- 로컬 캐시: 애플리케이션 서버에 아주 짧은 TTL(수 초)의 로컬 캐시를 두어 Redis 요청 자체를 줄인다.",
            "- 키 복제: `product:1001:copy1`~`copy5`처럼 같은 값을 여러 키로 복사해 두고 무작위로 골라 읽는다. 갱신할 때 모두 바꿔야 한다.",
            "- 읽기 복제본 활용: 읽기를 복제본으로 분산한다.",
            "- 탐지: `redis-cli --hotkeys`(LFU 정책 필요), 모니터링 도구로 키별 접근 빈도를 본다."
          ],
          use: ["라이브 이벤트 상품 정보를 애플리케이션 로컬 캐시에 3초 동안 두어 Redis 요청을 크게 줄인다."],
          answer: "핫키 문제는 특정 키 하나에 요청이 몰려 그 키를 가진 노드만 과부하가 걸리는 문제입니다. Cluster에서도 키 하나는 한 노드에만 있어 분산되지 않습니다. 짧은 TTL의 로컬 캐시를 앞에 두거나, 같은 값을 여러 키로 복제해 무작위로 읽거나, 복제본으로 읽기를 나눠 해결합니다.",
          analogy: "맛집 한 곳에만 줄이 길게 늘어선 푸드코트와 같습니다. 매장을 더 열어도 그 맛집 줄은 줄지 않습니다.",
          followUps: [
            [
              "핫키는 어떻게 찾나요?",
              "LFU 정책에서 redis-cli --hotkeys로 접근 빈도가 높은 키를 볼 수 있고, 애플리케이션에서 키별 요청 수를 샘플링해 메트릭으로 남기거나 MONITOR를 아주 짧게 써서 확인합니다. MONITOR는 부하가 커서 운영에서는 조심해야 합니다."
            ]
          ],
          related: ["cs/bikki-munje", "cs/redis-kaesi-hwalyong", "cs/kaesi-seutaempideu"]
        },
        {
          id: "cs/bikki-munje",
          slug: "bikki-munje",
          title: "빅키 문제",
          deep: false,
          def: "값이 매우 크거나(수 MB 문자열) 원소가 매우 많은(수십만 개 Hash, Sorted Set) 키가 단일 스레드 Redis 전체를 느리게 만드는 문제다.",
          why: "단일 스레드 Redis에서 큰 키 하나를 읽거나 지우는 동안 다른 모든 요청이 멈추기 때문이다.",
          how: [
            "- 큰 키를 읽거나 지우는 명령이 오래 걸려 그동안 다른 모든 요청이 기다린다.",
            "- 네트워크 대역폭을 많이 쓰고, Cluster에서는 한 노드의 메모리만 불균형하게 커진다.",
            "- 해결: 키를 기간이나 ID 범위로 쪼갠다(`rank:2026-10`, `cart:{user}:0..9`). 자주 쓰는 필드만 따로 저장한다.",
            "- 삭제: `DEL` 대신 `UNLINK`를 쓰면 키를 즉시 목록에서 빼고 실제 메모리 해제는 백그라운드 스레드가 한다. `lazyfree-lazy-eviction`, `lazyfree-lazy-expire` 설정도 같은 효과를 준다.",
            "- 탐지: `redis-cli --bigkeys`, `MEMORY USAGE key`."
          ],
          use: ["누적 랭킹 Sorted Set을 월별 키로 나누고, 지난 달 키는 `UNLINK`로 지운다.", "배포 전 `redis-cli --bigkeys`로 큰 키를 점검한다."],
          answer: "빅키는 값이 수 MB이거나 원소가 수십만 개인 키로, 읽기나 삭제가 오래 걸려 단일 스레드 Redis 전체를 멈추게 합니다. 네트워크와 Cluster 노드 메모리 불균형도 일으킵니다. 키를 기간이나 범위로 쪼개고, 삭제는 DEL 대신 UNLINK로 백그라운드에서 처리합니다.",
          followUps: [
            [
              "DEL과 UNLINK의 차이는?",
              "DEL은 메모리 해제까지 메인 스레드에서 해서 큰 키면 오래 멈춥니다. UNLINK는 키를 즉시 보이지 않게 하고 실제 메모리 해제는 백그라운드 스레드에 맡깁니다."
            ]
          ],
          related: ["cs/hatki-munje", "cs/beulroking-myeongryeong-juui", "cs/sorted-set"]
        },
        {
          id: "cs/beulroking-myeongryeong-juui",
          slug: "beulroking-myeongryeong-juui",
          title: "블로킹 명령 주의",
          deep: false,
          def: "단일 스레드인 Redis에서 전체 키나 큰 컬렉션을 한 번에 다루는 명령은 실행되는 동안 모든 요청을 멈추게 한다.",
          why: "`KEYS` 같은 명령 하나가 단일 스레드를 수 초간 점유하면 운영 중인 전체 서비스가 멈추기 때문이다.",
          how: [
            "- `KEYS pattern`: 모든 키를 훑는다. 운영에서는 금지하고, 커서로 조금씩 훑는 `SCAN`을 쓴다(`HSCAN`, `SSCAN`, `ZSCAN`도 같은 방식).",
            "- `FLUSHALL`, `FLUSHDB`: 동기 실행 시 멈춤이 생긴다. `ASYNC` 옵션을 쓴다.",
            "- `HGETALL`, `SMEMBERS`, `LRANGE 0 -1`: 원소가 많으면 오래 걸린다.",
            "- 오래 도는 Lua 스크립트, `SAVE`도 마찬가지다.",
            "- `SLOWLOG GET`으로 느린 명령 기록을 확인하고, `rename-command`나 ACL로 위험한 명령을 막아 둔다."
          ],
          use: ["운영 Redis에서 ACL로 `KEYS`, `FLUSHALL`을 차단하고, 키 정리 배치는 `SCAN` + `UNLINK`로 조금씩 처리한다."],
          warn: ["`SCAN`은 중간에 키가 추가·삭제되면 결과에 중복이나 누락이 있을 수 있다. 애플리케이션에서 중복을 처리한다."],
          myth: [["SCAN은 KEYS와 결과가 완전히 같다.", "SCAN은 순회 중 키가 추가·삭제되면 중복이나 누락이 생길 수 있습니다. 애플리케이션에서 중복을 처리해야 합니다."]],
          answer: "단일 스레드 Redis에서 KEYS, 큰 컬렉션의 HGETALL, 동기 FLUSHALL, 긴 Lua 스크립트는 실행 내내 다른 모든 요청을 막습니다. KEYS 대신 커서로 나눠 훑는 SCAN을, 삭제는 UNLINK나 ASYNC 옵션을 씁니다. SLOWLOG로 느린 명령을 감시하고 ACL로 위험한 명령을 막아 둡니다.",
          followUps: [
            [
              "운영 중 특정 패턴의 키를 모두 지워야 하면 어떻게 하나요?",
              "SCAN에 MATCH와 COUNT를 주고 커서를 따라 조금씩 키를 모은 뒤 UNLINK로 나눠 지웁니다. 한 번에 몰아서 처리하지 않고 배치 사이에 짧은 간격을 둬 서비스 지연을 막습니다."
            ]
          ],
          related: ["cs/singgeul-seuredeu-ibenteu-rupeu", "cs/bikki-munje"]
        }
      ]
    }
  ]
};

export default topic;
